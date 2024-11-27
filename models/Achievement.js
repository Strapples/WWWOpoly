const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true }, // Unique ID for the achievement
    title: { type: String, required: true }, // Achievement title
    description: { type: String, required: true }, // Description of the achievement
    unlockedAt: { type: Date, default: Date.now }, // When the achievement was unlocked
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who unlocked it
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);