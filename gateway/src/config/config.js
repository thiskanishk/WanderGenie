require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  serviceList: [
    { name: 'user-service', url: process.env.USER_SERVICE_URL || 'http://localhost:4001/graphql' },
    { name: 'trip-service', url: process.env.TRIP_SERVICE_URL || 'http://localhost:4002/graphql' },
    { name: 'planner-service', url: process.env.PLANNER_SERVICE_URL || 'http://localhost:4003/graphql' },
    { name: 'sharing-service', url: process.env.SHARING_SERVICE_URL || 'http://localhost:4004/graphql' },
    { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005/graphql' },
    { name: 'subscription-service', url: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:4006/graphql' },
    { name: 'location-service', url: process.env.LOCATION_SERVICE_URL || 'http://localhost:4007/graphql' },
    { name: 'checklist-service', url: process.env.CHECKLIST_SERVICE_URL || 'http://localhost:4008/graphql' },
  ],
  jwt: {
    secret: process.env.JWT_SECRET || 'wandergenie-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}; 