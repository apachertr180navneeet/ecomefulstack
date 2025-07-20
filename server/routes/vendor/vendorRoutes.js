const express = require('express');
const router = express.Router();
const { vendorDashboard } = require('../../controllers/vendor/vendorController');

router.get('/dashboard', vendorDashboard);

module.exports = router; 