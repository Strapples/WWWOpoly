const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { sendNotification } = require('../utils/notifications');

// Helper function to hash password
const hashPassword = (password) => {
    const salt = process.env.SALT || 'default_salt';
    return crypto.createHash('sha256').update(password + salt).digest('hex');
};

<<<<<<< HEAD
// Register a new user
const registerUser = async (req, res) => {
=======
const upload = multer({ storage, fileFilter });

// Register a new user with optional referral code
exports.registerUser = async (req, res) => {
>>>>>>> 6f96e03 (Add tournament and industry event routes; implement daily notification purge and achievement unlock notifications)
    const { username, email, password, referralCode } = req.body;

    try {
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email is already in use' });
        if (await User.findOne({ username })) return res.status(400).json({ message: 'Username is already in use' });

        const hashedPassword = hashPassword(password);
        const newUser = new User({ username, email, password: hashedPassword });

<<<<<<< HEAD
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
=======
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
>>>>>>> 6f96e03 (Add tournament and industry event routes; implement daily notification purge and achievement unlock notifications)
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};
const notificationController = require('./notificationcontroller');

exports.registerUser = async (req, res) => {
  
    if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
            referrer.credits += 100; // Reward for referral
            await referrer.save();
            notificationController.createNotification(referrer._id, `You referred a new user! You’ve earned 100 credits.`, 'referral');
        }
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

// View user profile
const getProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('username email credits points avatar');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ user });
    } catch (error) {
<<<<<<< HEAD
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};
=======
        res.status(500).json({ message: 'Error requesting password reset', error });
    }
};

// Other existing functions...
>>>>>>> 6f96e03 (Add tournament and industry event routes; implement daily notification purge and achievement unlock notifications)

// Update user profile
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { username, email, avatar } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
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

// Generate referral code
const generateReferralCode = async (req, res) => {
    const { userId } = req.params;

    try {
<<<<<<< HEAD
        const user = await User.findById(userId);
=======
        const user = await User.findById(userId).select('username avatar points credits sitesOwned preferredLeaderboard referralCode');
>>>>>>> 6f96e03 (Add tournament and industry event routes; implement daily notification purge and achievement unlock notifications)
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

<<<<<<< HEAD
// View referrals
const viewReferrals = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('referrals', 'username email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ referrals: user.referrals });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving referrals', error });
    }
};

// Unlock achievement
const unlockAchievement = async (req, res) => {
    const { userId } = req.params;
    const { title, description } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const achievement = { title, description, unlockedAt: new Date() };
        user.achievements.push(achievement);
        await user.save();
        sendNotification(user._id, 'Achievement Unlocked', `You unlocked the achievement: ${title}`);

        res.status(200).json({ message: 'Achievement unlocked', achievement });
    } catch (error) {
        res.status(500).json({ message: 'Error unlocking achievement', error });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    const { metric } = req.query;
    let sortField = metric === 'credits' ? 'credits' : 'points';

    try {
        const leaderboard = await User.find().sort({ [sortField]: -1 }).limit(10);
        res.json({ leaderboard, metric });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};

// Get user stats
const getUserStats = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('credits points achievements');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ stats: user });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user stats', error });
    }
};

// Export all controllers
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    uploadProfileImage,
    generateReferralCode,
    viewReferrals,
    unlockAchievement,
    getLeaderboard,
    getUserStats,
=======
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
>>>>>>> 6f96e03 (Add tournament and industry event routes; implement daily notification purge and achievement unlock notifications)
};