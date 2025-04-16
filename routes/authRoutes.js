const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const { 
  register, 
  login, 
  socialLogin, 
  forgotPassword, 
  resetPassword, 
  getMe,
  refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('fullName', 'Full name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  login
);

// @route   POST /api/auth/social-login
// @desc    Login or register with social providers
// @access  Public
router.post(
  '/social-login',
  [
    check('provider', 'Provider is required').notEmpty(),
    check('token', 'Token is required').notEmpty(),
    check('userData', 'User data is required').notEmpty()
  ],
  socialLogin
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset token
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    check('resetToken', 'Reset token is required').notEmpty(),
    check('newPassword', 'Password must be at least 8 characters').isLength({ min: 8 })
  ],
  resetPassword
);

// @route   GET /api/auth/me
// @desc    Get logged in user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post(
  '/refresh-token',
  [
    check('refreshToken', 'Refresh token is required').notEmpty()
  ],
  refreshToken
);

module.exports = router; 