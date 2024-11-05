// controllers/leaderboardcontroller.js
const User = require('../models/user');

// Get leaderboard data based on different metrics
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch top 10 players for various categories
        const topTollCollectors = await User.find().sort({ dailyTollsEarned: -1 }).limit(10).select('username dailyTollsEarned');
        const topTraders = await User.find().sort({ tradesCount: -1 }).limit(10).select('username tradesCount');
        const topSiteOwners = await User.find().sort({ sitesOwned: -1 }).limit(10).select('username sitesOwned');
        const topCreditSpenders = await User.find().sort({ creditsSpent: -1 }).limit(10).select('username creditsSpent');
        const topLinkVisitors = await User.find().sort({ sitesVisited: -1 }).limit(10).select('username sitesVisited');

        res.json({
            success: true,
            leaderboards: {
                tollCollectors: topTollCollectors,
                traders: topTraders,
                siteOwners: topSiteOwners,
                creditSpenders: topCreditSpenders,
                linkVisitors: topLinkVisitors
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving leaderboard', error });
    }
};
