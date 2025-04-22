// app.js is responsible for configuring the app (middleware, routes, etc.)

const express = require('express');
const cors = require('cors');
const { version } = require('../package.json');
const apiRoutes = require('./routes/apiRoutes');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://calendurr-frontend.vercel.app'];

// Configure CORS
app.use(cors({
    //origin: 'http://localhost:3000',
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(cookieParser());

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