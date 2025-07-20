const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const upload = require('../helpers/multerConfig');

// Update profile (with optional profile picture upload)
router.put('/profile', authenticateJWT, upload.single('profilePicture'), updateProfile);

// Change password
router.put('/change-password', authenticateJWT, changePassword);

module.exports = router; 