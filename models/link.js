// models/link.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toll: { type: Number, default: 1 },
    level: { type: Number, default: 1 } // New field for upgrade level
}, { timestamps: true });

module.exports = mongoose.model('Link', linkSchema);
