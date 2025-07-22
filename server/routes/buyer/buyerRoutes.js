const express = require('express');
const router = express.Router();
const { buyerDashboard } = require('../../controllers/buyer/buyerController');
const { getProducts, getProductById } = require('../../controllers/buyer/ProductController');
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');

router.get('/dashboard', authenticateJWT, authorizeRoles('buyer'), buyerDashboard);

// // Product list & filter
// router.get('/products', authenticateJWT, authorizeRoles('buyer'), getProducts);
// // Product detail
// router.get('/products/:id', authenticateJWT, authorizeRoles('buyer'), getProductById);

// Product list & filter (public)
router.get('/products', authenticateJWT, authorizeRoles('buyer') , getProducts);
// Product detail (public)
router.get('/products/:id', authenticateJWT, authorizeRoles('buyer') , getProductById);

module.exports = router; 