const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../helpers/emailHelper');
const { sendResponse } = require('../helpers/responseHelper');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendResponse(res, false, 'User already exists', null, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    return sendResponse(res, true, 'User registered successfully');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, false, 'Invalid credentials', null, 400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, false, 'Invalid credentials', null, 400);

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return sendResponse(res, true, 'Login successful', { token });
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, false, 'User not found', null, 404);

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset link
    const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${token}`;

    // Send email using helper
    await sendEmail(
      user.email,
      'Password Reset Request',
      `<p>You requested a password reset. <a href="${resetLink}">Click here</a> to reset your password.<br>This link will expire in 1 hour.</p>`
    );

    return sendResponse(res, true, 'Password reset link has been sent to your email.');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return sendResponse(res, false, 'Invalid or expired token', null, 400);

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendResponse(res, true, 'Password has been reset successfully');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
}; 