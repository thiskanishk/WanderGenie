import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Request } from 'express';
import http from 'http';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import winston from 'winston';
import config from './config/config';

// Interface definitions
interface DecodedToken {
  id: string;
  roles: string[];
  [key: string]: any;
}

interface ContextType {
  user?: DecodedToken | null;
}

// Configure logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'gateway-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'gateway-combined.log' })
  ]
});

// Initialize Apollo Gateway
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: config.serviceList
  }),
  // Authentication context building
  buildService({ name, url }) {
    return {
      url,
      willSendRequest({ request, context }: { request: any; context: ContextType }) {
        // Add user context to downstream services
        if (context.user) {
          request.http.headers.set('user-id', context.user.id);
          request.http.headers.set('user-roles', context.user.roles.join(','));
        }
      }
    };
  }
});

// Auth token validation middleware
const validateToken = (req: Request): DecodedToken | null => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    return decoded;
  } catch (err) {
    const error = err as Error;
    logger.error('JWT verification failed', { error: error.message });
    return null;
  }
};

async function startServer(): Promise<void> {
  const app = express();
  
  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(morgan('combined'));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Create Apollo Server
  const server = new ApolloServer({
    gateway,
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
      context: async ({ req }): Promise<ContextType> => {
        // Create context with authenticated user
        const user = validateToken(req);
        return { user };
      }
    })
  );

  // Start server
  const httpServer = http.createServer(app);
  httpServer.listen(config.port, () => {
    logger.info(`🚀 GraphQL Gateway running at http://localhost:${config.port}/graphql`);
  });

  // Handle shutdown
  const shutdown = async (): Promise<void> => {
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