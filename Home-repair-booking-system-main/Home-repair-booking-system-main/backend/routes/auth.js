const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/* ================= HELPER VALIDATIONS ================= */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

/* ================= SIGNUP ================= */

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      businessName,
      businessAddress,
      taxId,
      skills,
      lat,
      lng,
    } = req.body;

    /* 🔴 BASIC VALIDATIONS */
    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ msg: "Name must be at least 3 characters" });
    }

    if (!email || !isValidEmail(email)) {
      return res
        .status(400)
        .json({ msg: "Invalid email format" });
    }

    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters and include uppercase, lowercase and number",
      });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ msg: "Phone number must be 10 digits" });
    }

    /* 🔴 CHECK DUPLICATE EMAIL */
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "Email already registered" });
    }

    /* 🔧 TECHNICIAN VALIDATIONS */
    if (role === "technician") {
      if (!businessName || !businessName.trim()) {
        return res
          .status(400)
          .json({ msg: "Business name is required" });
      }

      if (!skills || skills.length === 0) {
        return res
          .status(400)
          .json({ msg: "At least one skill is required" });
      }

      if (lat == null || lng == null) {
        return res
          .status(400)
          .json({ msg: "Technician location required" });
      }
    }

    /* 🔐 PASSWORD HASH */
    const passwordHash = await bcrypt.hash(password, 10);

    /* 🧑 CREATE USER */
    const newUser = new User({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      phone,
      role: role || "user",
      skills: skills || [],
    });

    if (role === "technician") {
      newUser.businessName = businessName.trim();
      newUser.businessAddress = businessAddress;
      newUser.taxId = taxId;
      newUser.verified = false;
      newUser.location = {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      };
    }

    await newUser.save();

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(400).json({ msg: "Invalid credentials" });

    if (user.role === "technician" && !user.verified) {
      return res
        .status(403)
        .json({ msg: "Not verified by admin yet" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
