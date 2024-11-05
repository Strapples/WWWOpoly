// utils/globaleconomy.js
const cron = require('node-cron');
const { adjustTollRates } = require('../controllers/globaleconomycontroller');

// Adjust toll rates daily
cron.schedule('0 0 * * *', adjustTollRates); // Every day at midnight
