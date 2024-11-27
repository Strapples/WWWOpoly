const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const { sendNotification } = require('../utils/notifications');
const achievements = require('../utils/achievements');
const Achievement = require('../models/Achievement');

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
        await checkAndUnlockAchievements(newUser);

        res.status(201).json({ userId: newUser._id, username: newUser.username });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ message: 'Error registering user', error });
    }
};

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
        console.error('Error generating referral code:', error.message);
        res.status(500).json({ message: 'Error generating referral code', error });
    }
};

const viewReferrals = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('referrals', 'username email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ referrals: user.referrals });
    } catch (error) {
        console.error('Error retrieving referrals:', error.message);
        res.status(500).json({ message: 'Error retrieving referrals', error });
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
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error.message);
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
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { username, email, avatar, preferredLeaderboard } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (preferredLeaderboard) user.preferredLeaderboard = preferredLeaderboard;

        await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                preferredLeaderboard: user.preferredLeaderboard,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// Check and unlock achievements
const checkAndUnlockAchievements = async (user) => {
    try {
        const unlockedAchievementIds = user.achievements.map((a) => a.achievementId);

        for (const achievement of achievements) {
            const { id, condition } = achievement;
            if (unlockedAchievementIds.includes(id)) continue;

            if (condition(user)) {
                const newAchievement = {
                    achievementId: id,
                    title: achievement.title,
                    description: achievement.description,
                    unlockedAt: new Date(),
                };

                await Achievement.create({ ...newAchievement, user: user._id });
                user.achievements.push(newAchievement);
            }
        }

        await user.save();
    } catch (error) {
        console.error('Error in checkAndUnlockAchievements:', error.message);
        throw error;
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

// Add this to the module.exports
module.exports = {
    // Other controllers
    uploadProfileImage,
};

// Unlock achievements for the user based on their current progress
const unlockAchievement = async (req, res) => {
    const { userId } = req.params;
    const { achievementId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Unlock the achievement if it hasn’t been unlocked yet
        const isAlreadyUnlocked = user.achievements.some((a) => a.achievementId === achievementId);
        if (isAlreadyUnlocked) {
            return res.status(400).json({ message: 'Achievement already unlocked' });
        }

        const achievement = achievements.find((a) => a.id === achievementId);
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        user.achievements.push({
            achievementId: achievement.id,
            title: achievement.title,
            description: achievement.description,
            unlockedAt: new Date(),
        });

        await user.save();

        res.status(200).json({ message: 'Achievement unlocked', achievement });
    } catch (error) {
        console.error('Error unlocking achievement:', error.message);
        res.status(500).json({ message: 'Error unlocking achievement', error });
    }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.params.id || req.user?._id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('achievements');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ achievements: user.achievements });
    } catch (error) {
        console.error("Error retrieving achievements:", error);
        res.status(500).json({ message: 'Error retrieving achievements', error });
    }
};

const getLeaderboard = async (req, res) => {
    const { metric } = req.query;
    const sortField = metric === 'credits' ? 'credits' : 'points';

    try {
        const leaderboard = await User.find()
            .sort({ [sortField]: -1 })
            .limit(10)
            .select('username credits points'); // Fetch only required fields
        res.status(200).json({ leaderboard, metric });
    } catch (error) {
        console.error('Error retrieving leaderboard:', error.message);
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};
const getUserStats = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select('credits points achievements');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ stats: user });
    } catch (error) {
        console.error('Error retrieving user stats:', error.message);
        res.status(500).json({ message: 'Error retrieving user stats', error });
    }
};
// Export all controllers
module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    unlockAchievement,
    getUserAchievements,
    checkAndUnlockAchievements,
    uploadProfileImage,
    generateReferralCode,
    viewReferrals,
    getLeaderboard,
    getUserStats,
};