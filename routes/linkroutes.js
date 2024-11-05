// routes/linkroutes.js
const express = require('express');
const { getRandomLink, claimLink, visitLink, addAndClaimLink, tradeLink, upgradeLink } = require('../controllers/linkcontroller');
const router = express.Router();

router.get('/random-link', getRandomLink);
router.post('/claim', claimLink);
router.post('/visit', visitLink);
router.post('/add', addAndClaimLink);
router.post('/trade', tradeLink);
router.post('/upgrade', upgradeLink); // New route for upgrading links

module.exports = router;
