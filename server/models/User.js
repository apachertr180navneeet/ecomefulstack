const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'vendor', 'admin'], default: 'buyer' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  profilePicture: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 