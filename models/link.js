const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    toll: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Link', linkSchema);