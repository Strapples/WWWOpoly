// utils/dailydigest.js
const cron = require('node-cron');
const User = require('../models/user');
const nodemailer = require('nodemailer'); // Or another email service

// Set up Nodemailer (example configuration)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send the daily digest email
async function sendDailyDigestEmail(user) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Daily Activity Summary',
        text: `
            Hi ${user.username},
            
            Here is your activity summary for today:

            - Total visits to your links: ${user.dailyVisits}
            - Total tolls earned: ${user.dailyTollsEarned} credits

            Keep up the great work and check in tomorrow for more opportunities!

            Best,
            The WWWOpoly Team
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Daily digest sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send daily digest to ${user.email}:`, error);
    }
}

// Cron job to run daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily digest job...');
    const users = await User.find({ 'emailPreferences.dailyDigest': true });

    for (const user of users) {
        await sendDailyDigestEmail(user);
    }
    console.log('Daily digest job completed');
});
