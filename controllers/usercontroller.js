// controllers/usercontroller.js

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/user');

// Helper function to hash password without bcrypt
const hashPassword = (password) => {
    const salt = process.env.SALT || 'default_salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
};

// Multer configuration for profile image upload
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
                await referrer.save();
            }
        }

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', username: newUser.username });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const hashedPassword = hashPassword(password);
        if (hashedPassword !== user.password) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('username email credits points avatar');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

// Generate referral code for user
const generateReferralCode = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.referralCode) {
            user.referralCode = user.username + Math.random().toString(36).substring(2, 8).toUpperCase();
            await user.save();
        }

        res.status(200).json({ referralCode: user.referralCode });
    } catch (error) {
        res.status(500).json({ message: 'Error generating referral code', error });
    }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.file) {
            user.avatar = req.file.path;
            await user.save();
            res.status(200).json({ message: 'Profile image uploaded successfully', avatar: user.avatar });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error uploading profile image', error });
    }
};

// Get user referrals
const viewReferrals = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('referrals', 'username');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ referrals: user.referrals });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving referrals', error });
    }
};

// Get leaderboard based on a specific metric
const getLeaderboard = async (req, res) => {
    const { metric } = req.query;
    const validMetrics = ['credits', 'points', 'sitesOwned'];
    
    if (!validMetrics.includes(metric)) {
        return res.status(400).json({ message: 'Invalid leaderboard metric' });
    }

    try {
        const leaderboard = await User.find().sort({ [metric]: -1 }).limit(10);
        res.status(200).json({ leaderboard });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    getProfile,
    generateReferralCode,
    uploadProfileImage,
    viewReferrals,
    getLeaderboard,
    upload
};