const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');
const upload = require('../../helpers/productMulterConfig');
const vendorProductController = require('../../controllers/vendor/vendorProductController');
const { productValidationRules, validateProduct } = require('../../validators/productValidator');

// CRUD routes for vendor products
router.post('/products', authenticateJWT, authorizeRoles('vendor'), upload.array('images', 5), productValidationRules, validateProduct, vendorProductController.createProduct);
router.get('/products', authenticateJWT, authorizeRoles('vendor'), vendorProductController.getVendorProducts);
router.get('/products/:id', authenticateJWT, authorizeRoles('vendor'), vendorProductController.getProductById);
router.put('/products/:id', authenticateJWT, authorizeRoles('vendor'), upload.single('image'), productValidationRules, validateProduct, vendorProductController.updateProduct);
router.delete('/products/:id', authenticateJWT, authorizeRoles('vendor'), vendorProductController.deleteProduct);

// Product images
router.get('/products/:productId/images', authenticateJWT, authorizeRoles('vendor'), vendorProductController.getProductImages);
router.delete('/products/:productId/images/:imageId', authenticateJWT, authorizeRoles('vendor'), vendorProductController.deleteProductImage);

module.exports = router; 