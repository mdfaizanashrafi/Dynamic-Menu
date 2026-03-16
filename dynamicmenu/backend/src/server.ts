/**
 * DynamicMenu API Server
 * 
 * @module server
 * @description Main entry point for the DynamicMenu backend application.
 * 
 * ## Architecture Overview
 * 
 * The server follows a layered architecture:
 * 
 * ```
 * ┌─────────────────────────────────────┐
 * │         Express Server              │
 * ├─────────────────────────────────────┤
 * │  Security (helmet, cors, rateLimit) │
 * ├─────────────────────────────────────┤
 * │      Request Parsing (json)         │
 * ├─────────────────────────────────────┤
 * │    API Routes (/api/*)              │
 * ├─────────────────────────────────────┤
 * │    404 Handler (notFoundHandler)    │
 * ├─────────────────────────────────────┤
 * │  Error Handler (errorHandler)       │
 * └─────────────────────────────────────┘
 * ```
 * 
 * ## Security Features
 * - Helmet for security headers
 * - CORS configured for frontend origin
 * - Rate limiting (general and auth-specific)
 * - Body size limits to prevent DoS
 * - Graceful shutdown handling
 * 
 * ## Error Handling
 * - Uncaught exceptions terminate the process
 * - Unhandled promise rejections terminate the process
 * - Graceful shutdown on SIGTERM/SIGINT
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '@config/env';
import { checkDatabaseConnection, disconnectDatabase } from '@config/database';
import { logger } from '@utils/logger';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import routes from './routes';

// Initialize Express application
const app = express();

/**
 * Security Middleware
 * 
 * Helmet sets various HTTP headers for security:
 * - Content-Security-Policy
 * - Cross-Origin-Embedder-Policy (production only)
 * - X-DNS-Prefetch-Control
 * - X-Frame-Options
 * - etc.
 */
app.use(helmet({
  contentSecurityPolicy: env.isProduction,
  crossOriginEmbedderPolicy: env.isProduction,
}));

/**
 * CORS Configuration
 * 
 * Restricts cross-origin requests to the configured frontend URL.
 * Credentials are enabled for cookie-based authentication if needed.
 */
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * General Rate Limiting
 * 
 * Limits each IP to 100 requests per 15-minute window.
 * Returns 429 status with standard error format when exceeded.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
  },
});
app.use(limiter);

/**
 * Stricter Rate Limiting for Auth Endpoints
 * 
 * Limits login/register attempts to 5 per 15-minute window.
 * Successful requests don't count toward the limit.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * Body Parsing Middleware
 * 
 * Parses JSON and URL-encoded bodies with a 10MB limit to prevent
 * memory exhaustion attacks.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 * 
 * Logs all incoming requests at debug level with IP and user agent.
 */
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

/**
 * API Routes
 * 
 * All API endpoints are mounted under /api prefix.
 * See routes/index.ts for route organization.
 */
app.use('/api', routes);

/**
 * 404 Not Found Handler
 * 
 * Catches requests to undefined routes.
 * Must be registered after all valid routes.
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 * 
 * Centralized error handling for all routes and middleware.
 * Formats errors according to the standard API error response format.
 * Must be registered last (after routes and 404 handler).
 */
app.use(errorHandler);

/**
 * Start Server
 * 
 * Initializes database connection and starts HTTP server.
 * Exits process if database connection fails.
 */
const startServer = async () => {
  try {
    // Verify database connection before starting server
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, {
        environment: env.NODE_ENV,
        port: env.PORT,
        frontendUrl: env.FRONTEND_URL,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 * 
 * Performs cleanup before process termination:
 * - Closes database connections
 * - Logs shutdown completion
 * 
 * @param signal - The signal that triggered shutdown (SIGTERM or SIGINT)
 */
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/**
 * Uncaught Exception Handler
 * 
 * Catches synchronous errors not handled by try/catch.
 * Logs the error and exits the process (unstable state).
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception - exiting process', error);
  process.exit(1);
});

/**
 * Unhandled Rejection Handler
 * 
 * Catches rejected promises without catch blocks.
 * Logs the error and exits the process (potential resource leaks).
 */
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection - exiting process', reason as Error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
