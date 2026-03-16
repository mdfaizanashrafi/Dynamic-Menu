/**
 * Tenant Context Types
 *
 * @module types/tenant
 * @description Type definitions for multi-tenant context resolution and management.
 * These types support the tenant isolation strategy used throughout the application.
 *
 * ## Tenant Resolution Strategies
 * - **slug**: Public restaurant access via URL slug (e.g., /r/:slug)
 * - **owner**: Authenticated owner/admin accessing their restaurant
 * - **qr**: Customer scanning a QR code (table-specific access)
 */

import { UserRole } from '@prisma/client';

// ============================================
// Core Tenant Context
// ============================================

/**
 * Tenant context containing all information needed to identify
 * and process requests in a multi-tenant environment.
 *
 * This context is attached to Express requests by the tenant
 * resolution middleware and used by downstream handlers.
 */
export interface TenantContext {
  /** Restaurant ID - the tenant identifier (UUID) */
  restaurantId: string;

  /** Restaurant slug (for public routes) */
  slug?: string;

  /** Table number (for QR scans) */
  tableNumber?: number;

  /** QR code type (for QR scans) */
  qrType?: string;

  /** Whether this is a public (unauthenticated) request */
  isPublic: boolean;

  /** Timestamp when context was resolved */
  resolvedAt: Date;
}

// ============================================
// Resolution Strategy
// ============================================

/**
 * Strategy used to resolve the tenant context
 *
 * - `slug`: Resolved from URL parameter (public menu access)
 * - `owner`: Resolved from authenticated user's restaurant
 * - `qr`: Resolved from QR code scan data
 */
export type TenantResolutionStrategy = 'slug' | 'owner' | 'qr';

// ============================================
// Resolution Result
// ============================================

/**
 * Result of tenant resolution operation containing
 * the resolved context and metadata about the resolution.
 */
export interface TenantResolutionResult {
  /** The resolved tenant context */
  context: TenantContext;

  /** Whether the result was served from cache */
  cacheHit: boolean;

  /** Time taken to resolve the tenant in milliseconds */
  resolutionTimeMs: number;
}

// ============================================
// Cache Types
// ============================================

/**
 * Entry stored in the tenant resolution cache.
 * Used to avoid repeated database lookups for tenant resolution.
 */
export interface TenantCacheEntry {
  /** Restaurant ID (UUID) */
  restaurantId: string;

  /** Expiration timestamp for cache entry */
  expiresAt: Date;
}

// ============================================
// Express Type Extensions
// ============================================

declare global {
  namespace Express {
    interface Request {
      /** Tenant context - set by tenant resolver middleware */
      tenant?: TenantContext;

      /** User context - set by auth middleware */
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// ============================================
// Helper Types
// ============================================

/**
 * Type for requests with guaranteed tenant context.
 * Use this when middleware ensures tenant is always present.
 *
 * @example
 * ```typescript
 * function handleRequest(req: TenantRequest, res: Response) {
 *   // req.tenant is guaranteed to exist
 *   const { restaurantId } = req.tenant;
 * }
 * ```
 */
export type TenantRequest = Express.Request & {
  tenant: TenantContext;
};

/**
 * Type for authenticated requests.
 * Use this when middleware ensures user is always present.
 *
 * @example
 * ```typescript
 * function handleRequest(req: AuthenticatedRequest, res: Response) {
 *   // req.user is guaranteed to exist
 *   const { id, email, role } = req.user;
 * }
 * ```
 */
export type AuthenticatedRequest = Express.Request & {
  user: { id: string; email: string; role: UserRole };
};

/**
 * Type for authenticated requests with tenant context.
 * Use this for owner/admin endpoints that require both authentication
 * and tenant isolation.
 *
 * @example
 * ```typescript
 * function handleRequest(req: AuthenticatedTenantRequest, res: Response) {
 *   // Both req.user and req.tenant are guaranteed to exist
 *   const { id: userId } = req.user;
 *   const { restaurantId } = req.tenant;
 * }
 * ```
 */
export type AuthenticatedTenantRequest = Express.Request & {
  user: { id: string; email: string; role: UserRole };
  tenant: TenantContext;
};
