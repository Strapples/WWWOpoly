// routes/linkroutes.js
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkcontroller');

// Define routes related to links
router.post('/add', linkController.addAndClaimLink);
router.post('/claim', linkController.claimLink);
router.post('/visit', linkController.visitLink);
router.post('/trade', linkController.tradeLink);
router.post('/upgrade', linkController.upgradeLink);

module.exports = router;
