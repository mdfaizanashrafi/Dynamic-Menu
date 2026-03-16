/**
 * Global Error Handler Middleware
 * 
 * @module middleware/errorHandler
 * @description Centralized error handling for all API routes.
 * 
 * ## Security Considerations
 * - Stack traces are NEVER exposed in production
 * - Internal error details are sanitized before sending to client
 * - 4xx client errors are logged at 'warn' level, not 'error'
 * - 5xx server errors are logged at 'error' level with full context
 * 
 * ## Error Response Format
 * All errors are returned in a standardized format:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human readable message",
 *     "details": {} // optional, for validation errors
 *   }
 * }
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, formatErrorResponse, isClientError } from '@utils/errors';
import { logger } from '@utils/logger';
import { env } from '@config/env';

/**
 * Maps Prisma error codes to HTTP status codes and error messages
 */
const PRISMA_ERROR_MAP: Record<string, { code: string; message: string; status: number }> = {
  // Unique constraint violations
  P2002: {
    code: 'DUPLICATE_ENTRY',
    message: 'A record with this value already exists',
    status: 409,
  },
  // Record not found
  P2025: {
    code: 'NOT_FOUND',
    message: 'Record not found',
    status: 404,
  },
  // Foreign key constraint failed
  P2003: {
    code: 'CONSTRAINT_VIOLATION',
    message: 'Referenced record does not exist',
    status: 409,
  },
  // Required constraint violation
  P2011: {
    code: 'NULL_CONSTRAINT_VIOLATION',
    message: 'Required field cannot be null',
    status: 400,
  },
  // Value too long
  P2000: {
    code: 'VALUE_TOO_LONG',
    message: 'Provided value is too long for the field',
    status: 400,
  },
};

/**
 * Determines the appropriate log level based on error type
 */
const getLogLevel = (error: AppError | Error): 'error' | 'warn' | 'debug' => {
  // Validation and not found errors are client issues - use warn
  if (error instanceof AppError) {
    if (isClientError(error.statusCode)) {
      return 'warn';
    }
    return 'error';
  }
  
  // Unknown errors are always server issues
  return 'error';
};

/**
 * Main error handler middleware
 * 
 * This middleware should be registered AFTER all routes but BEFORE the 404 handler.
 * It handles:
 * - Custom AppError instances
 * - Prisma database errors
 * - Unknown/unexpected errors
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logLevel = getLogLevel(error);
  const logContext = {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    // Only include stack trace in development logs
    ...(env.isDevelopment && { stack: error.stack }),
  };

  // Log with appropriate level
  if (logLevel === 'error') {
    logger.error(`Request error: ${error.message}`, error, logContext);
  } else if (logLevel === 'warn') {
    logger.warn(`Client error: ${error.message}`, logContext);
  } else {
    logger.debug(`Request issue: ${error.message}`, logContext);
  }

  // Handle known application errors
  if (error instanceof AppError) {
    const response = formatErrorResponse(error);
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as unknown as Record<string, unknown>;
    const code = prismaError.code as string;
    const mappedError = PRISMA_ERROR_MAP[code];

    if (mappedError) {
      // Build message with field info for unique constraint violations
      let message = mappedError.message;
      if (code === 'P2002' && prismaError.meta) {
        const fields = (prismaError.meta as { target?: string[] }).target;
        if (fields && fields.length > 0) {
          message = `Duplicate value for: ${fields.join(', ')}`;
        }
      }

      res.status(mappedError.status).json({
        success: false,
        error: {
          code: mappedError.code,
          message,
        },
      });
      return;
    }

    // Unknown Prisma error - don't expose details
    logger.error('Unhandled Prisma error', error, { code, meta: prismaError.meta });
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: env.isProduction 
          ? 'A database error occurred' 
          : `Database error: ${code}`,
      },
    });
    return;
  }

  // Handle Prisma connection errors
  if (error.name === 'PrismaClientInitializationError' || 
      error.name === 'PrismaClientRustPanicError') {
    logger.error('Database connection error', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database service temporarily unavailable',
      },
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
    return;
  }

  // Handle syntax errors (e.g., invalid JSON)
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
    });
    return;
  }

  // Unknown error - NEVER expose stack traces or internal details in production
  const statusCode = 500;
  const message = env.isProduction 
    ? 'Internal server error' 
    : error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      // Stack traces are NEVER included in the response, even in development
      // They are only logged server-side
    },
  });
};

/**
 * 404 Not Found Handler
 * 
 * This middleware should be registered AFTER all valid routes.
 * It catches requests to undefined routes and returns a standardized 404 response.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.debug(`Route not found: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
