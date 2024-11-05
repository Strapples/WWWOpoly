// controllers/usercontroller.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendNotification } = require('../utils/notifications');

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if email or username is already taken
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email is already in use' });
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username is already in use' });

        const newUser = new User({ username, email, password });
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

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Generate password reset token and send email
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send email (using nodemailer)
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

// Reset password
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

// Update user email notification preferences
exports.updateEmailPreferences = async (req, res) => {
    const { userId, emailPreferences } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { emailPreferences }, { new: true });
        res.json({ message: 'Email preferences updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating email preferences', error });
    }
};

// Get leaderboard based on different metrics
exports.getLeaderboard = async (req, res) => {
    const { metric } = req.query; // Pass the metric as a query parameter (e.g., points, sitesOwned, tradesCount, etc.)

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
        default:
            return res.status(400).json({ message: 'Invalid leaderboard metric' });
    }

    try {
        const leaderboard = await User.find().sort({ [sortField]: -1 }).limit(10);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};