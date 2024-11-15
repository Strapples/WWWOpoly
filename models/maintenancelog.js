// models/maintenancelog.js
const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
    generator: { type: mongoose.Schema.Types.ObjectId, ref: 'Generator', required: true },
    part: { type: String, required: true }, // Part that required maintenance
    repairCost: { type: Number, required: true },
    downtime: { type: Number, required: true }, // Downtime in hours
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);