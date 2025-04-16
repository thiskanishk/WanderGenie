const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budget: { type: String },
  tripType: { type: String },
  currency: { type: String },
  distanceUnit: { type: String },
  interests: [{ type: String }],
}, { timestamps: true });

const Preference = mongoose.model('Preference', preferenceSchema);

module.exports = Preference;