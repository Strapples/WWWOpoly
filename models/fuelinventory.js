// models/fuelinventory.js
const mongoose = require('mongoose');

const fuelInventorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fuelAmount: { type: Number, default: 0 } // Amount of fuel available for the user
}, { timestamps: true });

module.exports = mongoose.model('FuelInventory', fuelInventorySchema);