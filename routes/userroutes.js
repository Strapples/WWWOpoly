// routes/userroutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/usercontroller');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
    }
};

// Set up multer middleware with storage, fileFilter, and size limits
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 2 } // Limit file size to 2MB
});

// Route to update user profile
router.put('/:userId/profile', userController.updateProfile);

// Route to get user profile
router.get('/:userId/profile', userController.getProfile);

// Route for uploading profile image
router.post('/:userId/uploadProfileImage', upload.single('avatar'), userController.uploadProfileImage);

// Register user with optional referral code
router.post('/register', userController.registerUser);

// Route for login
router.post('/login', userController.loginUser);

// Route to get user stats (optional)
router.get('/:userId/stats', userController.getUserStats);

module.exports = router;