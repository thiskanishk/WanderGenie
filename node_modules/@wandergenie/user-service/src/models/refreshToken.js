const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    indexes: [
      {
        fields: ['token']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  // Add cleanup method to regularly remove expired tokens
  RefreshToken.cleanup = async function() {
    try {
      await this.destroy({
        where: {
          expiresAt: { [sequelize.Sequelize.Op.lt]: new Date() }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  };

  return RefreshToken;
}; 