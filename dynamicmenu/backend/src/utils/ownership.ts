/**
 * Ownership Validation Helper
 *
 * @module utils/ownership
 * @description Utility functions for verifying restaurant ownership and user permissions.
 * Provides caching for performance and role-based access control.
 *
 * @example
 * // Verify ownership
 * const isOwner = await verifyRestaurantOwnership(userId, restaurantId);
 *
 * @example
 * // Assert ownership (throws if not owner)
 * await assertRestaurantOwnership(req.user.id, req.params.restaurantId);
 *
 * @example
 * // Check role-based permission
 * const canManage = await checkUserPermission(userId, restaurantId, UserRole.MANAGER);
 */

import { prisma } from '@config/database';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '@utils/errors';
import { logger } from '@utils/logger';

// ============================================
// Cache Configuration
// ============================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

const ownershipCache = new Map<string, CacheEntry>();

// ============================================
// Cache Helpers
// ============================================

function getCacheKey(userId: string, restaurantId: string): string {
  return `ownership:${userId}:${restaurantId}`;
}

function getFromCache(key: string): boolean | undefined {
  const entry = ownershipCache.get(key);

  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    ownershipCache.delete(key);
    return undefined;
  }

  return entry.value;
}

function setCache(key: string, value: boolean): void {
  ownershipCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function isRoleSufficient(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    [UserRole.OWNER]: 3,
    [UserRole.MANAGER]: 2,
    [UserRole.STAFF]: 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}

// ============================================
// Core Ownership Functions
// ============================================

/**
 * Verifies if a user owns a specific restaurant (database query)
 */
export async function verifyRestaurantOwnership(
  userId: string,
  restaurantId: string
): Promise<boolean> {
  logger.debug('Checking restaurant ownership', { userId, restaurantId });

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true },
    });

    const owns = restaurant?.ownerId === userId;

    if (!owns) {
      logger.warn('Ownership check failed', { userId, restaurantId });
    }

    return owns;
  } catch (error) {
    logger.error('Error checking ownership', error as Error, { userId, restaurantId });
    return false;
  }
}

/**
 * Verifies ownership with caching (5-minute TTL)
 */
export async function verifyRestaurantOwnershipCached(
  userId: string,
  restaurantId: string
): Promise<boolean> {
  const cacheKey = getCacheKey(userId, restaurantId);
  const cached = getFromCache(cacheKey);

  if (cached !== undefined) {
    logger.debug('Ownership cache hit', { userId, restaurantId });
    return cached;
  }

  logger.debug('Ownership cache miss', { userId, restaurantId });

  const result = await verifyRestaurantOwnership(userId, restaurantId);
  setCache(cacheKey, result);

  return result;
}

/**
 * Asserts ownership - throws ForbiddenError if user doesn't own the restaurant
 */
export async function assertRestaurantOwnership(
  userId: string,
  restaurantId: string
): Promise<void> {
  const isOwner = await verifyRestaurantOwnershipCached(userId, restaurantId);

  if (!isOwner) {
    logger.warn('Ownership assertion failed', { userId, restaurantId });
    throw new ForbiddenError('You do not have permission to access this restaurant');
  }
}

// ============================================
// User Restaurant Functions
// ============================================

/**
 * Gets all restaurant IDs owned by a user
 */
export async function getUserRestaurantIds(userId: string): Promise<string[]> {
  logger.debug('Fetching user restaurants', { userId });

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  return restaurants.map((r) => r.id);
}

// ============================================
// Permission Functions
// ============================================

/**
 * Checks if user has required role permission for a restaurant
 *
 * Role hierarchy:
 * - OWNER (3): can do everything
 * - MANAGER (2): can manage menus, items, categories
 * - STAFF (1): can view analytics, toggle item availability
 */
export async function checkUserPermission(
  userId: string,
  restaurantId: string,
  requiredRole: UserRole
): Promise<boolean> {
  logger.debug('Checking user permission', { userId, restaurantId, requiredRole });

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      restaurants: { some: { id: restaurantId } },
    },
    select: { role: true },
  });

  if (!user) {
    logger.warn('Permission check failed - user not associated', {
      userId,
      restaurantId,
    });
    return false;
  }

  const hasPermission = isRoleSufficient(user.role, requiredRole);

  if (!hasPermission) {
    logger.warn('Permission check failed - insufficient role', {
      userId,
      restaurantId,
      userRole: user.role,
      requiredRole,
    });
  }

  return hasPermission;
}

// ============================================
// Cache Management
// ============================================

/**
 * Clears ownership cache for a specific user or all users
 */
export function clearOwnershipCache(userId?: string): void {
  if (userId) {
    let clearedCount = 0;
    for (const key of ownershipCache.keys()) {
      if (key.startsWith(`ownership:${userId}:`)) {
        ownershipCache.delete(key);
        clearedCount++;
      }
    }
    logger.debug('Cleared ownership cache for user', { userId, clearedCount });
  } else {
    const totalEntries = ownershipCache.size;
    ownershipCache.clear();
    logger.debug('Cleared all ownership cache entries', { totalEntries });
  }
}
