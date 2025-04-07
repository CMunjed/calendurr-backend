// app.js is responsible for configuring the app (middleware, routes, etc.)

const express = require('express');
const cors = require('cors');
const { version } = require('../package.json');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Default route + debug message
app.get('/', (req, res) => {
    res.json({
        message: "API is running.",
        version: version,
        status: "OK"
    });
});

app.use('/api/v1', apiRoutes); // Prefix for all API routes

module.exports = app; // Export the app so it can be started in server.js