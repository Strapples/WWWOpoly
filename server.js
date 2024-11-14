// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Import routes
const linkRoutes = require('./routes/linkroutes');
const adminRoutes = require('./routes/adminroutes');
const userRoutes = require('./routes/userroutes');
const notificationRoutes = require('./routes/notificationroutes'); // Added notification routes
const industryEventRoutes = require('./routes/industryeventroutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes); // Register notification routes
app.use('/api/industry-events', industryEventRoutes); // New route for industry events

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Import and run schedulers
require('./utils/eventscheduler');
require('./utils/cronjobs'); // This will execute all scheduled tasks in cronjobs.js

// Import notification purge function
const { purgeExpiredNotifications } = require('./controllers/notificationcontroller');

// Schedule daily purge of expired notifications at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running daily notification purge...');
    purgeExpiredNotifications();
});

// Start the server
const PORT = process.env.PORT || 51241;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});