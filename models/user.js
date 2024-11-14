// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Method to update reputation
userSchema.methods.updateReputation = async function(newRating) {
    this.reputation = ((this.reputation * this.ratingsCount) + newRating) / (this.ratingsCount + 1);
    this.ratingsCount += 1;
    await this.save();
};

module.exports = mongoose.model('User', userSchema);