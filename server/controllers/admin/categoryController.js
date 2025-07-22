const { sendResponse } = require('../../helpers/responseHelper');
const Category = require('../../models/Category');

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      return sendResponse(res, false, 'Category name must be unique', null, 400);
    }
    const category = new Category({ name, description });
    await category.save();
    return sendResponse(res, true, 'Category created successfully', category, 201);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 400);
  }
};

// Get all Categories
exports.getCategories = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Category.countDocuments({ deletedAt: null });
    const categories = await Category.find({ deletedAt: null })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return sendResponse(res, true, 'Categories fetched successfully', {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Get single Category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, deletedAt: null });
    if (!category) return sendResponse(res, false, 'Category not found', null, 404);
    return sendResponse(res, true, 'Category fetched successfully', category);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check for unique name (exclude current category)
    const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) {
      return sendResponse(res, false, 'Category name must be unique', null, 400);
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) return sendResponse(res, false, 'Category not found', null, 404);
    return sendResponse(res, true, 'Category updated successfully', category);
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return sendResponse(res, false, errors.join(', '), null, 400);
    }
    return sendResponse(res, false, err.message, null, 400);
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!category) return sendResponse(res, false, 'Category not found', null, 404);
    return sendResponse(res, true, 'Category soft deleted');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
}; 