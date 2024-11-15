// controllers/usercontroller.js

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/user');
const { sendNotification } = require('../utils/notifications');

// Helper function to hash password
const hashPassword = (password) => {
    const salt = process.env.SALT || 'default_salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
};

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, referralCode } = req.body;

    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email is already in use' });
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username is already in use' });

        const hashedPassword = hashPassword(password);
        const newUser = new User({ username, email, password: hashedPassword });

        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referrer.credits += 100;
                referrer.referrals.push(newUser._id);
                await referrer.save();
                sendNotification(referrer._id, 'Referral Bonus', 'You have earned 100 credits for referring a new user.');
            }
        }

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', username: newUser.username });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== hashPassword(password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { preferredLeaderboard } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (preferredLeaderboard) user.preferredLeaderboard = preferredLeaderboard;
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('username avatar points credits sitesOwned preferredLeaderboard referralCode achievements');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/avatars';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Upload profile image
const uploadProfileImage = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.file) {
            user.avatar = req.file.path;
            await user.save();
            res.status(200).json({ message: 'Profile picture uploaded successfully', user });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile picture', error });
    }
};

// Generate referral code
const generateReferralCode = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.referralCode) {
            user.referralCode = crypto.randomBytes(4).toString('hex');
            await user.save();
        }

        res.status(200).json({ referralCode: user.referralCode });
    } catch (error) {
        res.status(500).json({ message: 'Error generating referral code', error });
    }
};

// Unlock achievement
const unlockAchievement = async (req, res) => {
    const { userId } = req.params;
    const { title, description } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.achievements.push({ title, description, unlockedAt: new Date() });
        await user.save();

        sendNotification(userId, 'Achievement Unlocked', `Congrats! You've unlocked the achievement: ${title}`);
        res.status(200).json({ message: 'Achievement unlocked successfully', achievements: user.achievements });
    } catch (error) {
        res.status(500).json({ message: 'Error unlocking achievement', error });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    const { metric, timeFrame } = req.query;

    let sortField;
    switch (metric) {
        case 'points': sortField = 'points'; break;
        case 'credits': sortField = 'credits'; break;
        case 'sitesOwned': sortField = 'sitesOwned'; break;
        default: return res.status(400).json({ message: 'Invalid leaderboard metric' });
    }

    let dateFilter = {};
    if (timeFrame === 'weekly') {
        dateFilter = { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeFrame === 'monthly') {
        dateFilter = { updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    try {
        const leaderboard = await User.find(dateFilter).sort({ [sortField]: -1 }).limit(10);
        res.json({ leaderboard, metric, timeFrame });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    getProfile,
    uploadProfileImage,
    generateReferralCode,
    unlockAchievement,
    getLeaderboard,
    upload
};