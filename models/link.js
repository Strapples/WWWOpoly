// models/link.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    url: { 
        type: String, 
        required: true, 
        unique: true 
    }, // URL of the website link
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }, // Reference to the user who owns this link
    toll: { 
        type: Number, 
        default: 1 
    }, // Toll or fee required when visiting the link
    level: { 
        type: Number, 
        default: 1 
    }, // Level of the link (upgradable)
    category: { 
        type: String 
    }, // Category of the website, e.g., "News", "Sports"
    dailyVisits: { 
        type: Number, 
        default: 0 
    }, // Track number of daily visits to the link
    createdAt: { 
        type: Date, 
        default: Date.now 
    } // Timestamp for when the link was added to the game
}, { timestamps: true });

// Upgrade the link's level and adjust toll based on level
linkSchema.methods.upgradeLevel = function () {
    this.level += 1;
    this.toll = this.level; // Set the toll to match the link level or use another formula if needed
};

module.exports = mongoose.model('Link', linkSchema);
