const { sendResponse } = require('../helpers/responseHelper');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

/**
 * Get all active (non-deleted) categories
 * Public endpoint – no authentication required
 * Supports optional pagination via query params (?page=&limit=)
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deletedAt: null });

    return sendResponse(res, true, 'Categories fetched successfully', categories);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

/**
 * Get sub-categories for a given category id
 * Public endpoint – no authentication required
 */
exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ category: categoryId, deletedAt: null });

    return sendResponse(res, true, 'Sub-categories fetched successfully', subcategories);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};
