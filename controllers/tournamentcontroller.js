// controllers/tournamentcontroller.js
const Tournament = require('../models/tournament');
const User = require('../models/user');

// Start a new weekly tournament
exports.startNewTournament = async () => {
    const metric = 'sitesVisited'; // Example metric; this could be dynamic
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Set to end in a week

    const newTournament = new Tournament({
        metric,
        endDate
    });

    await newTournament.save();
    console.log(`New tournament started! Metric: ${metric}, Ends on: ${endDate}`);
};

// Track player performance
exports.updateTournamentScores = async (userId, metric) => {
    const currentTournament = await Tournament.findOne({ endDate: { $gte: new Date() } });

    if (currentTournament && currentTournament.metric === metric) {
        const player = currentTournament.topPlayers.find(player => player.userId.toString() === userId);
        if (player) {
            player.score += 1; // Increment score for the metric
        } else {
            currentTournament.topPlayers.push({ userId, score: 1 });
        }

        await currentTournament.save();
    }
};

// End the tournament and distribute rewards
exports.endTournament = async () => {
    const currentTournament = await Tournament.findOne({ endDate: { $lte: new Date() }, rewardsDistributed: false });

    if (currentTournament) {
        // Sort and get top players
        currentTournament.topPlayers.sort((a, b) => b.score - a.score);
        const topPlayers = currentTournament.topPlayers.slice(0, 3); // Get top 3 players

        // Reward top players
        topPlayers.forEach(async (player, index) => {
            const user = await User.findById(player.userId);
            if (user) {
                user.credits += (3 - index) * 100; // Rewards: 1st place 300, 2nd 200, 3rd 100 credits
                await user.save();
            }
        });

        currentTournament.rewardsDistributed = true;
        await currentTournament.save();
        console.log('Tournament ended and rewards distributed.');
    }
};