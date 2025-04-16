const express = require('express');
const { body } = require('express-validator');
const { forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ],
  resetPassword
);

module.exports = router;