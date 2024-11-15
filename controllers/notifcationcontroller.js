// controllers/notificationcontroller.js
const Notification = require('../models/notification');
const User = require('../models/user');

// Function to send notifications to users
exports.sendNotification = async (userId, title, message) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            // Logic to send notification (e.g., email, push notification)
            console.log(`Notification sent to ${user.email}: ${title} - ${message}`);
        } else {
            console.log(`User with ID ${userId} not found.`);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

// Function to get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming notifications are stored in the user document
        res.status(200).json({ notifications: user.notifications });
    } catch (error) {
        console.error('Error retrieving user notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();
        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
    const { userId } = req.params;

    try {
        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error });
    }
};

// Function to purge expired notifications
exports.purgeExpiredNotifications = async () => {
    try {
        const users = await User.find();

        for (const user of users) {
            user.notifications = user.notifications.filter(notification => {
                const expirationDate = new Date(notification.expirationDate);
                return expirationDate > new Date();
            });

            await user.save();
        }

        console.log('Expired notifications purged.');
    } catch (error) {
        console.error('Error purging expired notifications:', error);
    }
};