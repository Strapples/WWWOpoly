const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true },
    rated: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 }, // Optional field for transaction rating
    price: { type: Number, required: true }   // Optional field for transaction amount
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);