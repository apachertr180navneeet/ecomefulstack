const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendResponse } = require('../helpers/responseHelper');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;
    let updateData = { name, email };
    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    let userObj = user.toObject();
    if (userObj.profilePicture) {
      userObj.profilePicture = `${req.protocol}://${req.get('host')}/uploads/userprofile/${userObj.profilePicture}`;
    }
    return sendResponse(res, true, 'Profile updated successfully', userObj);
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return sendResponse(res, false, 'User not found', null, 404);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return sendResponse(res, false, 'Old password is incorrect', null, 400);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return sendResponse(res, true, 'Password changed successfully');
  } catch (err) {
    return sendResponse(res, false, err.message, null, 500);
  }
}; 