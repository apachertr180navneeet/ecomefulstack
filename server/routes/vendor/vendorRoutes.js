const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');
const upload = require('../../helpers/productMulterConfig');
const vendorProductController = require('../../controllers/vendor/vendorProductController');

// CRUD routes for vendor products
router.post('/products', authenticateJWT, authorizeRoles('vendor'), upload.single('image'), vendorProductController.createProduct);
router.get('/products', authenticateJWT, authorizeRoles('vendor'), vendorProductController.getVendorProducts);
router.get('/products/:id', authenticateJWT, authorizeRoles('vendor'), vendorProductController.getProductById);
router.put('/products/:id', authenticateJWT, authorizeRoles('vendor'), upload.single('image'), vendorProductController.updateProduct);
router.delete('/products/:id', authenticateJWT, authorizeRoles('vendor'), vendorProductController.deleteProduct);

module.exports = router; 