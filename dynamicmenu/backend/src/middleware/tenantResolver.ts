/**
 * Tenant Resolver Middleware
 *
 * @module middleware/tenantResolver
 * @description Resolves tenant context from various request sources (slug, restaurantId, QR code).
 * Attaches tenant information to the request for use in downstream middleware and route handlers.
 *
 * ## Resolution Rules
 * 1. Public Menu: Extracts slug from route params, looks up restaurantId
 * 2. Authenticated Owner: Extracts restaurantId from params, verifies ownership
 * 3. QR Code: Extracts code from params, looks up restaurantId and tableNumber
 *
 * ## Usage
 * ```typescript
 * // Public menu routes
 * router.get('/public/menu/:slug', resolveTenant('slug'), handler);
 *
 * // Authenticated owner routes
 * router.get('/api/menu/restaurant/:restaurantId', authenticate, resolveTenant('owner'), handler);
 *
 * // QR code routes
 * router.get('/api/public/qr/:code', resolveTenant('qr'), handler);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database';
import { AppError, NotFoundError, ForbiddenError } from '@utils/errors';
import { logger } from '@utils/logger';
import { TenantContext } from '../types/tenant';

/**
 * Extended Express Request with tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Type of tenant resolution to perform
 */
type ResolutionType = 'slug' | 'owner' | 'qr';

/**
 * Cache entry with expiration timestamp
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Cache TTL: 5 minutes in milliseconds
const CACHE_TTL = 5 * 60 * 1000;

// In-memory caches
const slugCache = new Map<string, CacheEntry<string>>();
const qrCache = new Map<string, CacheEntry<{ restaurantId: string; tableNumber?: number; qrType: string }>>();

/**
 * Gets a cached value if it hasn't expired
 */
const getCached = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined => {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
};

/**
 * Sets a value in cache with TTL
 */
const setCached = <T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL,
  });
};

/**
 * Clears the slug cache for a specific slug
 * Call this when a restaurant's slug is updated
 */
export const clearSlugCache = (slug: string): void => {
  slugCache.delete(slug);
  logger.debug('Cleared slug cache', { slug });
};

/**
 * Clears the QR code cache for a specific code
 */
export const clearQRCodeCache = (code: string): void => {
  qrCache.delete(code);
  logger.debug('Cleared QR code cache', { code });
};

/**
 * Clears all tenant caches
 */
export const clearAllTenantCaches = (): void => {
  slugCache.clear();
  qrCache.clear();
  logger.info('Cleared all tenant caches');
};

/**
 * Resolves restaurant ID from slug (with caching)
 */
const resolveFromSlug = async (slug: string): Promise<string> => {
  const cached = getCached(slugCache, slug);
  if (cached) return cached;

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      isActive: true,
      isPublished: true,
    },
    select: { id: true },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant', slug);
  }

  setCached(slugCache, slug, restaurant.id);
  return restaurant.id;
};

/**
 * Verifies restaurant ownership for authenticated requests
 */
const verifyOwnership = async (restaurantId: string, userId: string): Promise<void> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant', restaurantId);
  }

  if (restaurant.ownerId !== userId) {
    throw new ForbiddenError('You do not have permission to access this restaurant');
  }
};

/**
 * Resolves tenant from QR code (with caching)
 */
const resolveFromQRCode = async (code: string): Promise<{
  restaurantId: string;
  tableNumber?: number;
  qrType: string;
}> => {
  const cached = getCached(qrCache, code);
  if (cached) return cached;

  const qrCode = await prisma.qRCode.findUnique({
    where: { code },
    include: {
      restaurant: {
        select: {
          id: true,
          isActive: true,
          isPublished: true,
        },
      },
    },
  });

  if (!qrCode || !qrCode.restaurant) {
    throw new AppError('QR_NOT_FOUND', `QR Code with identifier '${code}' not found`, 404);
  }

  if (!qrCode.restaurant.isActive || !qrCode.restaurant.isPublished) {
    throw new NotFoundError('Restaurant', qrCode.restaurant.id);
  }

  const result = {
    restaurantId: qrCode.restaurant.id,
    tableNumber: qrCode.tableNumber ?? undefined,
    qrType: qrCode.type,
  };

  setCached(qrCache, code, result);
  return result;
};

/**
 * Tenant Resolution Middleware Factory
 *
 * Creates middleware that resolves tenant context based on the resolution type.
 *
 * @param type - Type of resolution to perform ('slug', 'owner', or 'qr')
 * @returns Express middleware function
 *
 * @example
 * // For public menu: /api/public/menu/:slug
 * router.get('/public/menu/:slug', resolveTenant('slug'), handler);
 *
 * // For owner routes: /api/menu/restaurant/:restaurantId
 * router.get('/menu/restaurant/:restaurantId', authenticate, resolveTenant('owner'), handler);
 *
 * // For QR routes: /api/public/qr/:code
 * router.get('/public/qr/:code', resolveTenant('qr'), handler);
 */
export const resolveTenant = (type: ResolutionType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let tenant: TenantContext;

      switch (type) {
        case 'slug': {
          const { slug } = req.params;
          if (!slug) {
            throw new NotFoundError('Restaurant', 'slug');
          }

          const restaurantId = await resolveFromSlug(slug);
          tenant = { restaurantId, slug, isPublic: true, resolvedAt: new Date() };
          break;
        }

        case 'owner': {
          const { restaurantId } = req.params;
          if (!restaurantId) {
            throw new NotFoundError('Restaurant', 'restaurantId');
          }

          if (!req.user?.id) {
            throw new ForbiddenError('Authentication required');
          }

          await verifyOwnership(restaurantId, req.user.id);
          tenant = { restaurantId, isPublic: false, resolvedAt: new Date() };
          break;
        }

        case 'qr': {
          const { code } = req.params;
          if (!code) {
            throw new AppError('QR_NOT_FOUND', 'QR Code not found', 404);
          }

          const qrData = await resolveFromQRCode(code);
          tenant = {
            restaurantId: qrData.restaurantId,
            tableNumber: qrData.tableNumber,
            qrType: qrData.qrType,
            isPublic: true,
            resolvedAt: new Date(),
          };
          break;
        }

        default:
          throw new Error(`Unknown resolution type: ${type}`);
      }

      req.tenant = tenant;
      logger.debug('Tenant resolved', { type, tenant: { ...tenant, restaurantId: tenant.restaurantId.slice(0, 8) + '...' } });
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Gets the tenant context from the request
 *
 * @param req - Express request object
 * @returns Tenant context
 * @throws {ForbiddenError} If tenant context is not set
 */
export const getTenantContext = (req: Request): TenantContext => {
  if (!req.tenant) {
    throw new ForbiddenError('Tenant context not available');
  }
  return req.tenant;
};

/**
 * Gets the restaurant ID from the request tenant context
 *
 * @param req - Express request object
 * @returns Restaurant ID
 * @throws {ForbiddenError} If tenant context is not set
 */
export const getTenantRestaurantId = (req: Request): string => {
  if (!req.tenant?.restaurantId) {
    throw new ForbiddenError('Restaurant ID not available in tenant context');
  }
  return req.tenant.restaurantId;
};

/**
 * Checks if the current request is a public (unauthenticated) request
 *
 * @param req - Express request object
 * @returns True if this is a public request
 * @throws {ForbiddenError} If tenant context is not set
 */
export const isPublicRequest = (req: Request): boolean => {
  if (!req.tenant) {
    throw new ForbiddenError('Tenant context not available');
  }
  return req.tenant.isPublic;
};
