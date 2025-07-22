const Subcategory = require('../../models/Subcategory');

// Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subcategory = new Subcategory({ name, category, description });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all Subcategories
exports.getSubcategories = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const [subcategories, total] = await Promise.all([
      Subcategory.find({ deletedAt: null })
        .populate('category')
        .skip(skip)
        .limit(limit),
      Subcategory.countDocuments({ deletedAt: null })
    ]);

    res.json({
      subcategories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Subcategory
exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findOne({ _id: req.params.id, deletedAt: null }).populate('category');
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { name, category, description },
      { new: true, runValidators: true }
    );
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!subcategory) return res.status(404).json({ error: 'Subcategory not found' });
    res.json({ message: 'Subcategory soft deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 