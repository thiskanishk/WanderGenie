const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../models');

// Helper function to generate tokens
const generateTokens = (user) => {
  const token = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name)
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { token, refreshToken };
};

// Store refresh token in database
const storeRefreshToken = async (userId, token) => {
  await db.RefreshToken.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return db.User.findByPk(user.id, {
        include: [
          { model: db.UserPreference, as: 'preferences' },
          { model: db.Role, as: 'roles' }
        ]
      });
    },
    user: async (_, { id }) => {
      return db.User.findByPk(id, {
        include: [
          { model: db.UserPreference, as: 'preferences' },
          { model: db.Role, as: 'roles' }
        ]
      });
    },
    users: async (_, { limit = 10, offset = 0 }) => {
      return db.User.findAll({
        limit,
        offset,
        include: [
          { model: db.Role, as: 'roles' }
        ]
      });
    }
  },
  
  Mutation: {
    register: async (_, { input }) => {
      // Check if user already exists
      const existingUser = await db.User.findOne({ where: { email: input.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      try {
        // Create user with transaction
        const result = await db.sequelize.transaction(async (t) => {
          // Create the user
          const user = await db.User.create({
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber
          }, { transaction: t });
          
          // Find default user role
          const userRole = await db.Role.findOne({ 
            where: { name: 'USER' },
            transaction: t 
          });
          
          if (!userRole) {
            throw new Error('Default role not found');
          }
          
          // Assign role to user
          await db.UserRole.create({
            userId: user.id,
            roleId: userRole.id
          }, { transaction: t });
          
          // Create default preferences
          await db.UserPreference.create({
            userId: user.id,
            language: 'en',
            currency: 'USD',
            timeZone: 'UTC',
            notificationPreferences: {
              email: true,
              push: true,
              sms: false,
              inApp: true
            }
          }, { transaction: t });
          
          // Get the user with roles for token generation
          const userWithRoles = await db.User.findByPk(user.id, {
            include: [
              { model: db.Role, as: 'roles' },
              { model: db.UserPreference, as: 'preferences' }
            ],
            transaction: t
          });
          
          return userWithRoles;
        });
        
        // Generate auth tokens
        const { token, refreshToken } = generateTokens(result);
        
        // Store refresh token
        await storeRefreshToken(result.id, refreshToken);
        
        return {
          token,
          refreshToken,
          user: result
        };
      } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
    },
    
    login: async (_, { input }) => {
      // Find user by email
      const user = await db.User.findOne({
        where: { email: input.email },
        include: [
          { model: db.Role, as: 'roles' },
          { model: db.UserPreference, as: 'preferences' }
        ]
      });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Validate password
      const isValidPassword = await user.validatePassword(input.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Update last login
      await user.update({ lastLogin: new Date() });
      
      // Generate tokens
      const { token, refreshToken } = generateTokens(user);
      
      // Store refresh token
      await storeRefreshToken(user.id, refreshToken);
      
      return {
        token,
        refreshToken,
        user
      };
    },
    
    refreshToken: async (_, { token }) => {
      try {
        // Verify refresh token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Find token in database
        const storedToken = await db.RefreshToken.findOne({
          where: { 
            token,
            userId: decoded.id 
          }
        });
        
        if (!storedToken) {
          throw new Error('Invalid token');
        }
        
        // Get user
        const user = await db.User.findByPk(decoded.id, {
          include: [
            { model: db.Role, as: 'roles' },
            { model: db.UserPreference, as: 'preferences' }
          ]
        });
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Generate new tokens
        const tokens = generateTokens(user);
        
        // Invalidate old token and store new one
        await storedToken.destroy();
        await storeRefreshToken(user.id, tokens.refreshToken);
        
        return {
          token: tokens.token,
          refreshToken: tokens.refreshToken,
          user
        };
      } catch (error) {
        throw new Error('Invalid or expired token');
      }
    }
    
    // Other resolvers would be implemented here
  },
  
  User: {
    fullName: (user) => `${user.firstName} ${user.lastName}`,
    
    // This resolver is needed for federation
    __resolveReference: async (user) => {
      return db.User.findByPk(user.id, {
        include: [
          { model: db.UserPreference, as: 'preferences' },
          { model: db.Role, as: 'roles' }
        ]
      });
    }
  }
};

module.exports = resolvers; 