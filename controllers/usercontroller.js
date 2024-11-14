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

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email is already in use' });
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username is already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
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

exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
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
        const user = await User.findById(userId).select('username avatar points credits sitesOwned preferredLeaderboard');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};