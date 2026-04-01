const express = require("express");
const router = express.Router();
const UrgentRequest = require("../models/UrgentRequest");
const User = require("../models/User");
const auth = require("../middlewares/auth");

/* ============================
   CREATE URGENT REQUEST (USER)
============================ */
router.post("/", async (req, res) => {
  try {
    const urgent = await UrgentRequest.create({
      issueType: req.body.issueType,
      description: req.body.description,
      address: req.body.address,
      phone: req.body.phone,
      status: "pending",
      technician: null,
    });

    res.status(201).json(urgent);
  } catch (err) {
    res.status(500).json({ message: "Failed to create urgent request" });
  }
});

/* ===============================
   GET URGENT REQUESTS FOR TECHNICIAN
================================ */
router.get("/tech/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const urgents = await UrgentRequest.find({
      technician: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(urgents);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch urgent jobs" });
  }
});

/* ===============================
   TECHNICIAN ACCEPT URGENT
================================ */
router.put("/tech/:id/accept", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const urgent = await UrgentRequest.findOne({
      _id: req.params.id,
      technician: req.user.id,
    });

    if (!urgent) {
      return res.status(404).json({ msg: "Urgent request not found" });
    }

    urgent.status = "accepted";
    await urgent.save();

    res.json({ msg: "Urgent request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Accept failed" });
  }
});


/* ===============================
   TECHNICIAN COMPLETE URGENT
================================ */
router.put("/tech/:id/complete", auth, async (req, res) => {
  try {
    if (req.user.role !== "technician") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const urgent = await UrgentRequest.findOne({
      _id: req.params.id,
      technician: req.user.id,
    });

    if (!urgent) {
      return res.status(404).json({ msg: "Urgent request not found" });
    }

    urgent.status = "completed";
    await urgent.save();

    res.json({ msg: "Urgent request completed" });
  } catch (err) {
    res.status(500).json({ msg: "Completion failed" });
  }
});

/* ============================
   GET ALL URGENT REQUESTS (ADMIN)
============================ */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const urgents = await UrgentRequest.find()
      .populate("technician", "name email")
      .sort({ createdAt: -1 });

    res.json(urgents);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch urgent requests" });
  }
});

/* ============================
   ASSIGN TECHNICIAN (ADMIN)
============================ */
router.put("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { technicianId } = req.body;

    const urgent = await UrgentRequest.findById(req.params.id);
    if (!urgent) {
      return res.status(404).json({ message: "Urgent request not found" });
    }

    urgent.technician = technicianId;
    urgent.status = "assigned";
    await urgent.save();

    res.json({ message: "Technician assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed" });
  }
});

module.exports = router;
