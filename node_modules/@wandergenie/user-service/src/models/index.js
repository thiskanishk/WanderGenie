const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: config.postgres.dialect,
    logging: config.postgres.logging,
    pool: config.postgres.pool
  }
);

// Import models
const User = require('./user')(sequelize);
const UserPreference = require('./userPreference')(sequelize);
const Role = require('./role')(sequelize);
const UserRole = require('./userRole')(sequelize);
const RefreshToken = require('./refreshToken')(sequelize);

// Define associations
User.hasOne(UserPreference, { foreignKey: 'userId', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', as: 'users' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// Exports
const db = {
  sequelize,
  Sequelize,
  User,
  UserPreference,
  Role,
  UserRole,
  RefreshToken
};

module.exports = db; 