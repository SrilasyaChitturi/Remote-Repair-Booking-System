const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // =========================
  // BASIC USER INFO
  // =========================
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "technician", "admin"],
    default: "user",
  },

  phone: {
    type: String,
  },
  // =========================
  // 🔔 NOTIFICATION TOKEN
  // =========================
  fcmToken: {
    type: String,
  },

  // =========================
  // TECHNICIAN-SPECIFIC INFO
  // =========================
  businessName: {
    type: String,
  },

  businessAddress: {
    type: String,
  },

  taxId: {
    type: String,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  skills: {
    type: [String], // ["ac", "plumbing", "electrical"]
    default: [],
  },

  // =========================
  // 📍 GEO LOCATION (CRITICAL)
  // =========================
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: function () {
        return this.role === "technician";
      },
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: function () {
        return this.role === "technician";
      },
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * 🔥 VERY IMPORTANT
 * Enables nearest-technician queries
 */
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
