const Product = require('../../models/Product');
const ProductImage = require('../../models/ProductImage');
const { sendResponse } = require('../../helpers/responseHelper');

// GET /api/buyer/products
// Query params: page, limit, category, minPrice, maxPrice, rating, search
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { category, minPrice, maxPrice, rating, search } = req.query;

    const query = { deletedAt: null };

    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (rating) query.averageRating = { $gte: Number(rating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch images for products
    const ids = products.map(p => p._id);
    const images = await ProductImage.find({ product: { $in: ids } }).lean();

    const productsWithImages = products.map(prod => {
      prod.images = images
        .filter(img => img.product.toString() === prod._id.toString())
        .map(img => `${req.protocol}://${req.get('host')}/uploads/product/${img.image}`);
      return prod;
    });

    return sendResponse(res, true, 'Products fetched', {
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

// GET /api/buyer/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deletedAt: null })
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .lean();

    if (!product) return sendResponse(res, false, 'Product not found', null, 404);

    const images = await ProductImage.find({ product: product._id }).lean();
    product.images = images.map(img => `${req.protocol}://${req.get('host')}/uploads/product/${img.image}`);

    return sendResponse(res, true, 'Product fetched', product);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};
