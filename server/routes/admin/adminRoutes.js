const express = require('express');
const router = express.Router();
const { adminDashboard } = require('../../controllers/admin/adminController');

router.get('/dashboard', adminDashboard);

module.exports = router; 