const Link = require('../models/link');
const User = require('../models/user');

exports.getRandomLink = async (req, res) => {
    try {
        const link = await Link.aggregate([{ $sample: { size: 1 } }]);
        res.json(link[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving link' });
    }
};

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
        res.status(500).json({ message: 'Error claiming link' });
    }
};

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
        res.status(500).json({ message: 'Error visiting link' });
    }
};