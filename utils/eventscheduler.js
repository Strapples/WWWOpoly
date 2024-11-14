// utils/eventscheduler.js
const cron = require('node-cron');
const IndustryEvent = require('../models/industryevent');

cron.schedule('0 0 * * *', async () => {
    const categories = ['fashion', 'technology', 'health']; // Add more as needed
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const boostOrPenalty = Math.random() > 0.5 ? 'boost' : 'penalty';
    const multiplier = boostOrPenalty === 'boost' ? 1.25 : 0.85; // Adjust values as needed

    const newEvent = new IndustryEvent({
        category: randomCategory,
        effectType: boostOrPenalty,
        effectMultiplier: multiplier,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Lasts for 1 day
    });

    await newEvent.save();
    console.log(`New event: ${boostOrPenalty} for ${randomCategory} with multiplier ${multiplier}`);
});

cron.schedule('0 * * * *', async () => { // Runs every hour
    const now = new Date();
    await IndustryEvent.updateMany({ endDate: { $lt: now } }, { isActive: false });
    console.log('Expired events deactivated');
});