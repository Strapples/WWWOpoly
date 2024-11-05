// controllers/linkcontroller.js
const Link = require('../models/link');
const User = require('../models/user');
const GlobalEconomy = require('../models/globaleconomy');
const checkAchievements = require('../utils/achievementcheck');
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

// Claim a link for a specific user (costs dynamically calculated)
exports.claimLink = async (req, res) => {
    const { userId, linkId } = req.body;
    try {
        const link = await Link.findById(linkId);
        if (link && !link.owner) {
            const user = await User.findById(userId);
            
            // Calculate dynamic claim cost based on economy
            const claimCost = await calculateClaimCost();
            
            if (user.points < claimCost) {
                return res.status(400).json({ message: `Insufficient points to claim this link. Claim cost is ${claimCost} points.` });
            }

            // Deduct points for claiming the link
            user.points -= claimCost;
            user.sitesOwned += 1;
            user.linksCreatedToday += 1; // Track links created today
            await user.save();

            // Assign ownership of the link to the user
            link.owner = userId;
            await link.save();

            // Check for any new achievements after claiming the link
            const newAchievements = await checkAchievements(userId);

            res.json({
                success: true,
                message: 'Link claimed!',
                link,
                user: { id: user._id, points: user.points },
                newAchievements: newAchievements.map((a) => ({
                    title: a.title,
                    description: a.description
                }))
            });
        } else {
            res.status(400).json({ success: false, message: 'Link already owned or not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error claiming link', error });
    }
};

// Visit a link and pay a toll to the owner
exports.visitLink = async (req, res) => {
    const { visitorId, linkId } = req.body;
    try {
        const link = await Link.findById(linkId);
        if (link && link.owner) {
            const owner = await User.findById(link.owner);
            const visitor = await User.findById(visitorId);

            if (visitor.credits >= link.toll) {
                // Deduct toll from visitor and credit owner
                visitor.credits -= link.toll;
                owner.credits += link.toll;

                // Update metrics for visitor and owner
                visitor.sitesVisited += 1;
                visitor.creditsSpent += link.toll;
                visitor.linksVisitedToday += 1; // Track visits made today
                owner.dailyVisits += 1;              // Track owner's daily visits
                owner.dailyTollsEarned += link.toll; // Track owner's daily toll earnings
                await visitor.save();
                await owner.save();

                // Check for any new achievements after visiting the link
                const newAchievements = await checkAchievements(visitorId);

                res.json({
                    success: true,
                    message: 'Toll paid',
                    newAchievements: newAchievements.map((a) => ({
                        title: a.title,
                        description: a.description
                    }))
                });
            } else {
                res.status(400).json({ message: 'Insufficient credits' });
            }
        } else {
            res.status(404).json({ message: 'Link not found or not owned' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error visiting link', error });
    }
};

// Add and automatically claim a new link
exports.addAndClaimLink = async (req, res) => {
    const { userId, url, toll = 1 } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate dynamic claim cost
        const claimCost = await calculateClaimCost();
        
        if (user.points < claimCost) {
            return res.status(400).json({ message: `Insufficient points to claim a new link. Claim cost is ${claimCost} points.` });
        }

        const newLink = new Link({ url, toll, owner: userId });
        await newLink.save();

        // Deduct points for claiming the link
        user.points -= claimCost;
        user.sitesOwned += 1;
        user.linksCreatedToday += 1;
        await user.save();

        // Check for any new achievements after adding the link
        const newAchievements = await checkAchievements(userId);

        res.status(201).json({
            message: 'Link added and claimed successfully',
            link: newLink,
            newAchievements: newAchievements.map((a) => ({
                title: a.title,
                description: a.description
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding and claiming link', error });
    }
};

// Trade a link between users
exports.tradeLink = async (req, res) => {
    const { currentOwnerId, newOwnerId, linkId, tradeCost } = req.body;
    try {
        // Find the link to trade
        const link = await Link.findById(linkId);
        if (!link || link.owner.toString() !== currentOwnerId) {
            return res.status(403).json({ message: 'You are not the owner of this link or the link does not exist' });
        }

        // Check if the new owner exists and has enough credits
        const newOwner = await User.findById(newOwnerId);
        if (!newOwner) return res.status(404).json({ message: 'The new owner does not exist' });
        if (newOwner.credits < tradeCost) {
            return res.status(400).json({ message: 'New owner does not have enough credits for the trade' });
        }

        // Deduct trade cost from new owner's credits
        newOwner.credits -= tradeCost;
        newOwner.tradesMadeToday += 1; // Track trades made today
        await newOwner.save();

        // Transfer ownership of the link
        link.owner = newOwnerId;
        await link.save();

        // Reward the current owner with points (optional)
        const currentOwner = await User.findById(currentOwnerId);
        currentOwner.tradesCount += 1;
        await currentOwner.save();

        // Check for any new achievements after the trade
        const currentOwnerAchievements = await checkAchievements(currentOwnerId);
        const newOwnerAchievements = await checkAchievements(newOwnerId);

        res.status(200).json({
            message: 'Link traded successfully',
            link,
            currentOwnerAchievements: currentOwnerAchievements.map((a) => ({
                title: a.title,
                description: a.description
            })),
            newOwnerAchievements: newOwnerAchievements.map((a) => ({
                title: a.title,
                description: a.description
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error trading link', error });
    }
};

// Upgrade a site (link) to the next level with dynamically calculated cost
exports.upgradeLink = async (req, res) => {
    const { userId, linkId } = req.body;

    try {
        // Find the link
        const link = await Link.findById(linkId);
        if (!link) return res.status(404).json({ message: 'Link not found' });

        // Check if the user owns the link
        if (link.owner.toString() !== userId) {
            return res.status(403).json({ message: 'You do not own this link' });
        }

        // Calculate dynamic upgrade cost based on economy state
        const upgradeCost = await calculateUpgradeCost(link);

        // Find the user and check if they have enough credits
        const user = await User.findById(userId);
        if (user.credits < upgradeCost) {
            return res.status(400).json({ message: `Insufficient credits to upgrade. Upgrade cost is ${upgradeCost} credits.` });
        }

        // Deduct credits from the user
        user.credits -= upgradeCost;
        user.upgradesMade += 1;
        await user.save();

        // Increase the link's level and update its toll
        link.level += 1;
        link.toll = link.level; // New toll amount is equal to the new level
        await link.save();

        // Check for any new achievements after upgrading
        const newAchievements = await checkAchievements(userId);

        res.status(200).json({
            message: 'Link upgraded successfully',
            link,
            user: { id: user._id, credits: user.credits },
            newAchievements: newAchievements.map((a) => ({
                title: a.title,
                description: a.description
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error upgrading link', error });
    }
};
