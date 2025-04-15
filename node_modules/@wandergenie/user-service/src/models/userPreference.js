const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    timeZone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    notificationPreferences: {
      type: DataTypes.JSON,
      defaultValue: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      }
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true
  });

  return UserPreference;
}; 