/**
 * Frontend Type Definitions
 * 
 * Shared TypeScript types and interfaces used across the frontend application.
 * Mirrors the backend types for type-safe API communication.
 */

// ============================================
// Enums (mirroring Prisma enums)
// ============================================

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export enum MenuType {
  MAIN = 'MAIN',
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  BRUNCH = 'BRUNCH',
  SEASONAL = 'SEASONAL',
  SPECIAL = 'SPECIAL',
}

export enum QRCodeType {
  RESTAURANT = 'RESTAURANT',
  TABLE = 'TABLE',
  ROOM = 'ROOM',
  BAR = 'BAR',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export enum QRCodeSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  XL = 'XL',
}

export enum QRFrameStyle {
  NONE = 'NONE',
  ROUNDED = 'ROUNDED',
  FANCY = 'FANCY',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_ITEM = 'FREE_ITEM',
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor: string;
  secondaryColor: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  isActive?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  isPublished: boolean;
  menuCount: number;
  itemCount: number;
  createdAt: string;
}

// ============================================
// Menu Types
// ============================================

export interface Menu {
  id: string;
  name: string;
  description?: string;
  type: MenuType;
  isActive: boolean;
  isSeasonal: boolean;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  restaurantId: string;
  categories?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  restaurantId: string;
  menuId?: string;
  items: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  image?: string;
  images?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  sortOrder: number;
  categoryId: string;
  restaurantId?: string;
  tags?: Tag[];
  translations?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: string;
}

// ============================================
// Public Menu Types (Customer-facing)
// ============================================

export interface PublicMenu {
  id: string;
  name: string;
  description?: string;
  categories: PublicCategory[];
}

export interface PublicCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  items: PublicMenuItem[];
}

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

export interface PublicTag {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: string;
}

export interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}

export interface CurrentMenuData {
  restaurant: Restaurant;
  menus: Menu[];
  currentTime: string;
}

// ============================================
// QR Code Types
// ============================================

export interface QRCodeDownloadUrls {
  small: {
    png: string;
    svg?: string;
  };
  medium: {
    png: string;
    svg?: string;
  };
  large: {
    png: string;
    svg?: string;
    pdf?: string;
  };
  xl: {
    png: string;
    svg?: string;
    pdf?: string;
  };
}

export interface QRCode {
  id: string;
  name: string;
  type: QRCodeType;
  code: string;
  tableNumber?: number;
  redirectUrl?: string;
  pngUrl?: string;
  svgUrl?: string;
  pdfUrl?: string;
  downloadUrls?: QRCodeDownloadUrls;
  scanCount: number;
  lastScanAt?: string;
  restaurantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QRCodeWithBranding extends QRCode {
  branding: {
    restaurantName: string;
    logo?: string;
    primaryColor: string;
    qrColor: string;
    frameStyle: QRFrameStyle;
  };
}

export interface QRScanResult {
  valid: boolean;
  restaurantSlug?: string;
  restaurantName?: string;
  qrType?: QRCodeType;
  tableNumber?: number;
  reason?: string;
}

export interface QRDesignOptions {
  color: string;
  frameStyle: QRFrameStyle;
  logoUrl?: string;
}

export interface CreateQRCodeInput {
  name: string;
  type?: QRCodeType;
  tableNumber?: number;
  size?: QRCodeSize;
  color?: string;
  frameStyle?: QRFrameStyle;
}

export interface RegenerateQRCodeInput {
  color?: string;
  frameStyle?: QRFrameStyle;
}

export interface DownloadQRCodeInput {
  size?: QRCodeSize;
  format?: 'PNG' | 'SVG' | 'PDF';
}

// ============================================
// Offer Types
// ============================================

export interface Offer {
  id: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  restaurantId: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgSessionTime: number;
  popularItems: PopularItem[];
  peakHours: PeakHour[];
}

export interface PopularItem {
  itemId: string;
  name: string;
  views: number;
  image?: string;
}

export interface PeakHour {
  hour: number;
  views: number;
}

// ============================================
// Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// API Error Types
// ============================================

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly retryAfter?: number;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>,
    retryAfter?: number
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.retryAfter = retryAfter;
    this.name = 'ApiError';
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

// ============================================
// Query Parameters
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface MenuFilterParams {
  isActive?: boolean;
  type?: MenuType;
  search?: string;
}

export interface ItemFilterParams {
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  search?: string;
}
