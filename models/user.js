// models/user.js

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    credits: { type: Number, default: 0 },
    tradesCount: { type: Number, default: 0 },
    sitesOwned: { type: Number, default: 0 },
    sitesVisited: { type: Number, default: 0 },
    creditsSpent: { type: Number, default: 0 },
    upgradesMade: { type: Number, default: 0 },
    achievements: [achievementSchema]  // Store unlocked achievements
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);