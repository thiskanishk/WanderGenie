require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4001,
  serviceName: 'user-service',
  
  postgres: {
    database: process.env.POSTGRES_DB || 'wandergenie_users',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'wandergenie-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  bcrypt: {
    saltRounds: 10
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
}; 