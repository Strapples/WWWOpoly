// models/industryevent.js
const mongoose = require('mongoose');

const industryEventSchema = new mongoose.Schema({
    category: { type: String, required: true }, // e.g., "fashion", "technology"
    effectType: { type: String, required: true, enum: ['boost', 'penalty'] },
    effectMultiplier: { type: Number, required: true }, // e.g., 1.25 for a 25% boost
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true }, // When the event ends
    isActive: { type: Boolean, default: true }, // Used to check if the event is currently active
});

module.exports = mongoose.model('IndustryEvent', industryEventSchema);