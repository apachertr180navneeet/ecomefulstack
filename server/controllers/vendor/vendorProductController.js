const Product = require('../../models/Product');
const { sendResponse } = require('../../helpers/responseHelper');

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, mrp, salePrice, costPrice } = req.body;
    if (Number(salePrice) > Number(mrp)) {
      return sendResponse(res, false, 'Sale price cannot be greater than MRP', null, 400);
    }
    const image = req.file ? req.file.filename : undefined;
    const vendor = req.user.userId;
    const product = new Product({ name, description, price, mrp, salePrice, costPrice, image, vendor });
    await product.save();
    if (product.image) {
      product.image = `${req.protocol}://${req.get('host')}/uploads/product/${product.image}`;
    }
    return sendResponse(res, true, 'Product created successfully', product);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Get all products for this vendor (exclude soft-deleted)
exports.getVendorProducts = async (req, res) => {
  try {
    const vendor = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { vendor, deletedAt: null };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit);

    products.forEach(p => {
      if (p.image) {
        p.image = `${req.protocol}://${req.get('host')}/uploads/product/${p.image}`;
      }
    });

    return sendResponse(res, true, 'Vendor products fetched', {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Get single product by ID (must belong to vendor, exclude soft-deleted)
exports.getProductById = async (req, res) => {
  try {
    const vendor = req.user.userId;
    const product = await Product.findOne({ _id: req.params.id, vendor, deletedAt: null });
    if (!product) return sendResponse(res, false, 'Product not found', null, 404);
    if (product.image) {
      product.image = `${req.protocol}://${req.get('host')}/uploads/product/${product.image}`;
    }
    return sendResponse(res, true, 'Product fetched', product);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Update product (must belong to vendor, exclude soft-deleted)
exports.updateProduct = async (req, res) => {
  try {
    const vendor = req.user.userId;
    const { name, description, price, mrp, salePrice, costPrice } = req.body;
    if (salePrice && mrp && Number(salePrice) > Number(mrp)) {
      return sendResponse(res, false, 'Sale price cannot be greater than MRP', null, 400);
    }
    let updateData = { name, description, price, mrp, salePrice, costPrice };
    if (req.file) updateData.image = req.file.filename;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor, deletedAt: null },
      updateData,
      { new: true }
    );
    if (!product) return sendResponse(res, false, 'Product not found', null, 404);
    if (product.image) {
      product.image = `${req.protocol}://${req.get('host')}/uploads/product/${product.image}`;
    }
    return sendResponse(res, true, 'Product updated', product);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Soft delete product (set deletedAt)
exports.deleteProduct = async (req, res) => {
  try {
    const vendor = req.user.userId;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!product) return sendResponse(res, false, 'Product not found', null, 404);
    return sendResponse(res, true, 'Product soft deleted');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
}; 