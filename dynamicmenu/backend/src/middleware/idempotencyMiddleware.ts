/**
 * Idempotency Middleware
 *
 * @module middleware/idempotency
 * @description Ensures safe request retries by caching responses for idempotent requests.
 *
 * ## Features
 * - In-memory storage with TTL-based expiration
 * - SHA-256 request hashing for request fingerprinting
 * - Conflict detection when keys are reused with different requests
 * - Automatic cleanup of expired entries
 *
 * ## Usage
 * ```typescript
 * import { idempotencyMiddleware } from '@middleware/idempotency';
 *
 * // Apply to specific routes
 * router.post('/orders', idempotencyMiddleware, createOrder);
 * router.put('/orders/:id', idempotencyMiddleware, updateOrder);
 *
 * // Client usage: Include 'Idempotency-Key: <uuid>' header
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '@utils/logger';
import { env } from '@config/env';

// ============================================
// Configuration
// ============================================

/** Default TTL for idempotency entries (24 hours in milliseconds) */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 86400000 ms

/** Configurable TTL from environment variable */
const IDEMPOTENCY_TTL_MS = parseInt(String(env.IDEMPOTENCY_TTL_MS || '86400000'), 10);

/** Maximum length for idempotency keys */
const MAX_KEY_LENGTH = 64;

/** Cleanup interval (1 hour in milliseconds) */
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

/** HTTP header name for idempotency key */
const IDEMPOTENCY_HEADER = 'idempotency-key';

// ============================================
// Type Definitions
// ============================================

/**
 * Stored idempotency entry
 */
export interface IdempotencyEntry {
  /** The idempotency key */
  key: string;
  /** API endpoint path */
  endpoint: string;
  /** HTTP method */
  method: string;
  /** SHA-256 hash of the request context */
  requestHash: string;
  /** Cached response body */
  responseBody: unknown;
  /** HTTP status code of the cached response */
  statusCode: number;
  /** When the entry was created */
  createdAt: Date;
  /** Expiration timestamp */
  expiresAt: number;
}

/**
 * Idempotency storage interface
 */
