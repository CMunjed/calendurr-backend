const express = require('express');

// Import route files
//const authRoutes = require('./authRoutes');

const supabase = require('../config/supabaseClient');

const router = express.Router();

// Use '/api/v1/auth' for auth routes
//router.use('/auth', authRoutes);

// Example for another route
// router.use('/logic', businessLogicRoutes);

router.get('/poop', (req, res) => {
    res.send('poop');
});

// Test route to check Supabase connection
router.get('/test', async (req, res) => {
    const { data, error } = await supabase
        .from('test')
        .select('*')
        .limit(1); // Fetch one record for testing

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Supabase connection successful!', data });
});

module.exports = router;