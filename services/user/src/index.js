const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const jwt = require('jsonwebtoken');

const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers');
const config = require('./config/config');
const db = require('./models');

// Configure logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'user-service-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'user-service-combined.log' })
  ]
});

// Auth token validation middleware
const validateToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    logger.error('JWT verification failed', { error: err.message });
    return null;
  }
};

async function startServer() {
  const app = express();
  
  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan('combined'));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Create Apollo Server
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers
    }),
    introspection: process.env.NODE_ENV !== 'production',
    plugins: [{
      requestDidStart(requestContext) {
        logger.info('Request started', {
          query: requestContext.request.query,
          operationName: requestContext.request.operationName
        });

        return {
          willSendResponse(responseContext) {
            logger.info('Response sent', {
              operationName: requestContext.request.operationName,
              errors: responseContext.response.errors?.length || 0
            });
          }
        };
      }
    }]
  });

  await server.start();

  // Apply Apollo middleware
  app.use(
    '/graphql',
    cors(config.cors),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Create context with authenticated user
        const user = validateToken(req);
        return { user };
      }
    })
  );

  // Sync database models
  try {
    await db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database synced successfully');
    
    // Create default roles if they don't exist
    const roles = ['ADMIN', 'USER', 'VIEWER', 'EDITOR', 'OWNER'];
    for (const roleName of roles) {
      await db.Role.findOrCreate({
        where: { name: roleName },
        defaults: { 
          name: roleName,
          description: `${roleName} role` 
        }
      });
    }
    logger.info('Default roles created');
  } catch (error) {
    logger.error('Database sync error', { error });
    process.exit(1);
  }

  // Start server
  const httpServer = http.createServer(app);
  httpServer.listen(config.port, () => {
    logger.info(`🚀 User Service running at http://localhost:${config.port}/graphql`);
  });

  // Handle shutdown
  const shutdown = async () => {
    logger.info('Server shutdown initiated');
    await server.stop();
    httpServer.close(() => {
      logger.info('Server shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(err => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
}); 