// controllers/globaleconomycontroller.js
const Link = require('../models/link');
const User = require('../models/user');
const GlobalEconomy = require('../models/globaleconomy');
const { sendNotification } = require('../utils/notifications');

// Adjust toll rates based on link demand
const adjustTollRates = async () => {
    try {
        const links = await Link.find();
        const globalEconomy = await GlobalEconomy.findOne();

        links.forEach(async (link) => {
            if (link.dailyVisits > 50) { // High-demand threshold
                link.toll *= 1.1; // Increase toll by 10%
            } else if (link.dailyVisits < 5) { // Low-demand threshold
                link.toll *= 0.9; // Decrease toll by 10%
            }
            await link.save();
        });

        // Update average toll rate
        globalEconomy.averageTollRate = links.reduce((sum, link) => sum + link.toll, 0) / links.length;
        await globalEconomy.save();
    } catch (error) {
        console.error('Error adjusting toll rates:', error);
    }
};

// Adjust economy state based on total credits in circulation
const adjustEconomyState = async () => {
    try {
        const globalEconomy = await GlobalEconomy.findOne();
        const users = await User.find();

        // Calculate total credits in circulation
        const totalCredits = users.reduce((sum, user) => sum + user.credits, 0);

        // Adjust economy state based on total credits
        if (totalCredits > 1000000) { // Example threshold
            globalEconomy.state = 'inflation';
        } else if (totalCredits < 500000) { // Example threshold
            globalEconomy.state = 'deflation';
        } else {
            globalEconomy.state = 'stable';
        }

        await globalEconomy.save();
    } catch (error) {
        console.error('Error adjusting economy state:', error);
    }
};

// Apply maintenance fees on high-level links owned by users
const applyMaintenanceFees = async () => {
    try {
        const users = await User.find();
        const globalEconomy = await GlobalEconomy.findOne();

        for (const user of users) {
            const highLevelLinks = await Link.find({ owner: user._id, level: { $gte: 5 } });
            const maintenanceFee = highLevelLinks.length * globalEconomy.maintenanceFeeMultiplier;

            if (maintenanceFee > 0) {
                if (user.credits >= maintenanceFee) {
                    user.credits -= maintenanceFee;
                    await user.save();
                } else {
                    await sendNotification(
                        user._id,
                        'Maintenance Fee Unpaid',
                        `You do not have enough credits to pay the maintenance fee of ${maintenanceFee} credits. Your high-level links are at risk.`
                    );
                }
            }
        }

        console.log('Maintenance fees applied to users with high-level links.');
    } catch (error) {
        console.error('Error applying maintenance fees:', error);
    }
};

// Calculate upgrade cost based on the economy state
const calculateUpgradeCost = async (link) => {
    const globalEconomy = await GlobalEconomy.findOne();
    let baseCost = link.level * 2; // Base upgrade cost

    if (globalEconomy.economyState === 'Inflationary') {
        baseCost *= globalEconomy.inflationRate; // Adjust for inflation
    } else if (globalEconomy.economyState === 'Deflationary') {
        baseCost *= globalEconomy.deflationRate; // Adjust for deflation
    }

    return baseCost;
};

// Calculate dynamic link claim cost based on total claimed links
const calculateClaimCost = async () => {
    const totalLinks = await Link.countDocuments();
    let baseCost = 10;

    if (totalLinks > 5000) {
        baseCost *= 1.5; // Increase cost by 50% if many links are claimed
    } else if (totalLinks < 1000) {
        baseCost *= 0.75; // Decrease cost by 25% if few links are claimed
    }

    return Math.ceil(baseCost);
};

// Retrieve leaderboard data for top players
const getLeaderboard = async (req, res) => {
    try {
        const topTollCollectors = await User.find().sort({ dailyTollsEarned: -1 }).limit(10);
        const topTraders = await User.find().sort({ tradesCount: -1 }).limit(10);

        res.json({
            topTollCollectors,
            topTraders
        });
    } catch (error) {
        console.error('Error retrieving leaderboard data:', error);
        res.status(500).send('Server Error');
    }
};

// Contribute to the global fund
const contributeToGlobalFund = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        const globalEconomy = await GlobalEconomy.findOne();

        if (user.credits >= amount) {
            user.credits -= amount;
            globalEconomy.globalFund += amount;

            await user.save();
            await globalEconomy.save();

            console.log(`User ${userId} contributed ${amount} credits to the global fund.`);
        } else {
            console.log(`User ${userId} does not have enough credits to contribute ${amount} credits to the global fund.`);
        }
    } catch (error) {
        console.error('Error contributing to the global fund:', error);
    }
};

// Notify players about economy changes
const notifyEconomyChanges = async () => {
    try {
        const globalEconomy = await GlobalEconomy.findOne();
        let message = 'The global economy has changed!';

        if (globalEconomy.economyState === 'Inflationary') {
            message += ' - Costs are increasing!';
        } else if (globalEconomy.economyState === 'Deflationary') {
            message += ' - Costs are decreasing!';
        }

        await sendNotification('global', message);
        console.log('Notification sent to all players about economy changes.');
    } catch (error) {
        console.error('Error notifying players about economy changes:', error);
    }
};

module.exports = {
    adjustTollRates,
    adjustEconomyState,
    applyMaintenanceFees,
    calculateUpgradeCost,
    calculateClaimCost,
    getLeaderboard,
    contributeToGlobalFund,
    notifyEconomyChanges
};
