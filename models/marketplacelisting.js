// models/marketplacelisting.js
const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true }, // Link being sold
    price: { type: Number, required: true, max: 100 }, // Listing price in credits (max 100)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the seller
    isSold: { type: Boolean, default: false }, // Track if the item has been sold
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
