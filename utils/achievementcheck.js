const achievements = require('./achievements');  // Import achievements
const notificationController = require('../controllers/notificationcontroller'); // Notifications

// Function to check and award achievements
async function checkAchievements(user) {
    try {
        if (!user) {
            throw new Error('User object is required');
        }

        // Track newly unlocked achievements
        const newAchievements = [];

        // Iterate through all achievements
        achievements.forEach((achievement) => {
            // Check if the achievement is already unlocked
            const alreadyUnlocked = user.achievements.some(
                (ach) => ach.id === achievement.id
            );

            // Unlock if conditions are met and not already unlocked
            if (!alreadyUnlocked && achievement.condition(user)) {
                // Add achievement to user's list
                const unlockedAchievement = {
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    unlockedAt: new Date(),
                };

                user.achievements.push(unlockedAchievement);
                newAchievements.push(unlockedAchievement);

                // Send notification for unlocked achievement
                notificationController.createNotification(
                    user.id,
                    `Achievement unlocked: ${achievement.title} - ${achievement.description}`,
                    'achievement'
                );
            }
        });

        // Save the user only if new achievements were unlocked
        if (newAchievements.length > 0) {
            await user.save();
        }

        return newAchievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        throw error;
    }
}

module.exports = checkAchievements;