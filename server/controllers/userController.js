const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;
    let updateData = { name, email };
    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // Build full URL for profile picture if it exists
    let userObj = user.toObject();
    if (userObj.profilePicture) {
      userObj.profilePicture = `${req.protocol}://${req.get('host')}/uploads/userprofile/${userObj.profilePicture}`;
    }

    res.json({ message: 'Profile updated successfully', user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 