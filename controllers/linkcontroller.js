// controllers/linkcontroller.js
const Link = require('../models/link');
const User = require('../models/user');

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
            link.owner = userId;
            await link.save();
            await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
            res.json({ success: true, message: 'Link claimed!' });
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
            if (visitor.credits > 1) {
                visitor.credits -= 1;
                owner.credits += 1;
                await visitor.save();
                await owner.save();
                res.json({ success: true, message: 'Toll paid' });
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

        const newLink = new Link({ url, toll, owner: userId });
        await newLink.save();

        user.points += 10; // Award points for adding a link
        await user.save();

        res.status(201).json({ message: 'Link added and claimed successfully', link: newLink });
    } catch (error) {
        res.status(500).json({ message: 'Error adding and claiming link', error });
    }
};

// Trade a link between two users with a market fee
exports.tradeLink = async (req, res) => {
    const { currentOwnerId, newOwnerId, linkId, price } = req.body;

    try {
        // Validate price is within acceptable range
        if (price < 0 || price > 100) {
            return res.status(400).json({ message: 'Trade price must be between 0 and 100 credits' });
        }

        // Find the link to trade
        const link = await Link.findById(linkId);

        // Check if the link exists and is currently owned by the specified owner
        if (!link || link.owner.toString() !== currentOwnerId) {
            return res.status(403).json({ message: 'You are not the owner of this link or the link does not exist' });
        }

        // Retrieve the current owner and new owner from the database
        const currentOwner = await User.findById(currentOwnerId);
        const newOwner = await User.findById(newOwnerId);

        // Validate the users
        if (!currentOwner) {
            return res.status(404).json({ message: 'Current owner does not exist' });
        }
        if (!newOwner) {
            return res.status(404).json({ message: 'The new owner does not exist' });
        }

        // Check if current owner has enough credits for the 5-credit market fee
        if (currentOwner.credits < 5) {
            return res.status(400).json({ message: 'Current owner does not have enough credits to use the market' });
        }

        // Check if the new owner has enough credits for the specified price
        if (newOwner.credits < price) {
            return res.status(400).json({ message: 'New owner does not have enough credits for the trade' });
        }

        // Deduct the 5-credit market fee from the current owner
        currentOwner.credits -= 5;

        // Deduct the trade price from the new owner's credits
        newOwner.credits -= price;
        
        // Transfer ownership of the link
        link.owner = newOwnerId;

        // Save all updates to the database
        await currentOwner.save();
        await newOwner.save();
        await link.save();

        res.status(200).json({
            message: 'Link traded successfully',
            link,
            currentOwner: {
                id: currentOwner._id,
                credits: currentOwner.credits
            },
            newOwner: {
                id: newOwner._id,
                credits: newOwner.credits
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error trading link', error });
    }
};