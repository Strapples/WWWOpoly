// utils/dailymissions.js

const dailyMissions = [
    {
        id: 'create_5_links',
        title: 'Create 5 Links',
        description: 'Create 5 new links. Each link costs 2 points, but you get a 5-point reward upon completion.',
        requiredCount: 5, // User needs to create 5 links
        costPerAction: 2, // Each link creation costs 2 points
        reward: { points: 5 },
        completionCheck: (user) => user.linksCreatedToday >= 5
    },
    {
        id: 'visit_10_links',
        title: 'Visit 10 Links',
        description: 'Visit 10 links today to earn 5 credits. This mission can only be completed once a day.',
        requiredCount: 10, // User needs to visit 10 links
        reward: { credits: 5 },
        completionCheck: (user) => user.linksVisitedToday >= 10
    },
    {
        id: 'trade_a_link',
        title: 'Trade a Link',
        description: 'Trade at least one link to receive 5 credits. This mission can only be completed once a day.',
        requiredCount: 1, // User needs to complete 1 trade
        reward: { credits: 5 },
        completionCheck: (user) => user.tradesMadeToday >= 1
    },
    {
        id: 'report_dead_link',
        title: 'Report a Dead Link',
        description: 'Report a broken or dead link and receive 1 point if the report is accepted by an admin.',
        requiredCount: 1, // User needs to report one dead link
        reward: { points: 1 },
        completionCheck: (user) => user.deadLinksReportedToday >= 1
    }
];

module.exports = dailyMissions;
