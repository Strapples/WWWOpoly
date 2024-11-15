// routes/userRoutes.js
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

// File filter to accept only images
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

// Routes

// Route to register a new user with an optional referral code
router.post('/register', userController.registerUser);

// Route for user login
router.post('/login', userController.loginUser);

// Route to update user profile
router.put('/:userId/profile', userController.updateProfile);

// Route to get user profile
router.get('/:userId/profile', userController.getProfile);

// Route for uploading a profile image
router.post('/:userId/uploadProfileImage', upload.single('avatar'), userController.uploadProfileImage);

// Optional route to get user stats
router.get('/:userId/stats', userController.getUserStats);

// routes/userroutes.js
router.post('/test-hash', userController.testHashingDirectly);

module.exports = router;