// models/pendingcategory.js
const mongoose = require('mongoose');

const pendingCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PendingCategory', pendingCategorySchema);
