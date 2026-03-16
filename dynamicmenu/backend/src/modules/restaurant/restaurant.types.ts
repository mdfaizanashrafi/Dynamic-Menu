/**
 * Restaurant Module Types
 * Type definitions specific to restaurant operations
 */

import { z } from 'zod';
import { Restaurant, Menu, Category, QRCode } from '@prisma/client';

// ============================================
// Validation Schemas
// ============================================

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  defaultLanguage: z.string().length(2).optional(),
  supportedLanguages: z.array(z.string().length(2)).optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  defaultLanguage: z.string().length(2).optional(),
  supportedLanguages: z.array(z.string().length(2)).optional(),
});

export const restaurantParamsSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantSlugSchema = z.object({
  slug: z.string().min(2),
});

// ============================================
// Type Exports
// ============================================

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;

export interface RestaurantWithRelations extends Restaurant {
  menus?: Menu[];
  categories?: Category[];
  qrCodes?: QRCode[];
  _count?: {
    menus: number;
    categories: number;
    menuItems: number;
  };
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
  createdAt: Date;
}
