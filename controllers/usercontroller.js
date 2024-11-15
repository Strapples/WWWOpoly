// controllers/usercontroller.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sendNotification } = require('../utils/notifications');
const checkAchievements = require('../utils/achievementcheck');
const notificationController = require('../controllers/notificationcontroller');

// Configure multer for profile picture upload
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

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Function to handle profile image upload
exports.uploadProfileImage = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profileImage = req.file.path;
        await user.save();

        res.status(200).json({ message: 'Profile image uploaded successfully', profileImage: user.profileImage });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register a new user with optional referral code
exports.registerUser = async (req, res) => {
    const { username, email, password, referralCode } = req.body;

    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email is already in use' });
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username is already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        // If a referral code is provided, find the referrer and update their referral count
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referrer.credits += 100; // Reward for referral
                await referrer.save();
                notificationController.createNotification(referrer._id, `You referred a new user! You’ve earned 100 credits.`, 'referral');
            }
        }
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};
// Generate referral code for user
exports.generateReferralCode = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate a unique referral code if it doesn't exist
        if (!user.referralCode) {
            user.referralCode = crypto.randomBytes(4).toString('hex');
            await user.save();
        }

        res.status(200).json({ referralCode: user.referralCode });
    } catch (error) {
        res.status(500).json({ message: 'Error generating referral code', error });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Password reset
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset',
            text: `To reset your password, click the following link: http://yourapp.com/reset-password/${resetToken}`
        });

        res.json({ message: 'Password reset link sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting password reset', error });
    }
};

// Function to get user stats
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming user stats are stored in the user document
        res.status(200).json({ stats: user.stats });
    } catch (error) {
        console.error('Error retrieving user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update user profile
exports.updateProfile = async (req, res) => {
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

// Upload user profile picture
exports.uploadProfilePicture = async (req, res) => {
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

// Retrieve a user's profile
exports.getProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('username avatar points credits sitesOwned preferredLeaderboard referralCode');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

// Extended Get Leaderboard based on different metrics and time frames
exports.getLeaderboard = async (req, res) => {
    const { metric, timeFrame } = req.query;

    let sortField;
    switch (metric) {
        case 'points':
            sortField = 'points';
            break;
        case 'sitesOwned':
            sortField = 'sitesOwned';
            break;
        case 'credits':
            sortField = 'credits';
            break;
        case 'tradesCount':
            sortField = 'tradesCount';
            break;
        case 'sitesVisited':
            sortField = 'sitesVisited';
            break;
        case 'creditsSpent':
            sortField = 'creditsSpent';
            break;
        case 'creditsEarned':
            sortField = 'creditsEarned';
            break;
        case 'upgradesPerformed':
            sortField = 'upgradesPerformed';
            break;
        case 'achievementsUnlocked':
            sortField = 'achievementsUnlocked';
            break;
        default:
            return res.status(400).json({ message: 'Invalid leaderboard metric' });
    }

    let dateFilter = {};
    if (timeFrame) {
        const now = new Date();
        if (timeFrame === 'weekly') {
            dateFilter = { updatedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        } else if (timeFrame === 'monthly') {
            dateFilter = { updatedAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        } else {
            return res.status(400).json({ message: 'Invalid time frame specified' });
        }
    }

    try {
        const leaderboard = await User.find(dateFilter).sort({ [sortField]: -1 }).limit(10);
        res.json({ leaderboard, metric, timeFrame });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};