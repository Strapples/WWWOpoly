// routes/adminroutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');

// Define admin routes for category management
router.get('/categories/pending', adminController.getPendingCategories);
router.post('/categories/approve/:categoryId', adminController.approveCategory);
router.delete('/categories/reject/:categoryId', adminController.rejectCategory);

module.exports = router;
