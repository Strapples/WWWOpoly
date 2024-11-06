// controllers/admincontroller.js
const PendingCategory = require('../models/pendingcategory');
const LinkController = require('./linkcontroller');

// Endpoint to get all pending categories
exports.getPendingCategories = async (req, res) => {
    try {
        const pendingCategories = await PendingCategory.find().populate('suggestedBy', 'username');
        res.json(pendingCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending categories', error });
    }
};

// Endpoint to approve a category
exports.approveCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const pendingCategory = await PendingCategory.findById(categoryId);
        if (!pendingCategory) return res.status(404).json({ message: 'Pending category not found' });

        // Add approved category to validCategories and delete from PendingCategory
        validCategories.push(pendingCategory.name);
        await pendingCategory.remove();

        res.json({ message: `Category "${pendingCategory.name}" approved and added to the list.` });
    } catch (error) {
        res.status(500).json({ message: 'Error approving category', error });
    }
};

// Endpoint to reject a category
exports.rejectCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const pendingCategory = await PendingCategory.findById(categoryId);
        if (!pendingCategory) return res.status(404).json({ message: 'Pending category not found' });

        await pendingCategory.remove();
        res.json({ message: `Category "${pendingCategory.name}" rejected and removed from pending list.` });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting category', error });
    }
};
