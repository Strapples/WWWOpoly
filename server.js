// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
require('./utils/dailydigest');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userroutes'));
app.use('/api/links', require('./routes/linkroutes'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
