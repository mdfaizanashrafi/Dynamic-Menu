/**
 * Tenant-Aware Logging Helper
 *
 * @module utils/tenantLogger
 * @description Provides logging utilities that automatically include tenant context
 * from Express requests. Supports sensitive data redaction, performance tracking,
 * and structured logging with tenant isolation.
 *
 * @example
 * ```typescript
 * // Basic usage
 * tenantLogger.info(req, 'Menu item created', { itemId: newItem.id });
 *
 * // With performance tracking
 * const endTimer = createTimer(req);
 * const result = await someOperation();
 * tenantLogger.info(req, 'Operation completed', {
 *   durationMs: endTimer(),
 *   result
 * });
 *
 * // Middleware setup
 * app.use(requestLoggingMiddleware);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger';

/**
 * Tenant context for logging purposes
 * This is a local type specific to tenant logging with optional fields
 */
interface TenantLogContext {
  /** Restaurant unique identifier */
  restaurantId?: string;
  /** Restaurant slug for public access */
  slug?: string;
  /** Authenticated user ID */
  userId?: string;
  /** Whether this is a public (unauthenticated) request */
  isPublic: boolean;
}

/**
 * Sensitive field patterns for automatic redaction
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /jwt/i,
  /api[_-]?key/i,
  /secret/i,
  /credit[_-]?card/i,
  /card[_-]?number/i,
  /cvv/i,
  /authorization/i,
  /cookie/i,
  /session/i,
];

/**
 * Redacted value placeholder
 */
const REDACTED = '[REDACTED]';

/**
 * Recursively redacts sensitive data from an object
 *
 * @param obj - Object to redact sensitive fields from
 * @returns Redacted object copy
 */
function redactSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Redact JWT tokens (base64 encoded strings with typical JWT structure)
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(obj)) {
      return REDACTED;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Check if key matches any sensitive pattern
      const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
      redacted[key] = isSensitive ? REDACTED : redactSensitiveData(value);
    }
    return redacted;
  }

  return obj;
}

/**
 * Safely extracts tenant context from Express request
 *
 * @param req - Express request object
 * @returns Tenant context or null if not available
 */
export function extractTenantContext(
  req: Request
): TenantLogContext | null {
  if (!req) {
    return null;
  }

  const restaurantId = req.params?.restaurantId || req.params?.id || undefined;
  const slug = req.params?.slug || undefined;
  const userId = req.user?.id || undefined;

  // A request is public if there's no authenticated user
  const isPublic = !req.user;

  // Only return context if we have at least some identifying information
  if (!restaurantId && !slug && !userId) {
    return { isPublic };
  }

  return {
    restaurantId: restaurantId || '',
    slug,
    userId,
    isPublic,
  };
}

/**
 * Creates a timer for tracking operation duration
 *
 * @param _req - Express request object (for context association)
 * @returns Function that returns elapsed milliseconds since creation
 *
 * @example
 * ```typescript
 * const endTimer = createTimer(req);
 * await someAsyncOperation();
 * const durationMs = endTimer(); // Returns elapsed milliseconds
 * ```
 */
export function createTimer(_req: Request): () => number {
  const startTime = process.hrtime.bigint();

  return (): number => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    return Math.round(durationMs);
  };
}

/**
 * Builds a structured log entry with tenant context
 *
 * @param req - Express request object
 * @param level - Log level
 * @param message - Log message
 * @param meta - Additional metadata
 * @returns Structured log object
 */
