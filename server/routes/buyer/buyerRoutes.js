const express = require('express');
const router = express.Router();
const { buyerDashboard } = require('../../controllers/buyer/buyerController');
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/dashboard', authenticateJWT, authorizeRoles('buyer'), buyerDashboard);

module.exports = router; 