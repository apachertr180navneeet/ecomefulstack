const express = require('express');
const router = express.Router();
const adminDashboard  = require('../../controllers/admin/adminController');
const categoryController = require('../../controllers/admin/categoryController');
const subcategoryController = require('../../controllers/admin/subcategoryController');
const { authenticateJWT, authorizeRoles } = require('../../middleware/authMiddleware');





router.get('/dashboard', authenticateJWT, authorizeRoles('admin'), adminDashboard.adminDashboard);

// Only admin can manage subcategories
router.post('/sub-category', authenticateJWT, authorizeRoles('admin'), subcategoryController.createSubcategory);
router.get('/sub-category', authenticateJWT, authorizeRoles('admin'), subcategoryController.getSubcategories);
router.get('/sub-category/:id', authenticateJWT, authorizeRoles('admin'), subcategoryController.getSubcategoryById);
router.put('/sub-category/:id', authenticateJWT, authorizeRoles('admin'), subcategoryController.updateSubcategory);
router.delete('/sub-category/:id', authenticateJWT, authorizeRoles('admin'), subcategoryController.deleteSubcategory);

//category Curd
router.post('/category', authenticateJWT, authorizeRoles('admin'), categoryController.createCategory);
router.get('/category', authenticateJWT, authorizeRoles('admin'), categoryController.getCategories);
router.get('/category/:id', authenticateJWT, authorizeRoles('admin'), categoryController.getCategoryById);
router.put('/category/:id', authenticateJWT, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/category/:id', authenticateJWT, authorizeRoles('admin'), categoryController.deleteCategory);



module.exports = router; 