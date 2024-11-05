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
    emailPreferences: { type: Object, default: { notifications: true, marketing: true } } // Email settings
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);