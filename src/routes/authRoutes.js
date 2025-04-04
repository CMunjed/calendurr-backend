const express = require('express');
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

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