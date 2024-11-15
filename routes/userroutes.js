// routes/userroutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const { upload } = userController;

// Auth Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Profile and Account Management
router.put('/:userId/profile', userController.updateProfile);
router.get('/:userId/profile', userController.getProfile);
router.post('/:userId/uploadProfileImage', upload.single('avatar'), userController.uploadProfileImage);

// Referral Routes
router.post('/:userId/generateReferralCode', userController.generateReferralCode);
router.get('/:userId/referrals', userController.viewReferrals);

// Leaderboard and Stats Routes
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:userId/stats', userController.getUserStats);

module.exports = router;