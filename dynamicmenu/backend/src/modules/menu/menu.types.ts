/**
 * Menu Module Types
 * Type definitions for menu, categories, and items
 */

import { z } from 'zod';
import { MenuType } from '@prisma/client';

// ============================================
// Menu Validation Schemas
// ============================================

export const createMenuSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(MenuType).default(MenuType.MAIN),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  daysOfWeek: z.array(z.number().min(1).max(7)).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortOrder: z.number().default(0),
});

export const updateMenuSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.nativeEnum(MenuType).optional(),
  isActive: z.boolean().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  daysOfWeek: z.array(z.number().min(1).max(7)).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortOrder: z.number().optional(),
});

// ============================================
// Category Validation Schemas
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  menuId: z.string().uuid().optional(),
  sortOrder: z.number().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  menuId: z.string().uuid().optional(),
  sortOrder: z.number().optional(),
});

export const reorderCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid()),
});

// ============================================
// Menu Item Validation Schemas
// ============================================

export const createMenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().max(999999),
  comparePrice: z.coerce.number().positive().max(999999).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  categoryId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.string().uuid()).optional(),
  translations: z.record(z.any()).optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive().max(999999).optional(),
  comparePrice: z.coerce.number().positive().max(999999).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  categoryId: z.string().uuid().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  sortOrder: z.number().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  translations: z.record(z.any()).optional(),
});

export const reorderMenuItemsSchema = z.object({
  itemIds: z.array(z.string().uuid()),
});

// ============================================
// Params Schemas
// ============================================

export const menuParamsSchema = z.object({
  id: z.string().uuid(),
});

export const categoryParamsSchema = z.object({
  id: z.string().uuid(),
});

export const menuItemParamsSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantParamsSchema = z.object({
  restaurantId: z.string().uuid(),
});

// ============================================
// Type Exports
// ============================================

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
