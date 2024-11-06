// controllers/marketplacecontroller.js
const MarketplaceListing = require('../models/marketplacelisting');
const User = require('../models/user');
const Link = require('../models/link');
const Transaction = require('../models/transaction');

// Create a new marketplace listing
exports.createListing = async (req, res) => {
    const { userId, linkId, price } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure price does not exceed the maximum limit
        if (price > 100) {
            return res.status(400).json({ message: 'Listing price cannot exceed 100 credits' });
        }

        // Check if the link exists and is owned by the user
        const link = await Link.findById(linkId);
        if (!link || link.owner.toString() !== userId) {
            return res.status(400).json({ message: 'You can only list links you own' });
        }

        // Calculate listing fee (5% of the price)
        const listingFee = Math.ceil(price * 0.05);

        // Check if the user has enough credits for the listing fee
        if (user.credits < listingFee) {
            return res.status(400).json({ message: `Insufficient credits to cover the listing fee of ${listingFee} credits` });
        }

        // Deduct the listing fee from the user's credits
        user.credits -= listingFee;
        await user.save();

        // Create the listing
        const listing = new MarketplaceListing({
            linkId,
            price,
            seller: userId
        });
        await listing.save();

        res.status(201).json({ message: 'Listing created successfully', listing });
    } catch (error) {
        res.status(500).json({ message: 'Error creating listing', error });
    }
};

// Browse available listings with optional filters for price range
exports.getListings = async (req, res) => {
    const { minPrice, maxPrice } = req.query;

    try {
        const filters = { isSold: false }; // Only show unsold listings

        if (minPrice) filters.price = { $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

        // Include seller's username and reputation in the response
        const listings = await MarketplaceListing.find(filters)
            .populate('seller', 'username reputation ratingsCount')
            .exec();

        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving listings', error });
    }
};

// Purchase a listing
exports.purchaseListing = async (req, res) => {
    const { userId, listingId } = req.body;

    try {
        const buyer = await User.findById(userId);
        if (!buyer) return res.status(404).json({ message: 'User not found' });

        const listing = await MarketplaceListing.findById(listingId).populate('seller');
        if (!listing || listing.isSold) return res.status(400).json({ message: 'Listing not available' });

        // Check if buyer has enough credits
        if (buyer.credits < listing.price) {
            return res.status(400).json({ message: 'Insufficient credits to purchase item' });
        }

        // Transfer link ownership from seller to buyer
        const link = await Link.findById(listing.linkId);
        if (!link || link.owner.toString() !== listing.seller._id.toString()) {
            return res.status(400).json({ message: 'Link not found or not owned by the seller' });
        }

        link.owner = buyer._id;
        await link.save();

        // Deduct credits from the buyer and transfer to the seller
        buyer.credits -= listing.price;
        listing.seller.credits += listing.price;
        await buyer.save();
        await listing.seller.save();

        // Mark listing as sold
        listing.isSold = true;
        await listing.save();

        // Create a transaction record
        const transaction = new Transaction({
            buyer: buyer._id,
            seller: listing.seller._id,
            listing: listing._id,
            rated: false
        });
        await transaction.save();

        res.json({ message: 'Purchase successful', listing });
    } catch (error) {
        res.status(500).json({ message: 'Error processing purchase', error });
    }
};

// Rate a seller based on a completed transaction
exports.rateSeller = async (req, res) => {
    const { userId, transactionId, rating } = req.body;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Check if the transaction has already been rated
        if (transaction.rated) {
            return res.status(400).json({ message: 'This transaction has already been rated' });
        }

        // Check that the buyer is the one rating the seller
        if (transaction.buyer.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to rate this transaction' });
        }

        // Ensure rating is between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Update the seller's reputation
        const seller = await User.findById(transaction.seller);
        await seller.updateReputation(rating);

        // Mark transaction as rated
        transaction.rated = true;
        await transaction.save();

        res.json({ message: 'Seller rated successfully', reputation: seller.reputation });
    } catch (error) {
        res.status(500).json({ message: 'Error rating seller', error });
    }
};
