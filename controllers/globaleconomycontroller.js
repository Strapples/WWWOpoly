// controllers/globaleconomycontroller.js
const Link = require('../models/link');
const User = require('../models/user');
const GlobalEconomy = require('../models/globaleconomy');
const { sendNotification } = require('../utils/notifications');

// Adjust toll rates based on link demand
exports.adjustTollRates = async () => {
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
exports.adjustEconomyState = async () => {
    try {
        const globalEconomy = await GlobalEconomy.findOne();
        const totalCredits = globalEconomy.totalCreditsInCirculation;

        if (totalCredits > 1000000) {
            globalEconomy.economyState = 'Inflationary';
            globalEconomy.inflationRate = 1.2; // Increase rates during inflation
        } else if (totalCredits < 500000) {
            globalEconomy.economyState = 'Deflationary';
            globalEconomy.deflationRate = 0.8; // Decrease rates during deflation
        } else {
            globalEconomy.economyState = 'Stable';
            globalEconomy.inflationRate = 1;
            globalEconomy.deflationRate = 1;
        }

        await globalEconomy.save();
    } catch (error) {
        console.error('Error adjusting economy state:', error);
    }
};

// Apply maintenance fees on high-level links owned by users
exports.applyMaintenanceFees = async () => {
    try {
        const users = await User.find();
        const globalEconomy = await GlobalEconomy.findOne();

        users.forEach(async (user) => {
            const highLevelLinks = await Link.find({ owner: user._id, level: { $gte: 5 } });
            const maintenanceFee = highLevelLinks.length * globalEconomy.maintenanceFeeMultiplier; // Adjust fee based on multiplier

            if (user.credits >= maintenanceFee) {
                user.credits -= maintenanceFee;
                await user.save();
            }
        });
    } catch (error) {
        console.error('Error applying maintenance fees:', error);
    }
};

// Calculate upgrade cost based on the economy state
exports.calculateUpgradeCost = async (link) => {
    const globalEconomy = await GlobalEconomy.findOne();
    let baseCost = link.level * 2; // Base upgrade cost

    if (globalEconomy.economyState === 'Inflationary') {
        baseCost *= globalEconomy.inflationRate; // Adjust for inflation
    } else if (globalEconomy.economyState === 'Deflationary') {
        baseCost *= globalEconomy.deflationRate; // Adjust for deflation
    }

    return Math.ceil(baseCost);
};

// Calculate dynamic link claim cost based on total claimed links
exports.calculateClaimCost = async () => {
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
exports.getLeaderboard = async (req, res) => {
    try {
        const topTollCollectors = await User.find().sort({ dailyTollsEarned: -1 }).limit(10);
        const topTraders = await User.find().sort({ tradesCount: -1 }).limit(10);

        res.json({
            topTollCollectors,
            topTraders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leaderboard', error });
    }
};

// Contribute to the global fund and check for milestone rewards
exports.contributeToGlobalFund = async (req, res) => {
    const { userId, contributionAmount } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.credits < contributionAmount) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        // Deduct contribution from user
        user.credits -= contributionAmount;
        await user.save();

        // Add to global fund
        const globalEconomy = await GlobalEconomy.findOne();
        globalEconomy.globalFund += contributionAmount;

        // Check for milestone rewards
        if (globalEconomy.globalFund >= 100000 && !globalEconomy.reward100k) {
            await grantMilestoneReward('100k');
            globalEconomy.reward100k = true;
        }

        await globalEconomy.save();

        res.status(200).json({ message: 'Contribution successful', globalFund: globalEconomy.globalFund });
    } catch (error) {
        res.status(500).json({ message: 'Error contributing to global fund', error });
    }
};

// Grant rewards to all players when a milestone is reached
async function grantMilestoneReward(milestone) {
    const users = await User.find();
    users.forEach(async (user) => {
        user.credits += 10; // Example reward
        await user.save();
    });
    console.log(`Milestone ${milestone} reward granted to all players.`);
}

// Notify players about global economy changes
exports.notifyEconomyChanges = async () => {
    const globalEconomy = await GlobalEconomy.findOne();
    let message = `Global economy status: ${globalEconomy.economyState}`;

    if (globalEconomy.economyState === 'Inflationary') {
        message += ' - Costs are rising!';
    } else if (globalEconomy.economyState === 'Deflationary') {
        message += ' - Costs are decreasing!';
    }

    await sendNotification('global', message);
    console.log('Notification sent to all players about economy changes.');
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