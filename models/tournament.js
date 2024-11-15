// models/tournament.js
const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    metric: { type: String, required: true }, // e.g., 'sitesVisited', 'tollsCollected', etc.
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    topPlayers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            score: { type: Number, default: 0 }
        }
    ],
    rewardsDistributed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);