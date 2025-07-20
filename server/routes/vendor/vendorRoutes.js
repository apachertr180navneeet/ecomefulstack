const express = require('express');
const router = express.Router();
const { vendorDashboard } = require('../../controllers/vendor/vendorController');
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/dashboard', authenticateJWT, authorizeRoles('vendor'), vendorDashboard);

module.exports = router; 