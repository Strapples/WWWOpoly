// models/generator.js
const mongoose = require('mongoose');

const generatorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Fedgen-1000', 'PowerMaximum A5000', 'Solar Generator'], required: true },
    level: { type: Number, default: 1 },
    fuelCapacity: { type: Number, default: 12 }, // Hours of operation on a full tank
    reliability: { type: Number, default: 50 },  // Reliability score for breakdown likelihood
    lastRefill: { type: Date, default: Date.now },
    nextMaintenance: { type: Date }, // Scheduled maintenance based on usage or breakdowns
    partsStatus: {                   // Tracks the health of generator parts
        fuelSystem: { type: Number, default: 100 },
        engine: { type: Number, default: 100 },
        battery: { type: Number, default: 100 },
        wiring: { type: Number, default: 100 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Generator', generatorSchema);