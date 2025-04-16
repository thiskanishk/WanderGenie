const User = require('../models/User');
const Preference = require('../models/Preference');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/user/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update personal info
// @route   PATCH /api/user/me
// @access  Private
const updatePersonalInfo = async (req, res) => {
  const { fullName, phone, country, language, avatarUrl } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;
    user.country = country || user.country;
    user.language = language || user.language;
    user.avatarUrl = avatarUrl || user.avatarUrl;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update travel preferences
// @route   POST /api/user/preferences
// @access  Private
const updateTravelPreferences = async (req, res) => {
  const { budget, tripType, currency, distanceUnit, interests } = req.body;

  try {
    let preferences = await Preference.findOne({ user: req.user.id });

    if (!preferences) {
      preferences = new Preference({ user: req.user.id });
    }

    preferences.budget = budget || preferences.budget;
    preferences.tripType = tripType || preferences.tripType;
    preferences.currency = currency || preferences.currency;
    preferences.distanceUnit = distanceUnit || preferences.distanceUnit;
    preferences.interests = interests || preferences.interests;

    const updatedPreferences = await preferences.save();
    res.status(200).json(updatedPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password
// @route   POST /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/user/delete
// @access  Private
const deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    await Preference.deleteOne({ user: req.user.id });
    await user.remove();

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updatePersonalInfo,
  updateTravelPreferences,
  changePassword,
  deleteAccount,
};