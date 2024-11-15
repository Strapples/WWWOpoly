const cron = require('node-cron');
const Generator = require('../models/generator');
const FuelInventory = require('../models/fuelinventory');
const { sendNotification } = require('../utils/notifications');

// Only run this scheduler if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    // Run fuel consumption check every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running fuel consumption check...');
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
                        console.log(`Generator for user ${generator.user} refueled.`);
                    } else {
                        // Not enough fuel - send notification and shut down generator
                        generator.isOperational = false;
                        await generator.save();
                        await sendNotification(generator.user, 'Generator Shut Down', 'Your generator has shut down due to lack of fuel.');
                        console.log(`Generator for user ${generator.user} shut down due to low fuel.`);
                    }
                }

                // Send a low fuel warning if fuel is below a threshold (e.g., less than 10 hours of fuel)
                if (fuelInventory.fuelAmount < 10) {
                    await sendNotification(generator.user, 'Low Fuel Warning', 'Your fuel level is low. Refill soon to keep your generator running.');
                    console.log(`Low fuel warning sent to user ${generator.user}.`);
                }
            }
        } catch (error) {
            console.error('Error running fuel consumption scheduler:', error);
        }
    });
}