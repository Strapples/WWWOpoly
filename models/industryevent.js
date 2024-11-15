// models/industryevent.js
const mongoose = require('mongoose');

const industryEventSchema = new mongoose.Schema({
    category: { type: String, required: true },                 // Industry category affected by the event (e.g., "Fashion", "Tech")
    effectType: { type: String, required: true },               // Type of effect (e.g., "visitorBoost", "tollIncrease")
    effectMultiplier: { type: Number, required: true },         // Multiplier effect (e.g., 1.25 for 25% increase)
    startDate: { type: Date, required: true },                  // When the event starts
    endDate: { type: Date, required: true },                    // When the event ends
    isActive: { type: Boolean, default: true },                 // Whether the event is currently active
    description: { type: String, default: '' }                  // Optional description for the event
}, { timestamps: true });

module.exports = mongoose.model('IndustryEvent', industryEventSchema);