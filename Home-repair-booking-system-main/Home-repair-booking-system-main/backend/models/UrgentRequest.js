const mongoose = require("mongoose");

const urgentRequestSchema = new mongoose.Schema({
  issueType: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  status: {
    type: String,
    enum: ["pending", "assigned", "accepted", "completed"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UrgentRequest", urgentRequestSchema);
