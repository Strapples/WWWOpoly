const MarketplaceListing = require('../models/marketplacelisting');
const User = require('../models/user');
const Link = require('../models/link');
const Transaction = require('../models/transaction');
const { sendNotification } = require('../utils/notifications');

// Create a new marketplace listing
exports.createListing = async (req, res) => {
    const { userId, linkId, price } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure price is positive and within allowed range
        if (price <= 0 || price > 100) {
            return res.status(400).json({ message: 'Listing price must be between 1 and 100 credits' });
        }

        const link = await Link.findById(linkId);
        if (!link || link.owner.toString() !== userId) {
            return res.status(400).json({ message: 'You can only list links you own' });
        }

        const listingFee = Math.ceil(price * 0.05);
        if (user.credits < listingFee) {
            return res.status(400).json({ message: `Insufficient credits to cover the listing fee of ${listingFee} credits` });
        }

        // Deduct the listing fee and save the listing
        user.credits -= listingFee;
        await user.save();

        const listing = new MarketplaceListing({
            linkId,
            price,
            seller: userId
        });
        await listing.save();

        await sendNotification(userId, 'Your listing has been created successfully.');
        res.status(201).json({ message: 'Listing created successfully', listing });
    } catch (error) {
        res.status(500).json({ message: 'Error creating listing', error });
    }
};

// Browse available listings with optional filters for price range
exports.getListings = async (req, res) => {
    const { minPrice, maxPrice } = req.query;

    try {
        const filters = { isSold: false };
        if (minPrice) filters.price = { $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

        const listings = await MarketplaceListing.find(filters)
            .populate('seller', 'username reputation ratingsCount')
            .limit(20) // Add pagination or limit
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

        if (buyer.credits < listing.price) {
            return res.status(400).json({ message: 'Insufficient credits to purchase item' });
        }

        const link = await Link.findById(listing.linkId);
        if (!link || link.owner.toString() !== listing.seller._id.toString()) {
            return res.status(400).json({ message: 'Link not found or not owned by the seller' });
        }

        // Handle transaction
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            buyer.credits -= listing.price;
            listing.seller.credits += listing.price;
            await buyer.save({ session });
            await listing.seller.save({ session });

            link.owner = buyer._id;
            await link.save({ session });

            listing.isSold = true;
            await listing.save({ session });

            const transaction = new Transaction({
                buyer: buyer._id,
                seller: listing.seller._id,
                listing: listing._id,
                rated: false
            });
            await transaction.save({ session });

            await session.commitTransaction();
            session.endSession();

            await sendNotification(listing.seller._id, 'Your link has been sold successfully.');
            await sendNotification(userId, 'You have successfully purchased the link.');

            res.json({ message: 'Purchase successful', listing });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ message: 'Transaction failed, please try again', error });
        }
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
        if (transaction.rated) return res.status(400).json({ message: 'This transaction has already been rated' });
        if (transaction.buyer.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to rate this transaction' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const seller = await User.findById(transaction.seller);
        await seller.updateReputation(rating);

        transaction.rated = true;
        await transaction.save();

        await sendNotification(seller._id, 'You received a new rating.');

        res.json({ message: 'Seller rated successfully', reputation: seller.reputation });
    } catch (error) {
        res.status(500).json({ message: 'Error rating seller', error });
    }
};