export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyEntry | null>;
  set(key: string, entry: IdempotencyEntry, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Extended Express Response type for capturing json method
 */
interface CapturedResponse extends Response {
  _json?: (body: unknown) => Response;
}

// ============================================
// In-Memory Store Implementation
// ============================================

/**
 * In-memory idempotency store with TTL support
 */
class InMemoryIdempotencyStore implements IdempotencyStore {
  private entries: Map<string, IdempotencyEntry> = new Map();

  /**
   * Retrieves an entry by key if it exists and hasn't expired
   */
  async get(key: string): Promise<IdempotencyEntry | null> {
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Stores an entry with the specified TTL
   */
  async set(key: string, entry: IdempotencyEntry, ttlMs: number): Promise<void> {
    entry.expiresAt = Date.now() + ttlMs;
    this.entries.set(key, entry);
  }

  /**
   * Deletes an entry by key
   */
  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  /**
   * Removes all expired entries
   * @returns Number of entries cleaned up
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Gets current store size for monitoring
   */
  get size(): number {
    return this.entries.size;
  }
}

// Global store instance
const idempotencyStore = new InMemoryIdempotencyStore();

// ============================================
// Cleanup Scheduler
// ============================================

/**
 * Runs cleanup of expired entries
 */
const runCleanup = (): void => {
  const cleaned = idempotencyStore.cleanup();
  if (cleaned > 0) {
    logger.debug(`Idempotency store cleanup: removed ${cleaned} expired entries`, {
      remaining: idempotencyStore.size,
    });
  }
};

// Start cleanup interval (runs every hour)
setInterval(runCleanup, CLEANUP_INTERVAL_MS);

// ============================================
// Helper Functions
// ============================================

/**
 * Checks if an HTTP method supports idempotency
 *
 * @param method - HTTP method to check
 * @returns True if the method is idempotent (POST, PUT, PATCH)
 *
 * @example
 * ```typescript
 * isIdempotentMethod('POST');   // true
 * isIdempotentMethod('GET');    // false
 * isIdempotentMethod('DELETE'); // false
 * ```
 */
export const isIdempotentMethod = (method: string): boolean => {
  const idempotentMethods = ['POST', 'PUT', 'PATCH'];
  return idempotentMethods.includes(method.toUpperCase());
};

/**
 * Extracts and validates the idempotency key from request headers
 *
 * @param req - Express request object
 * @returns Validated idempotency key or null if not present/invalid
 *
 * @description
 * - Strips whitespace from the key
 * - Validates maximum length (64 characters)
 * - Returns null for invalid keys
 */
export const getIdempotencyKey = (req: Request): string | null => {
  const rawKey = req.headers[IDEMPOTENCY_HEADER];

  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  // Strip whitespace and validate
  const key = rawKey.trim();

  if (key.length === 0 || key.length > MAX_KEY_LENGTH) {
    logger.warn('Invalid idempotency key length', {
      keyLength: key.length,
      maxLength: MAX_KEY_LENGTH,
    });
    return null;
  }

  return key;
};

/**
 * Generates a SHA-256 hash of the request context
 *
 * @param req - Express request object
 * @returns Hex-encoded SHA-256 hash string
 *
 * @description
 * The hash includes:
 * - HTTP method
 * - Request path (endpoint)
 * - Request body (JSON serialized)
 *
 * This ensures that the same request payload produces the same hash,
 * while different requests (even to the same endpoint) produce different hashes.
 */
export const generateRequestHash = (req: Request): string => {
  const hashContent = JSON.stringify({
    method: req.method.toUpperCase(),
    endpoint: req.path,
    body: req.body || {},
  });

  return crypto.createHash('sha256').update(hashContent).digest('hex');
};

/**
 * Determines if a status code represents a successful response
 *
 * @param statusCode - HTTP status code
 * @returns True if status code is in the 2xx range
 */
const isSuccessStatus = (statusCode: number): boolean => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Creates a replay response with idempotency metadata
 *
 * @param entry - The stored idempotency entry
 * @returns Response object with replay metadata
 */
const createReplayResponse = (entry: IdempotencyEntry): unknown => {
  const baseResponse = entry.responseBody as Record<string, unknown>;

  return {
    ...baseResponse,
    meta: {
      ...(baseResponse.meta as Record<string, unknown> || {}),
      idempotencyReplay: true,
      originalTimestamp: entry.createdAt.toISOString(),
    },
  };
};

// ============================================
// Middleware
// ============================================

/**
 * Idempotency Middleware
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @description
 * Processes requests with idempotency keys:
 *
 * 1. **No idempotency key**: Proceeds normally (no idempotency)
 * 2. **New key**: Captures the response and stores it for future replays
 * 3. **Existing key with matching request**: Returns cached response with replay metadata
 * 4. **Existing key with different request**: Returns 409 CONFLICT error
 *
 * Only successful responses (2xx status codes) are cached. Failed requests
 * can be retried with the same idempotency key.
 *
 * @example
 * ```typescript
 * router.post('/orders', idempotencyMiddleware, createOrder);
 * ```
 */
export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Only process idempotent methods
  if (!isIdempotentMethod(req.method)) {
    next();
    return;
  }

  const idempotencyKey = getIdempotencyKey(req);

  // No idempotency key provided - proceed normally
  if (!idempotencyKey) {
    next();
    return;
  }

  try {
    const existingEntry = await idempotencyStore.get(idempotencyKey);
    const currentRequestHash = generateRequestHash(req);

    if (existingEntry) {
      // Key exists - check if request hash matches
      if (existingEntry.requestHash === currentRequestHash) {
        // Same request - return cached response with replay metadata
        logger.debug('Idempotency replay detected', {
          key: idempotencyKey,
          endpoint: req.path,
          method: req.method,
          originalTimestamp: existingEntry.createdAt,
        });

        const replayResponse = createReplayResponse(existingEntry);
        res.status(existingEntry.statusCode).json(replayResponse);
        return;
      }

      // Different request with same key - CONFLICT
      logger.warn('Idempotency key reused with different request', {
        key: idempotencyKey,
        endpoint: req.path,
        method: req.method,
        originalEndpoint: existingEntry.endpoint,
        originalMethod: existingEntry.method,
      });

      res.status(409).json({
        success: false,
        error: {
          code: 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST',
          message: 'Idempotency key was used with a different request body',
        },
      });
      return;
    }

    // Key doesn't exist - capture the response
    logger.debug('Idempotency key registered', {
      key: idempotencyKey,
      endpoint: req.path,
      method: req.method,
    });

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to capture successful responses
    res.json = function (body: unknown): Response {
      // Restore original json method to prevent double-processing
      res.json = originalJson;

      // Only cache successful responses (2xx status codes)
      if (isSuccessStatus(res.statusCode)) {
        const entry: IdempotencyEntry = {
          key: idempotencyKey,
          endpoint: req.path,
          method: req.method,
          requestHash: currentRequestHash,
          responseBody: body,
          statusCode: res.statusCode,
          createdAt: new Date(),
          expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
        };

        // Store asynchronously - don't block the response
        idempotencyStore.set(idempotencyKey, entry, IDEMPOTENCY_TTL_MS).catch((error) => {
          logger.error('Failed to store idempotency entry', error as Error, {
            key: idempotencyKey,
          });
        });

        logger.debug('Idempotency response cached', {
          key: idempotencyKey,
          statusCode: res.statusCode,
          ttlMs: IDEMPOTENCY_TTL_MS,
        });
      } else {
        logger.debug('Idempotency: not caching non-success response', {
          key: idempotencyKey,
          statusCode: res.statusCode,
        });
      }

      // Send the original response
      return originalJson(body);
    };

    next();
  } catch (error) {
    logger.error('Idempotency middleware error', error as Error, {
      key: idempotencyKey,
      endpoint: req.path,
    });
    // On error, proceed normally without idempotency
    next();
  }
};

// ============================================
// Exports
// ============================================

export { idempotencyStore, InMemoryIdempotencyStore, IDEMPOTENCY_TTL_MS };
export default idempotencyMiddleware;
