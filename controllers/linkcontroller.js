// controllers/linkcontroller.js
const Link = require('../models/link');
const User = require('../models/user');
const GlobalEconomy = require('../models/globaleconomy'); // To access daily traffic multipliers
const checkAchievements = require('../utils/achievementcheck');
const Transaction = require('../models/transaction'); // For marketplace transactions

// Utility to calculate claim costs and upgrades
const { calculateUpgradeCost, calculateClaimCost } = require('./globaleconomycontroller');

// Get a random link from the database
exports.getRandomLink = async (req, res) => {
    try {
        const link = await Link.aggregate([{ $sample: { size: 1 } }]);
        res.json(link[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving link', error });
    }
};

// Claim a link for a specific user
exports.claimLink = async (req, res) => {
    const { userId, linkId } = req.body;
    try {
        const link = await Link.findById(linkId);
        if (link && !link.owner) {
            const user = await User.findById(userId);
            
            const claimCost = await calculateClaimCost();
            if (user.points < claimCost) {
                return res.status(400).json({ message: `Insufficient points to claim. Cost: ${claimCost} points.` });
            }

            user.points -= claimCost;
            user.sitesOwned += 1;
            await user.save();

            link.owner = userId;
            await link.save();

            const newAchievements = await checkAchievements(userId);
            res.json({
                success: true,
                message: 'Link claimed!',
                link,
                newAchievements
            });
        } else {
            res.status(400).json({ message: 'Link already owned or not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error claiming link', error });
    }
};

// Visit a link and pay a toll to the owner, with category-based multiplier
exports.visitLink = async (req, res) => {
    const { visitorId, linkId } = req.body;
    try {
        const link = await Link.findById(linkId).populate('owner');
        if (!link) return res.status(404).json({ message: 'Link not found' });

        const globalEconomy = await GlobalEconomy.findOne();
        let toll = link.toll;

        if (link.category === globalEconomy.dailyCategory) {
            toll *= globalEconomy.dailyMultiplier;
        }

        const visitor = await User.findById(visitorId);
        if (visitor.credits < toll) {
            return res.status(400).json({ message: 'Insufficient credits' });
        }

        visitor.credits -= toll;
        link.owner.credits += toll;

        visitor.sitesVisited += 1;
        visitor.creditsSpent += toll;
        link.dailyVisits += 1;

        await visitor.save();
        await link.owner.save();

        res.json({
            success: true,
            message: 'Toll paid',
            toll,
            multiplier: globalEconomy.dailyMultiplier
        });
    } catch (error) {
        res.status(500).json({ message: 'Error visiting link', error });
    }
};

// Add and automatically claim a new link
exports.addAndClaimLink = async (req, res) => {
    const { userId, url, toll = 1 } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const claimCost = await calculateClaimCost();
        if (user.points < claimCost) {
            return res.status(400).json({ message: `Insufficient points to claim. Cost: ${claimCost} points.` });
        }

        const category = await categorizeWebsite(url); // Placeholder for automatic categorization
        const newLink = new Link({ url, toll, owner: userId, category });

        await newLink.save();
        user.points -= claimCost;
        user.sitesOwned += 1;
        await user.save();

        const newAchievements = await checkAchievements(userId);
        res.status(201).json({
            message: 'Link added and claimed successfully',
            link: newLink,
            newAchievements
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding and claiming link', error });
    }
};

// Trade a link between users
exports.tradeLink = async (req, res) => {
    const { currentOwnerId, newOwnerId, linkId, tradeCost } = req.body;
    try {
        const link = await Link.findById(linkId);
        if (!link || link.owner.toString() !== currentOwnerId) {
            return res.status(403).json({ message: 'You are not the owner of this link or the link does not exist' });
        }

        const newOwner = await User.findById(newOwnerId);
        if (!newOwner || newOwner.credits < tradeCost) {
            return res.status(400).json({ message: 'New owner does not have enough credits for the trade' });
        }

        newOwner.credits -= tradeCost;
        await newOwner.save();

        link.owner = newOwnerId;
        await link.save();

        const currentOwner = await User.findById(currentOwnerId);
        currentOwner.tradesCount += 1;
        await currentOwner.save();

        const currentOwnerAchievements = await checkAchievements(currentOwnerId);
        const newOwnerAchievements = await checkAchievements(newOwnerId);

        res.status(200).json({
            message: 'Link traded successfully',
            link,
            currentOwnerAchievements,
            newOwnerAchievements
        });
    } catch (error) {
        res.status(500).json({ message: 'Error trading link', error });
    }
};

// Upgrade a link level with dynamic cost based on economy
exports.upgradeLink = async (req, res) => {
    const { userId, linkId } = req.body;

    try {
        const link = await Link.findById(linkId);
        if (!link) return res.status(404).json({ message: 'Link not found' });

        if (link.owner.toString() !== userId) {
            return res.status(403).json({ message: 'You do not own this link' });
        }

        const upgradeCost = await calculateUpgradeCost(link);
        const user = await User.findById(userId);

        if (user.credits < upgradeCost) {
            return res.status(400).json({ message: `Insufficient credits to upgrade. Cost: ${upgradeCost} credits.` });
        }

        user.credits -= upgradeCost;
        link.upgradeLevel();
        await user.save();
        await link.save();

        const newAchievements = await checkAchievements(userId);

        res.status(200).json({
            message: 'Link upgraded successfully',
            link,
            user: { id: user._id, credits: user.credits },
            newAchievements
        });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading link', error });
    }
};

// Utility for categorizing website (placeholder)
const categorizeWebsite = async (url) => {
    // Implement actual categorization logic with an external API
    const categories = ['News', 'Sports', 'Education', 'Entertainment', 'Shopping'];
    return categories[Math.floor(Math.random() * categories.length)];
};
