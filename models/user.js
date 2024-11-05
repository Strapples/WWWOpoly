const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    points: { type: Number, default: 0 },
    credits: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);