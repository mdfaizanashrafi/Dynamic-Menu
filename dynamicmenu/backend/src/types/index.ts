/**
 * Global Type Definitions
 * 
 * @module types/index
 * @description Shared TypeScript types and interfaces used across the application.
 * All API-related types, database input types, and domain models are defined here.
 * 
 * ## Type Categories
 * - API Response Types: Standard response formats
 * - Domain Types: Restaurant, Menu, Category, Item types
 * - Input Types: Create/Update DTOs for database operations
 * - Query Types: Filter and pagination parameters
 */

import { UserRole, MenuType, QRCodeType, DiscountType } from '@prisma/client';

// Re-export Prisma enums for convenience
export { UserRole, MenuType, QRCodeType, DiscountType };

// ============================================
// Express Type Extensions
// ============================================

/**
 * Express Request User Type
 * Attached to requests by the authentication middleware
 */
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

// ============================================
// API Response Types
// ============================================

/**
 * Standard successful API response structure
 * 
 * @template T - Type of the data payload
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": { "id": "123", "name": "Restaurant" },
 *   "meta": { "page": 1, "limit": 20, "total": 100 }
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Standard error response structure
 * 
 * @example
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid input",
 *     "details": { "email": "Must be a valid email" }
 *   }
 * }
 * ```
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryAfter?: number;
  };
}

// ============================================
// Restaurant Types
// ============================================

/**
 * Input for creating a new restaurant
 */
export interface RestaurantCreateInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultLanguage?: string;
  supportedLanguages?: string[];
}

/**
 * Input for updating an existing restaurant
 * All fields are optional (partial update)
 */
export interface RestaurantUpdateInput {
  name?: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
  isPublished?: boolean;
  defaultLanguage?: string;
  supportedLanguages?: string[];
}

// ============================================
// Menu Types
// ============================================

/**
 * Input for creating a new menu (breakfast, lunch, dinner, etc.)
 */
export interface MenuCreateInput {
  name: string;
  description?: string;
  type?: MenuType;
  /** Start time in HH:MM format for time-based menus */
  startTime?: string;
  /** End time in HH:MM format for time-based menus */
  endTime?: string;
  /** Days of week (0=Sunday, 6=Saturday) when menu is available */
  daysOfWeek?: number[];
  startDate?: Date;
  endDate?: Date;
  /** Display order among other menus */
  sortOrder?: number;
}

/**
 * Input for updating an existing menu
 */
export interface MenuUpdateInput {
  name?: string;
  description?: string;
  type?: MenuType;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  startDate?: Date;
  endDate?: Date;
  sortOrder?: number;
}

// ============================================
// Category Types
// ============================================

/**
 * Input for creating a new menu category
 */
export interface CategoryCreateInput {
  name: string;
  description?: string;
  image?: string;
  /** Menu this category belongs to */
  menuId?: string;
  sortOrder?: number;
}

/**
 * Input for updating an existing category
 */
export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  image?: string;
  menuId?: string;
  sortOrder?: number;
}

// ============================================
// Menu Item Types
// ============================================

/**
 * Input for creating a new menu item
 */
export interface MenuItemCreateInput {
  name: string;
  description?: string;
  price: number;
  /** Original price for showing discounts */
  comparePrice?: number;
  image?: string;
  images?: string[];
  categoryId: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  /** JSON object for multi-language translations */
  translations?: Record<string, unknown>;
}

/**
 * Input for updating an existing menu item
 */
export interface MenuItemUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  comparePrice?: number;
  image?: string;
  images?: string[];
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  tagIds?: string[];
  translations?: Record<string, unknown>;
}

// ============================================
// QR Code Types
// ============================================

/**
 * Input for creating a new QR code
 */
export interface QRCodeCreateInput {
  name: string;
  type: QRCodeType;
  /** Table number for table-specific QR codes */
  tableNumber?: number;
}

/**
 * Input for updating an existing QR code
 */
export interface QRCodeUpdateInput {
  name?: string;
  type?: QRCodeType;
  tableNumber?: number;
}

// ============================================
// Offer/Deal Types
// ============================================

/**
 * Input for creating a promotional offer
 */
export interface OfferCreateInput {
  name: string;
  description?: string;
  type: DiscountType;
  /** Discount value (percentage or fixed amount) */
  value: number;
  startDate: Date;
  endDate: Date;
  /** Minimum order amount to apply offer */
  minOrderAmount?: number;
  /** Maximum discount cap */
  maxDiscount?: number;
  /** Maximum number of times offer can be used */
  usageLimit?: number;
  /** Item IDs this offer applies to */
  applicableItems?: string[];
  /** Category IDs this offer applies to */
  applicableCategories?: string[];
}

/**
 * Input for updating an existing offer
 */
export interface OfferUpdateInput {
  name?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  startDate?: Date;
  endDate?: Date;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  applicableItems?: string[];
  applicableCategories?: string[];
}

// ============================================
// Analytics Types
// ============================================

/**
 * Summary of restaurant analytics
 */
export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionTime: number;
  popularItems: PopularItem[];
  peakHours: PeakHour[];
}

/**
 * Popular menu item analytics
 */
export interface PopularItem {
  itemId: string;
  name: string;
  views: number;
  image?: string;
}

/**
 * Hourly traffic analytics
 */
export interface PeakHour {
  hour: number;
  views: number;
}

// ============================================
// Auth Types
// ============================================

/**
 * Login request input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Registration request input
 */
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Authentication response containing user data and JWT token
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  token: string;
}

// ============================================
// Public Menu Types (Customer-facing)
// ============================================

/**
 * Public menu view for customers
 * Contains limited information compared to admin view
 */
export interface PublicMenu {
  id: string;
  name: string;
  description?: string;
  categories: PublicCategory[];
}

/**
 * Public category view for customers
 */
export interface PublicCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  items: PublicMenuItem[];
}

/**
 * Public menu item view for customers
 */
export interface PublicMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  tags: PublicTag[];
}

/**
 * Item tag for dietary/attribute indication
 */
export interface PublicTag {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: string;
}

/**
 * Result of scanning a QR code
 */
export interface QRScanResult {
  valid: boolean;
  restaurantSlug?: string;
  restaurantName?: string;
  qrType?: QRCodeType;
  tableNumber?: number;
  reason?: string;
}

// ============================================
// Query Parameters
// ============================================

/**
 * Standard pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Filter parameters for menu listing
 */
export interface MenuFilterParams {
  isActive?: boolean;
  type?: MenuType;
  search?: string;
}

/**
 * Filter parameters for menu item listing
 */
export interface ItemFilterParams {
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  search?: string;
}
