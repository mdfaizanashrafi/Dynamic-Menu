/**
 * Analytics Module Types
 */

import { z } from 'zod';

export const recordViewSchema = z.object({
  restaurantId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  source: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  days: z.coerce.number().min(1).max(365).optional().default(30),
});

export type RecordViewInput = z.infer<typeof recordViewSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
