// app.js is responsible for configuring the app (middleware, routes, etc.)

const express = require('express');
const cors = require('cors');
const { version } = require('../package.json');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(cors());
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