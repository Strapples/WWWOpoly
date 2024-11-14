// routes/industryeventroutes.js
const express = require('express');
const router = express.Router();
const industryEventController = require('../controllers/industryeventcontroller');

// Create an industry event (Admin only)
router.post('/create', industryEventController.createEvent);

// Activate an industry event
router.put('/:eventId/activate', industryEventController.activateEvent);

// Deactivate an industry event
router.put('/:eventId/deactivate', industryEventController.deactivateEvent);

// Get all active industry events
router.get('/active', industryEventController.getActiveEvents);

// Get all industry events
router.get('/all', industryEventController.getAllEvents);

module.exports = router;