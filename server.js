// server.js
const express = require('express');

// Load wait, because insert test code
// Omit cron from testing or shit breaks - Best shut off MongoDB too cause that fks it too.
if (process.env.NODE_ENV !== 'test') {
    require('./utils/cronjobs');
}
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('Error connecting to MongoDB:', err));
}
// Now continue loading the server (you can trash this code if in production, might speed it up, might do nothing, might break the whole thing YMMV!)
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

// Omit cron from testing or shit breaks - Best shut off MongoDB too cause that fks it too.
if (process.env.NODE_ENV !== 'test') {
    require('./utils/cronjobs');
}
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('Error connecting to MongoDB:', err));
}
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

// Schedule daily purge of expired notifications at midnight
cron.schedule('0 0 * * *', () => {
    console.log('Running daily notification purge...');
    purgeExpiredNotifications();
});

// initialize fuel scheduler
require('./utils/fuelscheduler'); // Starts fuel consumption scheduler

// Start the server
const PORT = process.env.PORT || 51241;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});