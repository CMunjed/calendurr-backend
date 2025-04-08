const express = require('express');
const router = express.Router();
const { getUserPlans } = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/plans', authMiddleware, getUserPlans);

module.exports = router;