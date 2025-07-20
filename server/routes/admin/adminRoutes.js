const express = require('express');
const router = express.Router();
const { adminDashboard } = require('../../controllers/admin/adminController');
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/dashboard', authenticateJWT, authorizeRoles('admin'), adminDashboard);

module.exports = router; 