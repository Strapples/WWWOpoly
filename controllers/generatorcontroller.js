// controllers/generatorcontroller.js
const Generator = require('../models/generator');
const FuelInventory = require('../models/fuelinventory');
const MaintenanceLog = require('../models/maintenancelog');

// Consume fuel every 12 hours
exports.consumeFuel = async (userId) => {
    try {
        const generator = await Generator.findOne({ user: userId });
        const fuelInventory = await FuelInventory.findOne({ user: userId });

        const hoursElapsed = (Date.now() - generator.lastRefill) / (1000 * 60 * 60);
        if (hoursElapsed >= 12) {
            if (fuelInventory.fuelAmount >= generator.fuelCapacity) {
                // Consume fuel and update refill time
                fuelInventory.fuelAmount -= generator.fuelCapacity;
                generator.lastRefill = new Date();
                await fuelInventory.save();
                await generator.save();
            } else {
                // Not enough fuel, generator shuts down
                generator.isOperational = false;
                await generator.save();
            }
        }
    } catch (error) {
        console.error('Error consuming fuel:', error);
    }
};

// Refill fuel
exports.refillFuel = async (userId, amount) => {
    try {
        const fuelInventory = await FuelInventory.findOne({ user: userId });
        fuelInventory.fuelAmount += amount;
        await fuelInventory.save();
    } catch (error) {
        console.error('Error refilling fuel:', error);
    }
};

// Upgrade generator level
exports.upgradeGenerator = async (userId) => {
    try {
        const generator = await Generator.findOne({ user: userId });
        const upgradeCost = generator.level * 100; // Example cost calculation

        if (generator.level < 10) { // Max level is 10
            generator.level += 1;
            generator.fuelCapacity += 6; // Increase capacity per level
            generator.reliability += 5; // Increase reliability per level
            await generator.save();
        } else {
            console.log('Generator is at maximum level');
        }
    } catch (error) {
        console.error('Error upgrading generator:', error);
    }
};
// generator notifications
// Example notification for generator shutdown due to lack of fuel
exports.shutdownGeneratorDueToFuel = async (userId) => {
    await sendNotification(userId, 'Generator Shut Down', 'Your generator has shut down due to lack of fuel.');
};

// Notification for low fuel warning
exports.lowFuelWarning = async (userId) => {
    await sendNotification(userId, 'Low Fuel Warning', 'Your fuel level is low. Refill soon to keep your generator running.');
};

// Notification for completed upgrade or maintenance
exports.upgradeComplete = async (userId) => {
    await sendNotification(userId, 'Upgrade Complete', 'Your generator upgrade has been completed successfully.');
};

// Add other notification methods as needed based on events