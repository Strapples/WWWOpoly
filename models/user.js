const mongoose = require('mongoose');
const crypto = require('crypto');
const { sendNotification } = require('../utils/notifications');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    credits: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    sitesOwned: { type: Number, default: 0 },
    upgradesMade: { type: Number, default: 0 },
    sitesVisited: { type: Number, default: 0 },
    tradesCount: { type: Number, default: 0 },
    creditsSpent: { type: Number, default: 0 },
    dailyTollsEarned: { type: Number, default: 0 },
    linksCreatedToday: { type: Number, default: 0 },
    linksVisitedToday: { type: Number, default: 0 },
    tradesMadeToday: { type: Number, default: 0 },
    dailyVisits: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    preferredLeaderboard: { type: [String], default: ['credits', 'sitesOwned'] },
    ratingsCount: { type: Number, default: 0 },
    achievements: [
        { title: String, description: String, unlockedAt: { type: Date, default: Date.now } }
    ],
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    weeklyMetrics: {
        sitesVisited: { type: Number, default: 0 },
        tollsCollected: { type: Number, default: 0 },
        tradesMade: { type: Number, default: 0 }
    },
    emailPreferences: {
        dailyDigest: { type: Boolean, default: true },
        achievementNotifications: { type: Boolean, default: true },
        marketplaceNotifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Utility function to generate a salt and hash the password
function generatePasswordHash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

// Middleware to hash the password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('passwordHash')) {
        const { salt, hash } = generatePasswordHash(this.passwordHash);
        this.salt = salt;
        this.passwordHash = hash;
    }
    next();
});

// Method to compare plain password with stored hashed password
userSchema.methods.isPasswordMatch = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
    console.log(`[isPasswordMatch] Comparing hash for ${this.email}`);
    return this.passwordHash === hash;
};

// Update reputation and send notification
userSchema.methods.updateReputation = async function(newRating) {
    this.reputation = ((this.reputation * this.ratingsCount) + newRating) / (this.ratingsCount + 1);
    this.ratingsCount += 1;
    await this.save();
    sendNotification(this._id, 'Reputation updated', 'Your reputation has been updated based on recent transactions.');
};

// Generate a referral code based on username and a random string
userSchema.methods.generateReferralCode = function() {
    return this.username + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Reset weekly metrics and send notification for tournament start
userSchema.methods.resetWeeklyMetrics = async function() {
    this.weeklyMetrics.sitesVisited = 0;
    this.weeklyMetrics.tollsCollected = 0;
    this.weeklyMetrics.tradesMade = 0;
    await this.save();
    sendNotification(this._id, 'New Tournament Started', 'Your weekly stats have been reset. Good luck in the new tournament!');
};

// Add achievement and notify user
userSchema.methods.addAchievement = async function(achievement) {
    this.achievements.push({
        title: achievement.title,
        description: achievement.description,
        unlockedAt: new Date()
    });
    await this.save();
    sendNotification(this._id, 'Achievement Unlocked', `Congratulations! You've unlocked the achievement: ${achievement.title}`);
};

// Add referral with notification
userSchema.methods.addReferral = async function(referredUserId) {
    this.referrals.push(referredUserId);
    await this.save();
    sendNotification(this._id, 'New Referral Added', 'You have successfully referred a new user and earned referral rewards.');
};

module.exports = mongoose.model('User', userSchema);