// models/globaleconomy.js
const mongoose = require('mongoose');

const globalEconomySchema = new mongoose.Schema({
    totalCreditsInCirculation: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    totalLinksClaimed: { type: Number, default: 0 },
    averageTollRate: { type: Number, default: 1 },  // Average toll rate across all links
    globalFund: { type: Number, default: 0 },       // Credits contributed by players to the shared fund
    lastEventTrigger: { type: Date, default: Date.now } // Timestamp for the last global event
}, { timestamps: true });

module.exports = mongoose.model('GlobalEconomy', globalEconomySchema);
