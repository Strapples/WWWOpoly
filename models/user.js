// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { sendNotification } = require('../utils/notifications'); // Import notification utility

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    credits: { type: Number, default: 0 },          // In-game currency
    points: { type: Number, default: 0 },           // Additional in-game points
    sitesOwned: { type: Number, default: 0 },       // Number of links owned
    upgradesMade: { type: Number, default: 0 },     // Number of upgrades made
    sitesVisited: { type: Number, default: 0 },     // Number of sites visited
    tradesCount: { type: Number, default: 0 },      // Total trades made
    creditsSpent: { type: Number, default: 0 },     // Total credits spent in the game
    dailyTollsEarned: { type: Number, default: 0 }, // Daily toll earnings
    linksCreatedToday: { type: Number, default: 0 },// Links created today (daily mission tracking)
    linksVisitedToday: { type: Number, default: 0 },// Links visited today (daily mission tracking)
    tradesMadeToday: { type: Number, default: 0 },  // Trades made today (daily mission tracking)
    dailyVisits: { type: Number, default: 0 },      // Daily link visits count
    reputation: { type: Number, default: 0 },       // Seller reputation rating (for marketplace)
    avatar: { type: String, default: '' },          // Avatar URL
    preferredLeaderboard: { type: [String], default: ['credits', 'sitesOwned'] }, // Preferred leaderboard stats
    ratingsCount: { type: Number, default: 0 },     // Number of ratings received
    achievements: [{                                // Array of achievements unlocked by the user
        title: String,
        description: String,
        unlockedAt: { type: Date, default: Date.now }
    }],
    referralCode: { type: String, unique: true },   // Unique referral code for each user
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referring user's ID
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of referred users
    weeklyMetrics: {                                // Weekly metrics for tournament tracking
        sitesVisited: { type: Number, default: 0 },
        tollsCollected: { type: Number, default: 0 },
        tradesMade: { type: Number, default: 0 }
    },
    emailPreferences: {                             // Email preferences for notifications
        dailyDigest: { type: Boolean, default: true },
        achievementNotifications: { type: Boolean, default: true },
        marketplaceNotifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password validation method
userSchema.methods.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
};

// Method to update reputation with a notification
userSchema.methods.updateReputation = async function(newRating) {
    this.reputation = ((this.reputation * this.ratingsCount) + newRating) / (this.ratingsCount + 1);
    this.ratingsCount += 1;
    await this.save();
    sendNotification(this._id, 'Reputation updated', `Your reputation has been updated based on recent transactions.`);
};

// Method to generate a unique referral code
userSchema.methods.generateReferralCode = function () {
    return this.username + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Method to reset weekly metrics with a notification for tournament start
userSchema.methods.resetWeeklyMetrics = async function () {
    this.weeklyMetrics.sitesVisited = 0;
    this.weeklyMetrics.tollsCollected = 0;
    this.weeklyMetrics.tradesMade = 0;
    await this.save();
    sendNotification(this._id, 'New Tournament Started', 'Your weekly stats have been reset. Good luck in the new tournament!');
};

// Method to handle achievements with notifications
userSchema.methods.addAchievement = async function(achievement) {
    this.achievements.push({
        title: achievement.title,
        description: achievement.description,
        unlockedAt: new Date()
    });
    await this.save();
    sendNotification(this._id, 'Achievement Unlocked', `Congratulations! You've unlocked the achievement: ${achievement.title}`);
};

// Method to handle referrals with notifications
userSchema.methods.addReferral = async function(referredUserId) {
    this.referrals.push(referredUserId);
    await this.save();
    sendNotification(this._id, 'New Referral Added', 'You have successfully referred a new user and earned referral rewards.');
};

module.exports = mongoose.model('User', userSchema);