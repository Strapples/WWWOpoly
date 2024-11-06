
const cron = require('node-cron');
const GlobalEconomy = require('../models/globaleconomy'); // Store daily modifiers here

cron.schedule('0 0 * * *', async () => { // Every day at midnight
    const categories = ['News', 'Sports', 'Education', 'Entertainment', 'Shopping'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // Determine if it's a surge or reduction
    const isSurge = Math.random() < 0.5; // 50% chance for surge or reduction
    const multiplier = isSurge
        ? (1.25 + Math.random() * 0.75) // Surge: random multiplier between 1.25x to 2x
        : (0.25 + Math.random() * 0.75); // Reduction: random multiplier between 0.25x to 1x

    // Save to global economy model
    await GlobalEconomy.findOneAndUpdate({}, {
        dailyCategory: randomCategory,
        dailyMultiplier: multiplier,
        isSurge
    }, { upsert: true });

    console.log(`Daily ${isSurge ? 'Traffic Surge' : 'Reduced Traffic'} for ${randomCategory}: ${multiplier}x`);
});
