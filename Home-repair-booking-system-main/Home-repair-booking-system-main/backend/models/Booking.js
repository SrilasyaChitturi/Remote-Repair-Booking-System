const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    // =========================
    // SERVICE DETAILS
    // =========================
    serviceName: {
      type: String,
      required: true,
      lowercase: true,
    },

    // =========================
    // USER & TECHNICIAN
    // =========================
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // assigned later
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // BOOKING INFO
    // =========================
    preferredDate: {
      type: Date,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    // =========================
    // 💰 DYNAMIC PRICING
    // =========================
    estimatedCost: {
      type: Number, // added by technician after inspection
    },

    finalCost: {
      type: Number, // approved by user
    },

    costApproved: {
      type: Boolean,
      default: false,
    },

    // =========================
    // STATUS FLOW
    // =========================
    status: {
      type: String,
      enum: [
        "pending", // booked, waiting for technician
        "accepted", // technician accepted
        "on_the_way", // technician travelling
        "arrived", // technician reached
        "completed", // job done
        "cancelled", // cancelled by user/admin
      ],
      default: "pending",
    },

    // =========================
    // 📍 TRACKING HISTORY
    // =========================
    trackingHistory: [
      {
        status: {
          type: String,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
