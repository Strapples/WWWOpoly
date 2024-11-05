const express = require('express');
const { getRandomLink, claimLink, visitLink, addAndClaimLink, tradeLink } = require('../controllers/linkcontroller');
const router = express.Router();

router.get('/random-link', getRandomLink);
router.post('/claim', claimLink);
router.post('/visit', visitLink);
router.post('/add', addAndClaimLink);
router.post('/trade', tradeLink);

module.exports = router;