function buildLogEntry(
  req: Request | null,
  level: string,
  message: string,
  meta?: Record<string, unknown>
): Record<string, unknown> {
  const timestamp = new Date().toISOString();
  const tenantContext = req ? extractTenantContext(req) : null;

  // Build tenant info section
  const tenant: Record<string, unknown> = {
    isPublic: tenantContext?.isPublic ?? true,
  };

  if (tenantContext?.restaurantId) {
    tenant.restaurantId = tenantContext.restaurantId;
  }

  if (tenantContext?.slug) {
    tenant.slug = tenantContext.slug;
  }

  // Build user info section
  const user: Record<string, unknown> = {};
  if (tenantContext?.userId) {
    user.id = tenantContext.userId;
  }
  if (req?.user?.role) {
    user.role = req.user.role;
  }

  // Build request info section
  const request: Record<string, unknown> = {};
  if (req) {
    request.method = req.method;
    request.path = req.originalUrl || req.url;
  }

  // Include duration from meta if present
  if (meta?.durationMs) {
    request.durationMs = meta.durationMs;
  }

  // Redact sensitive data from meta
  const safeMeta = meta ? redactSensitiveData(meta) : undefined;

  // Clean meta of durationMs if it was moved to request
  if (safeMeta && typeof safeMeta === 'object' && 'durationMs' in safeMeta) {
    const { durationMs: _, ...rest } = safeMeta as Record<string, unknown>;
    if (Object.keys(rest).length > 0) {
      Object.assign(safeMeta, rest);
    }
  }

  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
    tenant,
  };

  // Only add user section if there's user data
  if (Object.keys(user).length > 0) {
    logEntry.user = user;
  }

  // Only add request section if there's request data
  if (Object.keys(request).length > 0) {
    logEntry.request = request;
  }

  // Add metadata if present and not empty
  if (safeMeta && typeof safeMeta === 'object' && Object.keys(safeMeta).length > 0) {
    // Remove durationMs from meta since it's in request
    const { durationMs: _, ...metaWithoutDuration } = safeMeta as Record<string, unknown>;
    if (Object.keys(metaWithoutDuration).length > 0) {
      logEntry.meta = metaWithoutDuration;
    }
  }

  return logEntry;
}

/**
 * Logs a message with tenant context automatically included
 *
 * @param req - Express request object
 * @param level - Log level (info, warn, error, debug)
 * @param message - Log message
 * @param meta - Additional metadata to include in log
 */
export function logWithTenant(
  req: Request,
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  meta?: Record<string, unknown>
): void {
  const logEntry = buildLogEntry(req, level, message, meta);

  switch (level) {
    case 'info':
      logger.info(message, logEntry);
      break;
    case 'warn':
      logger.warn(message, logEntry);
      break;
    case 'error':
      logger.error(message, logEntry);
      break;
    case 'debug':
      logger.debug(message, logEntry);
      break;
    default:
      logger.info(message, logEntry);
  }
}

/**
 * Tenant-aware logger with convenience methods
 *
 * @example
 * ```typescript
 * tenantLogger.info(req, 'Menu item created', { itemId: newItem.id });
 * tenantLogger.error(req, 'Database connection failed', { error: err.message });
 * ```
 */
export const tenantLogger = {
  /**
   * Log an info level message with tenant context
   * @param req - Express request object
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info: (req: Request, message: string, meta?: Record<string, unknown>): void =>
    logWithTenant(req, 'info', message, meta),

  /**
   * Log a warn level message with tenant context
   * @param req - Express request object
   * @param message - Log message
   * @param meta - Additional metadata
   */
  warn: (req: Request, message: string, meta?: Record<string, unknown>): void =>
    logWithTenant(req, 'warn', message, meta),

  /**
   * Log an error level message with tenant context
   * @param req - Express request object
   * @param message - Log message
   * @param meta - Additional metadata
   */
  error: (req: Request, message: string, meta?: Record<string, unknown>): void =>
    logWithTenant(req, 'error', message, meta),

  /**
   * Log a debug level message with tenant context
   * @param req - Express request object
   * @param message - Log message
   * @param meta - Additional metadata
   */
  debug: (req: Request, message: string, meta?: Record<string, unknown>): void =>
    logWithTenant(req, 'debug', message, meta),
};

/**
 * Express middleware for logging all HTTP requests with tenant context
 *
 * Logs each request with:
 * - Method and URL
 * - Tenant info (restaurantId, slug)
 * - User ID (if authenticated)
 * - Response time
 * - Status code
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const endTimer = createTimer(req);

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response status
  // Using a more flexible type that accepts any arguments
  res.end = function (this: Response, ...args: unknown[]): Response {
    // Restore original end function
    res.end = originalEnd;

    // Calculate duration
    const durationMs = endTimer();

    // Get status code
    const statusCode = res.statusCode;

    // Determine log level based on status code
    let level: 'info' | 'warn' | 'error' = 'info';
    if (statusCode >= 500) {
      level = 'error';
    } else if (statusCode >= 400) {
      level = 'warn';
    }

    // Build log message
    const message = `${req.method} ${req.originalUrl || req.url} ${statusCode}`;

    // Log with tenant context
    logWithTenant(req, level, message, {
      durationMs,
      statusCode,
      contentLength: res.get('content-length'),
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket.remoteAddress,
    });

    // Call original end function with all arguments
    return originalEnd.apply(res, args as Parameters<Response['end']>);
  };

  next();
}
