const Product = require('../../models/Product');
const ProductImage = require('../../models/ProductImage');
const { sendResponse } = require('../../helpers/responseHelper');
const fs = require('fs');
const path = require('path');

// Create product with multiple images
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, mrp, salePrice, costPrice, stock, discount, shippingCharges } = req.body;
    if (Number(salePrice) > Number(mrp)) {
      return sendResponse(res, false, 'Sale price cannot be greater than MRP', null, 400);
    }
    const vendor = req.user.userId;
    const product = new Product({ name, description, price, mrp, salePrice, costPrice, stock, discount, shippingCharges, vendor });
    await product.save();

    // Handle multiple images
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const img = new ProductImage({ product: product._id, image: file.filename });
        await img.save();
        images.push(`${req.protocol}://${req.get('host')}/uploads/product/${file.filename}`);
      }
    }
    const productObj = product.toObject();
    productObj.images = images;
    return sendResponse(res, true, 'Product created successfully', productObj);
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

    // Fetch images for all products in one query
    const productIds = products.map(p => p._id);
    const images = await ProductImage.find({ product: { $in: productIds } });

    // Attach images to each product
    const productsWithImages = products.map(product => {
      const productObj = product.toObject();
      productObj.images = images
        .filter(img => img.product.toString() === product._id.toString())
        .map(img => ({
          _id: img._id,
          url: `${req.protocol}://${req.get('host')}/uploads/product/${img.image}`
        }));
      return productObj;
    });

    return sendResponse(res, true, 'Vendor products fetched', {
      products: productsWithImages,
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
    const { name, description, price, mrp, salePrice, costPrice, stock, discount, shippingCharges } = req.body;
    if (salePrice && mrp && Number(salePrice) > Number(mrp)) {
      return sendResponse(res, false, 'Sale price cannot be greater than MRP', null, 400);
    }
    let updateData = { name, description, price, mrp, salePrice, costPrice, stock, discount, shippingCharges };
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

// Get all images for a product
exports.getProductImages = async (req, res) => {
  try {
    const productId = req.params.productId;
    const images = await ProductImage.find({ product: productId });
    const imageUrls = images.map(img => ({
      _id: img._id,
      url: `${req.protocol}://${req.get('host')}/uploads/product/${img.image}`
    }));
    return sendResponse(res, true, 'Product images fetched', imageUrls);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

// Delete a specific image
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const image = await ProductImage.findOneAndDelete({ _id: imageId, product: productId });
    if (!image) return sendResponse(res, false, 'Image not found', null, 404);
    // Remove file from disk
    const filePath = path.join(__dirname, '../../uploads/product/', image.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return sendResponse(res, true, 'Image deleted');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
}; 