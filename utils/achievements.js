// achievements.js

const achievements = [
    // Basic achievements
    {
        id: 'first_link_claimed',
        title: 'First Link Claimed',
        description: 'Claim your first link.',
        condition: (user) => user.sitesOwned >= 1,
    },
    {
        id: 'ten_sites_owned',
        title: 'Landlord',
        description: 'Own 10 sites.',
        condition: (user) => user.sitesOwned >= 10,
    },
    {
        id: 'first_trade_made',
        title: 'Trader',
        description: 'Complete your first trade.',
        condition: (user) => user.tradesCount >= 1,
    },
    {
        id: 'five_sites_visited',
        title: 'Explorer',
        description: 'Visit 5 different sites.',
        condition: (user) => user.sitesVisited >= 5,
    },
    {
        id: 'credits_spent_10000',
        title: 'Spendthrift',
        description: 'Spend 10,000 credits.',
        condition: (user) => user.creditsSpent >= 10000,
    },
    {
        id: 'first_upgrade',
        title: 'Builder',
        description: 'Upgrade a site for the first time.',
        condition: (user) => user.upgradesMade >= 1,
    },
    
    // Milestone achievements for Sites Owned
    ...Array.from({ length: 10 }, (_, i) => ({
        id: `sites_owned_${(i + 1) * 100}`,
        title: `Property Owner ${((i + 1) * 100)}`,
        description: `Own ${((i + 1) * 100)} sites.`,
        condition: (user) => user.sitesOwned >= (i + 1) * 100,
    })),
    ...Array.from({ length: 1990 / 500 }, (_, i) => ({
        id: `sites_owned_${1000 + (i + 1) * 500}`,
        title: `Real Estate Mogul ${1000 + (i + 1) * 500}`,
        description: `Own ${1000 + (i + 1) * 500} sites.`,
        condition: (user) => user.sitesOwned >= 1000 + (i + 1) * 500,
    })),

    // Milestone achievements for Trades Made
    ...Array.from({ length: 10 }, (_, i) => ({
        id: `trades_made_${(i + 1) * 100}`,
        title: `Trader ${((i + 1) * 100)}`,
        description: `Complete ${((i + 1) * 100)} trades.`,
        condition: (user) => user.tradesCount >= (i + 1) * 100,
    })),
    ...Array.from({ length: 1990 / 500 }, (_, i) => ({
        id: `trades_made_${1000 + (i + 1) * 500}`,
        title: `Master Trader ${1000 + (i + 1) * 500}`,
        description: `Complete ${1000 + (i + 1) * 500} trades.`,
        condition: (user) => user.tradesCount >= 1000 + (i + 1) * 500,
    })),

    // Milestone achievements for Credits Spent
    {
        id: 'credits_spent_10000',
        title: 'Spendthrift',
        description: 'Spend 10,000 credits.',
        condition: (user) => user.creditsSpent >= 10000,
    },
    {
        id: 'credits_spent_100000',
        title: 'Big Spender',
        description: 'Spend 100,000 credits.',
        condition: (user) => user.creditsSpent >= 100000,
    },
    {
        id: 'credits_spent_1000000',
        title: 'Business Spender',
        description: 'Spend 1 million credits.',
        condition: (user) => user.creditsSpent >= 1000000,
    },
    {
        id: 'credits_spent_1000000000',
        title: 'Fortune 100',
        description: 'Spend 1 billion credits.',
        condition: (user) => user.creditsSpent >= 1000000000,
    },

    // Milestone achievements for Upgrades
    ...Array.from({ length: 10 }, (_, i) => ({
        id: `upgrades_${(i + 1) * 100}`,
        title: `Builder Level ${((i + 1) * 100)}`,
        description: `Perform ${((i + 1) * 100)} upgrades.`,
        condition: (user) => user.upgradesMade >= (i + 1) * 100,
    }))
];

module.exports = achievements;
