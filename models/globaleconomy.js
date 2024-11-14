// models/globaleconomy.js
const mongoose = require('mongoose');

const globalEconomySchema = new mongoose.Schema({
    totalCreditsInCirculation: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    totalLinksClaimed: { type: Number, default: 0 },
    averageTollRate: { type: Number, default: 1 },  // Average toll rate across all links
    globalFund: { type: Number, default: 0 },       // Credits contributed by players to the shared fund
    lastEventTrigger: { type: Date, default: Date.now }, // Timestamp for the last global event

    // New fields for economy adjustments
    inflationRate: { type: Number, default: 1 },      // Global inflation rate affecting upgrade costs
    deflationRate: { type: Number, default: 1 },      // Global deflation rate for balance adjustments
    tollMultiplier: { type: Number, default: 1 },     // Multiplier affecting all toll rates
    upgradeCostMultiplier: { type: Number, default: 1 }, // Multiplier affecting all upgrade costs
    maintenanceFeeMultiplier: { type: Number, default: 1 }, // Multiplier for maintenance costs
    economyHealth: { type: String, default: 'stable' }, // Status of the economy (stable, inflationary, deflationary)
    economyEvents: [{                                  // Array of historical events affecting the economy
        eventName: String,
        effect: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Method to calculate adjustments based on activity
globalEconomySchema.methods.calculateAdjustments = function () {
    if (this.inflationRate > 1) {
        this.tollMultiplier *= this.inflationRate;
        this.upgradeCostMultiplier *= this.inflationRate;
    } else {
        this.maintenanceFeeMultiplier *= this.deflationRate;
    }
    this.lastEventTrigger = new Date();
};

// Method to add a new economy event
globalEconomySchema.methods.addEconomyEvent = function (eventName, effect) {
    this.economyEvents.push({ eventName, effect });
};

module.exports = mongoose.model('GlobalEconomy', globalEconomySchema);