const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true }
});

module.exports = mongoose.model('Service', ServiceSchema);
