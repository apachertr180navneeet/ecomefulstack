const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

// Public routes – no authentication middleware attached
router.get('/categories', commonController.getCategories);
router.get('/categories/:categoryId/subcategories', commonController.getSubcategoriesByCategoryId);

module.exports = router;
