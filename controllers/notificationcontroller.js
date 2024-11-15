// controllers/notificationcontroller.js
const Notification = require('../models/notification');

// Send a new notification
exports.sendNotification = async (userId, message, type = 'general', expiresAt = null) => {
    try {
        const notification = new Notification({ userId, message, type, expiresAt });
        await notification.save();
        console.log(`Notification sent to user ${userId}: ${message}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

// Get all notifications for a user (optionally filter by read/unread)
exports.getUserNotifications = async (req, res) => {
    const { userId } = req.params;
    const { readStatus } = req.query; // Use query params for filtering, e.g., /notifications?readStatus=false

    try {
        const filter = { userId };
        if (readStatus !== undefined) {
            filter.read = readStatus === 'true';
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
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

// Purge expired notifications
exports.purgeExpiredNotifications = async () => {
    try {
        const now = new Date();
        const result = await Notification.deleteMany({ expiresAt: { $lte: now } });
        console.log(`Purged ${result.deletedCount} expired notifications`);
    } catch (error) {
        console.error('Error purging expired notifications:', error);
    }
};