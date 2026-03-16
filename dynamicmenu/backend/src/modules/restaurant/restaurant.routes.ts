/**
 * Restaurant Routes
 * API route definitions for restaurant endpoints
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateParams } from '@middleware/validate';
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

// Create new restaurant
router.post(
  '/',
  validateBody(createRestaurantSchema),
  controller.create
);

// Generate unique slug
router.post('/generate-slug', controller.generateSlug);

// Get restaurant by ID
router.get(
  '/:id',
  validateParams(restaurantParamsSchema),
  controller.getById
);

// Get restaurant by slug
router.get('/by-slug/:slug', controller.getBySlug);

// Get restaurant statistics
router.get(
  '/:id/stats',
  validateParams(restaurantParamsSchema),
  controller.getStats
);

// Update restaurant
router.patch(
  '/:id',
  validateParams(restaurantParamsSchema),
  validateBody(updateRestaurantSchema),
  controller.update
);

// Delete restaurant
router.delete(
  '/:id',
  validateParams(restaurantParamsSchema),
  controller.remove
);

export default router;
