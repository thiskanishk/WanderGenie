const express = require('express');
const {
  getUserProfile,
  updatePersonalInfo,
  updateTravelPreferences,
  changePassword,
  deleteAccount,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/user/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, getUserProfile);

// @route   PATCH /api/user/me
// @desc    Update personal info
// @access  Private
router.patch('/me', authMiddleware, updatePersonalInfo);

// @route   POST /api/user/preferences
// @desc    Update travel preferences
// @access  Private
router.post('/preferences', authMiddleware, updateTravelPreferences);

// @route   POST /api/user/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authMiddleware, changePassword);

// @route   DELETE /api/user/delete
// @desc    Delete account
// @access  Private
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;