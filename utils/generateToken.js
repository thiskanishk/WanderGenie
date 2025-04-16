const jwt = require('jsonwebtoken');

/**
 * Generate JWT tokens for authentication
 * @param {string} userId - User ID to encode in the token
 * @returns {Object} Object containing access token and refresh token
 */
const generateTokens = (userId) => {
  // Generate access token (shorter expiry)
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'wandergenie_jwt_secret',
    { expiresIn: '1h' } // Access token expires in 1 hour
  );

  // Generate refresh token (longer expiry)
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'wandergenie_refresh_secret',
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );

  return {
    accessToken,
    refreshToken
  };
};

module.exports = { generateTokens }; 