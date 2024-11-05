const express = require('express');
const { getRandomLink, claimLink, visitLink } = require('../controllers/linkController');
const router = express.Router();

router.get('/random-link', getRandomLink);
router.post('/claim', claimLink);
router.post('/visit', visitLink);

module.exports = router;