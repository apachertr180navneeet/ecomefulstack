const express = require('express');
const router = express.Router();
const { buyerDashboard } = require('../../controllers/buyer/buyerController');

router.get('/dashboard', buyerDashboard);

module.exports = router; 