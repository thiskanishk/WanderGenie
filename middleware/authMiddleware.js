const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token from Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token found, return unauthorized
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wandergenie_jwt_secret');
      
      // Find user by id from decoded token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Middleware to restrict routes to admin users only
 * Must be used after the protect middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized, admin access required'
    });
  }
};

module.exports = { protect, admin }; 