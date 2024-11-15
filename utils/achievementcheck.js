// utils/achievementCheck.js
const achievements = require('./achievements');  // Import achievements from utils folder
const User = require('../models/user');          // Import User model to access user data
const notificationController = require('../controllers/notifcationcontroller'); // Import notification controller

// Function to check and award achievements
async function checkAchievements(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // List to keep track of newly unlocked achievements
        let newAchievements = [];

        achievements.forEach((achievement) => {
            // Check if user has already unlocked this achievement
            const alreadyUnlocked = user.achievements.some(ach => ach.id === achievement.id);

            // Check if the user meets the condition and hasn't unlocked this achievement
            if (!alreadyUnlocked && achievement.condition(user)) {
                // Add achievement to user's unlocked achievements
                user.achievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    unlockedAt: new Date()
                });

                newAchievements.push({
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description
                });

                // Send a notification for the newly unlocked achievement
                notificationController.createNotification(
                    userId,
                    `Achievement unlocked: ${achievement.title}! - ${achievement.description}`,
                    'achievement'
                );
            }
        });

        // Save user if any new achievements were unlocked
        if (newAchievements.length > 0) {
            await user.save();
        }

        // Return the list of new achievements (useful for notifying the user)
        return newAchievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
}

module.exports = checkAchievements;