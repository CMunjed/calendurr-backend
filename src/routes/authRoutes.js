const express = require('express');
const { register, login, me, refresh } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/refresh', refresh);

module.exports = router;