const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middlewares/auth");
const admin = require("../firebase"); // firebase admin init file
const User = require("../models/User");


/* =====================================================
   CREATE BOOKING (USER)
===================================================== */
router.post("/", auth, async (req, res) => {
  try {
    const booking = new Booking({
      serviceName: req.body.serviceName.toLowerCase(),
      technician: req.body.technician || null,
      preferredDate: req.body.preferredDate,
      address: req.body.address,
      user: req.user.id,
      status: "pending",
      trackingHistory: [{ status: "pending" }],
    });

    await booking.save();

    /* 🔔 SEND NOTIFICATION TO TECHNICIAN */
    if (booking.technician) {
      const tech = await User.findById(booking.technician);

      if (tech?.fcmToken) {
        await admin.messaging().send({
          token: tech.fcmToken,
          notification: {
            title: "New Booking Request 🚨",
            body: `New ${booking.serviceName} booking received`,
          },
        });
      }
    }

    res.status(201).json(booking);

  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Booking validation failed" });
  }
});

/* =====================================================
   USER DASHBOARD – MY BOOKINGS
===================================================== */
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("technician", "name phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch {
    res.status(500).json({ msg: "Failed to fetch user bookings" });
  }
});

/* =====================================================
   TECHNICIAN DASHBOARD
===================================================== */
router.get("/tech", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const bookings = await Booking.find({ technician: req.user.id })
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch technician bookings" });
  }
});

/* =====================================================
   TECHNICIAN ACCEPT BOOKING
===================================================== */
router.put("/:id/accept", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.technician = req.user.id;
    booking.status = "accepted";
    booking.trackingHistory.push({ status: "accepted" });

    await booking.save();
    res.json(booking);
  } catch {
    res.status(500).json({ msg: "Failed to accept booking" });
  }
});

/* =====================================================
   TECHNICIAN REJECT BOOKING
===================================================== */
router.put("/:id/reject", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.technician = null;
    booking.status = "pending";
    booking.trackingHistory.push({ status: "pending" });

    await booking.save();
    res.json({ msg: "Booking rejected", booking });
  } catch {
    res.status(500).json({ msg: "Failed to reject booking" });
  }
});

/* =====================================================
   TECHNICIAN ADD ESTIMATED COST
===================================================== */
router.put("/:id/add-cost", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { estimatedCost } = req.body;
    if (!estimatedCost) {
      return res.status(400).json({ msg: "Estimated cost required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.technician?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your booking" });
    }

    booking.estimatedCost = Number(estimatedCost);
    booking.costApproved = false;

    await booking.save();
    res.json({ msg: "Cost added", booking });
  } catch {
    res.status(500).json({ msg: "Failed to add cost" });
  }
});

/* =====================================================
   USER APPROVE COST
===================================================== */
router.put("/:id/approve-cost", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (!booking.estimatedCost) {
      return res.status(400).json({ msg: "No cost added yet" });
    }

    booking.finalCost = booking.estimatedCost;
    booking.costApproved = true;

    await booking.save();
    res.json({ msg: "Cost approved", booking });
  } catch {
    res.status(500).json({ msg: "Failed to approve cost" });
  }
});

/* =====================================================
   TECHNICIAN UPDATE STATUS (on_the_way / arrived)
===================================================== */
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { status } = req.body;
    const allowed = ["on_the_way", "arrived"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.technician?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your booking" });
    }

    booking.status = status;
    booking.trackingHistory.push({ status });

    await booking.save();
    res.json(booking);
  } catch {
    res.status(500).json({ msg: "Failed to update status" });
  }
});

/* =====================================================
   TECHNICIAN COMPLETE BOOKING
===================================================== */
router.put("/:id/complete", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.technician?.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your booking" });
    }

    if (!booking.costApproved) {
      return res.status(400).json({ msg: "Cost not approved by user" });
    }

    booking.status = "completed";
    booking.trackingHistory.push({ status: "completed" });

    await booking.save();
    res.json(booking);
  } catch {
    res.status(500).json({ msg: "Failed to complete booking" });
  }
});

/* =====================================================
   USER CANCEL BOOKING
===================================================== */
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ msg: "Cannot cancel now" });
    }

    booking.status = "cancelled";
    booking.trackingHistory.push({ status: "cancelled" });

    await booking.save();
    res.json(booking);
  } catch {
    res.status(500).json({ msg: "Failed to cancel booking" });
  }
});

/* =====================================================
   GET SINGLE BOOKING (DETAILS)
===================================================== */
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("technician", "name phone")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const userId = req.user.id.toString();

    const isOwner =
      booking.user._id.toString() === userId ||
      booking.user.toString() === userId;

    const isTechnician =
      booking.technician &&
      (booking.technician._id?.toString() === userId ||
        booking.technician.toString() === userId);

    if (!isOwner && !isTechnician && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    res.json(booking);
  } catch {
    res.status(500).json({ msg: "Failed to fetch booking" });
  }
});

module.exports = router;
