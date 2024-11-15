// controllers/industryeventcontroller.js
const IndustryEvent = require('../models/industryevent');

// Create a new industry event
exports.createEvent = async (req, res) => {
    const { category, effectType, effectMultiplier, startDate, endDate, description } = req.body;

    try {
        const newEvent = new IndustryEvent({ category, effectType, effectMultiplier, startDate, endDate, description });
        await newEvent.save();

        res.status(201).json({ message: 'Industry event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};

// Activate an existing industry event
exports.activateEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await IndustryEvent.findByIdAndUpdate(eventId, { isActive: true }, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json({ message: 'Event activated', event });
    } catch (error) {
        res.status(500).json({ message: 'Error activating event', error });
    }
};

// Deactivate an existing industry event
exports.deactivateEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await IndustryEvent.findByIdAndUpdate(eventId, { isActive: false }, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json({ message: 'Event deactivated', event });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating event', error });
    }
};

// Get all active events
exports.getActiveEvents = async (req, res) => {
    try {
        const activeEvents = await IndustryEvent.find({ isActive: true });
        res.status(200).json({ activeEvents });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving active events', error });
    }
};

// Get all events (active and inactive)
exports.getAllEvents = async (req, res) => {
    try {
        const events = await IndustryEvent.find();
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving events', error });
    }
};