const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../helpers/multerConfig');
const { sendResponse } = require('../helpers/responseHelper');

// Custom error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err) {
    return sendResponse(res, false, err.message, null, 400);
  }
  next();
};

// Update profile (with optional profile picture upload)
router.put(
  '/profile',
  authenticateJWT,
  (req, res, next) => upload.single('profilePicture')(req, res, (err) => multerErrorHandler(err, req, res, next)),
  updateProfile
);

// Change password
router.put('/change-password', authenticateJWT, changePassword);

module.exports = router; 