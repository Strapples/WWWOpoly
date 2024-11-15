// utils/notifications.js
const nodemailer = require('nodemailer');
const Notification = require('../models/notification'); // Import the Notification model for in-app notifications

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another SMTP service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send an email notification
exports.sendEmailNotification = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`Email notification sent to ${to}`);
    } catch (error) {
        console.error('Error sending email notification:', error);
    }
};

// Send an in-app notification
exports.sendInAppNotification = async (userId, title, message) => {
    try {
        const notification = new Notification({
            user: userId,
            title,
            message,
            read: false
        });
        await notification.save();
        console.log(`In-app notification sent to user ID ${userId}`);
    } catch (error) {
        console.error('Error sending in-app notification:', error);
    }
};

// Unified notification sender that can send both email and in-app notifications
exports.sendNotification = async (userId, email, subject, text, title, message) => {
    // Send email notification
    if (email && subject && text) {
        await exports.sendEmailNotification(email, subject, text);
    }

    // Send in-app notification
    if (userId && title && message) {
        await exports.sendInAppNotification(userId, title, message);
    }
};