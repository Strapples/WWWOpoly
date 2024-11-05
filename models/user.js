// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 100 },
    sitesOwned: { type: Number, default: 0 },
    tradesCount: { type: Number, default: 0 },
    sitesVisited: { type: Number, default: 0 },
    creditsSpent: { type: Number, default: 0 },
    upgradesMade: { type: Number, default: 0 },
    achievements: { type: [String], default: [] },  // Unlocked achievements by ID
    
    // Email Preferences: stores user notification settings as an object
    emailPreferences: {
        dailyMissions: { type: Boolean, default: true },     // Notify about daily missions
        achievements: { type: Boolean, default: true },      // Notify when achievements are unlocked
        tradeNotifications: { type: Boolean, default: true }, // Notify about trades or site visits
        dailyDigest: { type: Boolean, default: true }        // Daily summary of link activity
    },

    // Daily Mission Progress Tracking
    linksCreatedToday: { type: Number, default: 0 },
    linksVisitedToday: { type: Number, default: 0 },
    tradesMadeToday: { type: Number, default: 0 },
    deadLinksReportedToday: { type: Number, default: 0 },

    // Last Daily Reset Timestamp (in UTC)
    dailyReset: { type: Date, default: new Date(Date.UTC(1970, 0, 1)) } // Initialized to epoch time
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to check if daily missions need to be reset (using UTC)
userSchema.methods.resetDailyMissions = async function () {
    const nowUTC = new Date(Date.now());
    const lastReset = this.dailyReset;
    const isSameDay = (
        nowUTC.getUTCFullYear() === lastReset.getUTCFullYear() &&
        nowUTC.getUTCMonth() === lastReset.getUTCMonth() &&
        nowUTC.getUTCDate() === lastReset.getUTCDate()
    );

    if (!isSameDay) {
        // Reset daily mission fields
        this.linksCreatedToday = 0;
        this.linksVisitedToday = 0;
        this.tradesMadeToday = 0;
        this.deadLinksReportedToday = 0;

        // Update the dailyReset timestamp to the current date
        this.dailyReset = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));
        await this.save();
    }
};

module.exports = mongoose.model('User', userSchema);
