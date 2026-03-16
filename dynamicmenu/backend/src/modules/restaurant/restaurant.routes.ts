/**
 * Restaurant Routes
 * API route definitions for restaurant endpoints
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateParams } from '@middleware/validate';
import { resolveTenant } from '@middleware/tenantResolver';
import { idempotencyMiddleware } from '@middleware/idempotencyMiddleware';
import { z } from 'zod';
import * as controller from './restaurant.controller';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantParamsSchema,
} from './restaurant.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List all restaurants for current user
router.get('/', controller.list);

// Create new restaurant with idempotency
router.post(
  '/',
  idempotencyMiddleware,
  validateBody(createRestaurantSchema),
  controller.create
);

// Generate unique slug
router.post('/generate-slug', controller.generateSlug);

// Get restaurant by ID with tenant resolution and ownership verification
router.get(
  '/:id',
  resolveTenant('owner'),
  validateParams(restaurantParamsSchema),
  controller.getById
);

// Get restaurant by slug
router.get('/by-slug/:slug', controller.getBySlug);

// Get restaurant statistics with tenant resolution
router.get(
  '/:id/stats',
  resolveTenant('owner'),
  validateParams(restaurantParamsSchema),
  controller.getStats
);

// Update restaurant with tenant resolution and idempotency
router.patch(
  '/:id',
  resolveTenant('owner'),
  idempotencyMiddleware,
  validateParams(restaurantParamsSchema),
  validateBody(updateRestaurantSchema),
  controller.update
);

// Delete restaurant with tenant resolution
router.delete(
  '/:id',
  resolveTenant('owner'),
  validateParams(restaurantParamsSchema),
  controller.remove
);

export default router;
