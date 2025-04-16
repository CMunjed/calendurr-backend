const express = require('express');

// Import route files
const authRoutes = require('./authRoutes');
const planRoutes = require('./planRoutes');
const courseRoutes = require('./courseRoutes');
const semesterRoutes = require('./semesterRoutes');

const router = express.Router();

router.get('/poop', (req, res) => {
    res.send('poop');
});

// Use '/api/v1/auth' for auth routes
router.use('/auth', authRoutes);

router.use('/plans', planRoutes);

router.use('/courses', courseRoutes);

router.use('/', semesterRoutes); // No prefix, because some will start with /semesters and some with /plans/:id/semesters

/* 
// Test route to check Supabase connection
//const supabase = require('../config/supabaseClient');
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
*/

module.exports = router;