const express = require('express');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);

// Protected route example to test token verification - eventually, move definition to authController
router.get('/me', authMiddleware, async (req, res) => {
    // Access user info from middleware
    const { user } = req; 

    // Return the user's info
    res.json({ 
        message: "Token is valid",
        user: {
            id: user.id, 
            email: user.email 
        }
    });
});

module.exports = router;