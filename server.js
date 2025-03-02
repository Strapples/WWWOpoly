// server.js
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Initialize Express app
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./routes/userroutes');
const notificationRoutes = require('./routes/notificationroutes');
const industryEventRoutes = require('./routes/industryeventroutes');
const linkRoutes = require('./routes/linkroutes');
const adminRoutes = require('./routes/adminroutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/industry-events', industryEventRoutes);

const path = require('path');

// Serve Vue frontend in history mode
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB and run cron jobs if not in the test environment
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI,)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('Error connecting to MongoDB:', err));

    // Import and execute schedulers (cron jobs)
    require('./utils/cronjobs');
} else {
    mongoose.connect(process.env.MONGO_URI_TEST,)
        .then(() => console.log('Connected to MongoDB for tests'))
        .catch(err => console.error('Error connecting to MongoDB for tests:', err));
}

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 51241;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app for testing
module.exports = app;