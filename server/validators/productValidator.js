const { body, validationResult } = require('express-validator');
const { sendResponse } = require('../helpers/responseHelper');

const productValidationRules = [
  body('name')
    .notEmpty().withMessage('Product name is required'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .bail()
    .isNumeric().withMessage('Price must be a number'),
  body('mrp')
    .notEmpty().withMessage('MRP is required')
    .bail()
    .isNumeric().withMessage('MRP must be a number'),
  body('salePrice')
    .notEmpty().withMessage('Sale price is required')
    .bail()
    .isNumeric().withMessage('Sale price must be a number'),
  body('costPrice')
    .notEmpty().withMessage('Cost price is required')
    .bail()
    .isNumeric().withMessage('Cost price must be a number'),
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .bail()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('discount')
    .notEmpty().withMessage('Discount is required')
    .bail()
    .isNumeric().withMessage('Discount must be a number')
    .bail()
    .custom((value) => {
      if (Number(value) < 0 || Number(value) > 100) {
        throw new Error('Discount must be between 0 and 100');
      }
      return true;
    }),
  body('shippingCharges')
    .notEmpty().withMessage('Shipping charges are required')
    .bail()
    .isNumeric().withMessage('Shipping charges must be a number')
    .bail()
    .custom((value) => {
      if (Number(value) < 0) {
        throw new Error('Shipping charges must be a non-negative number');
      }
      return true;
    }),
  body('salePrice').custom((value, { req }) => {
    if (value && req.body.mrp && Number(value) > Number(req.body.mrp)) {
      throw new Error('Sale price cannot be greater than MRP');
    }
    return true;
  }),
];

const validateProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendResponse(res, false, 'Validation failed', errors.array(), 422);
  }
  next();
};

module.exports = { productValidationRules, validateProduct }; 