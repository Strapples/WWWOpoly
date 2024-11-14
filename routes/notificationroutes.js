// routes/notificationroutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationcontroller');

// Get all notifications for a user (with optional filter by read status)
router.get('/:userId', notificationController.getUserNotifications);

// Mark a specific notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read for a user
router.put('/:userId/markAllRead', notificationController.markAllAsRead);

module.exports = router;