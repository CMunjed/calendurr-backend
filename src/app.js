// app.js is responsible for configuring the app (middleware, routes)

const express = require('express');
const cors = require('cors');
//const authRoutes = require('./routes/authRoutes');
const { version } = require('../package.json');

const app = express();
app.use(cors());
app.use(express.json());

//app.use('/api/auth', authRoutes); 

// Default route + debug message
app.get('/', (req, res) => {
    res.json({
        message: "API is running.",
        version: version,
        status: "OK"
    });
});

module.exports = app; // Export the app so it can be started in server.js