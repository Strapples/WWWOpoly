// CronJobs all

// Clean up expired notifications 
const cron = require('node-cron');
const { purgeExpiredNotifications } = require('./controllers/notificationcontroller');

// Run daily at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running daily notification purge...');
    purgeExpiredNotifications();
});

// Now the daily email job (at midnight too)
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
// Run the tournament controller every week
const tournamentController = require('../controllers/tournamentcontroller');

// Start a new tournament every Monday at midnight
cron.schedule('0 0 * * MON', async () => {
    await tournamentController.startNewTournament();
});

// End the tournament every Sunday at midnight
cron.schedule('59 23 * * SUN', async () => {
    await tournamentController.endTournament();
});

// utils/cronjobs.js (add this to the same cronjobs file)
cron.schedule('59 23 * * SUN', async () => { // Run every Sunday at 11:59 PM
    try {
        const topSitesVisited = await User.find().sort({ 'weeklyMetrics.sitesVisited': -1 }).limit(3);
        const topTollsCollected = await User.find().sort({ 'weeklyMetrics.tollsCollected': -1 }).limit(3);
        const topTradesMade = await User.find().sort({ 'weeklyMetrics.tradesMade': -1 }).limit(3);

        const rewards = { credits: 1000, points: 500 }; // Example rewards
        const categories = [
            { topUsers: topSitesVisited, category: 'Most Sites Visited' },
            { topUsers: topTollsCollected, category: 'Most Tolls Collected' },
            { topUsers: topTradesMade, category: 'Most Trades Made' },
        ];

        for (const { topUsers, category } of categories) {
            for (const user of topUsers) {
                user.credits += rewards.credits;
                user.points += rewards.points;
                await user.save();
                sendNotification(user._id, 'Tournament Reward', `Congratulations! You placed in the top 3 for "${category}" and earned ${rewards.credits} credits and ${rewards.points} points.`);
            }
        }

        console.log('Weekly tournament rewards distributed.');
    } catch (error) {
        console.error('Error distributing tournament rewards:', error);
    }
});
const IndustryEvent = require('../models/industryevent');

// Scheduler to deactivate expired events every hour
cron.schedule('0 * * * *', async () => { // Runs at the start of every hour
    const now = new Date();

    try {
        const expiredEvents = await IndustryEvent.updateMany(
            { endDate: { $lt: now }, isActive: true },
            { isActive: false }
        );

        if (expiredEvents.nModified > 0) {
            console.log(`Deactivated ${expiredEvents.nModified} expired events.`);
        }
    } catch (error) {
        console.error('Error deactivating expired events:', error);
    }
});
const { adjustInflation, applyMaintenanceFees } = require('../controllers/globaleconomycontroller');

// Schedule inflation adjustment every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily inflation adjustment...');
    await adjustInflation();
});

// Schedule maintenance fee application every week (Sunday at midnight)
cron.schedule('0 0 * * 0', async () => {
    console.log('Applying weekly maintenance fees...');
    await applyMaintenanceFees();
});
// Fuel checker
const Generator = require('../models/generator');
const FuelInventory = require('../models/fuelinventory');
const { sendNotification } = require('../utils/notifications');

// Run fuel consumption check every hour
cron.schedule('0 * * * *', async () => {
    try {
        const generators = await Generator.find({});

        for (const generator of generators) {
            const fuelInventory = await FuelInventory.findOne({ user: generator.user });
            
            // Check if 12 hours have elapsed since the last refill
            const hoursElapsed = (Date.now() - generator.lastRefill) / (1000 * 60 * 60);
            if (hoursElapsed >= 12) {
                if (fuelInventory.fuelAmount >= generator.fuelCapacity) {
                    // Deduct fuel and update last refill time
                    fuelInventory.fuelAmount -= generator.fuelCapacity;
                    generator.lastRefill = new Date();
                    await fuelInventory.save();
                    await generator.save();
                } else {
                    // Not enough fuel - send notification and shut down generator
                    generator.isOperational = false;
                    await generator.save();
                    await sendNotification(generator.user, 'Generator Shut Down', 'Your generator has shut down due to lack of fuel.');
                }
            }

            // Send a low fuel warning if fuel is below a threshold (e.g., less than 10 hours of fuel)
            if (fuelInventory.fuelAmount < 10) {
                await sendNotification(generator.user, 'Low Fuel Warning', 'Your fuel level is low. Refill soon to keep your generator running.');
            }
        }
    } catch (error) {
        console.error('Error running fuel consumption scheduler:', error);
    }
});

module.exports = cron;