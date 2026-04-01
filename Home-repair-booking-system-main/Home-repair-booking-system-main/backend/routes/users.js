const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

/* =====================================================
   ADMIN – GET ALL TECHNICIANS (USED IN ADMIN DASHBOARD
   + URGENT ASSIGNMENT DROPDOWN)
===================================================== */
router.get("/technicians/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const technicians = await User.find({ role: "technician" });

    res.json(technicians);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch technicians" });
  }
});


/* =====================================================
   ADMIN – VERIFY / UNVERIFY TECHNICIAN
===================================================== */
router.put("/technicians/:id/verify", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const tech = await User.findById(req.params.id);
    if (!tech || tech.role !== "technician") {
      return res.status(404).json({ msg: "Technician not found" });
    }

    tech.verified = req.body.verified;
    await tech.save();

    res.json({ msg: "Technician updated", tech });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Verification update failed" });
  }
});

/* =====================================================
   GET NEARBY TECHNICIANS (FOR BOOKING FLOW)
===================================================== */
router.get("/technicians/nearby", async (req, res) => {
  try {
    let { service, lat, lng, maxDistance = 30000 } = req.query;

    lat = Number(lat);
    lng = Number(lng);
    service = service?.toLowerCase();

    if (!service || isNaN(lat) || isNaN(lng)) {
      return res.json([]);
    }

    const technicians = await User.find({
      role: "technician",
      verified: true,
      skills: { $in: [service] },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat], // IMPORTANT: lng first
          },
          $maxDistance: Number(maxDistance),
        },
      },
    }).select("_id name skills location");

    res.json(technicians);
  } catch (err) {
    console.error("NEARBY TECH ERROR:", err);
    res.json([]);
  }
});

/* =====================================================
   SAVE FCM TOKEN (TECHNICIAN NOTIFICATIONS)
===================================================== */
router.post("/save-token", auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: "Token missing" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      fcmToken: token,
    });

    res.json({ msg: "Token saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to save token" });
  }
});

module.exports = router;
