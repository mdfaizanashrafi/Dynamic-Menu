/**
 * Offer Module Types
 * Type definitions for offers and promotions
 */

import { z } from 'zod';
import { DiscountType } from '@prisma/client';

// ============================================
// Offer Validation Schemas
// ============================================

export const createOfferSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.coerce.number().nonnegative().max(999999),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateOfferSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.coerce.number().nonnegative().max(999999).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============================================
// Params Schemas
// ============================================

export const offerParamsSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantParamsSchema = z.object({
  restaurantId: z.string().uuid(),
});

// ============================================
// Type Exports
// ============================================

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

export interface OfferResponse {
  id: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListOffersOptions {
  page: number;
  limit: number;
  includeInactive?: boolean;
  activeOnly?: boolean;
}
