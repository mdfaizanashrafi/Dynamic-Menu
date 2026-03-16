/**
 * Menu Routes
 * API route definitions for menu, categories, and items
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateParams } from '@middleware/validate';
import * as controller from './menu.controller';
import {
  createMenuSchema,
  updateMenuSchema,
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  reorderMenuItemsSchema,
  menuParamsSchema,
  categoryParamsSchema,
  menuItemParamsSchema,
  restaurantParamsSchema,
} from './menu.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// MENU ROUTES
// ============================================

// List menus for restaurant
router.get(
  '/restaurant/:restaurantId/menus',
  validateParams(restaurantParamsSchema),
  controller.listMenus
);

// Create menu
router.post(
  '/restaurant/:restaurantId/menus',
  validateParams(restaurantParamsSchema),
  validateBody(createMenuSchema),
  controller.createMenu
);

// Get, update, delete menu
router.get(
  '/menus/:id',
  validateParams(menuParamsSchema),
  controller.getMenu
);

router.patch(
  '/menus/:id',
  validateParams(menuParamsSchema),
  validateBody(updateMenuSchema),
  controller.updateMenu
);

router.delete(
  '/menus/:id',
  validateParams(menuParamsSchema),
  controller.deleteMenu
);

// ============================================
// CATEGORY ROUTES
// ============================================

// List categories for restaurant
router.get(
  '/restaurant/:restaurantId/categories',
  validateParams(restaurantParamsSchema),
  controller.listCategories
);

// Create category
router.post(
  '/restaurant/:restaurantId/categories',
  validateParams(restaurantParamsSchema),
  validateBody(createCategorySchema),
  controller.createCategory
);

// Reorder categories
router.post(
  '/restaurant/:restaurantId/categories/reorder',
  validateParams(restaurantParamsSchema),
  validateBody(reorderCategoriesSchema),
  controller.reorderCategories
);

// Get, update, delete category
router.get(
  '/categories/:id',
  validateParams(categoryParamsSchema),
  controller.getCategory
);

router.patch(
  '/categories/:id',
  validateParams(categoryParamsSchema),
  validateBody(updateCategorySchema),
  controller.updateCategory
);

router.delete(
  '/categories/:id',
  validateParams(categoryParamsSchema),
  controller.deleteCategory
);

// ============================================
// MENU ITEM ROUTES
// ============================================

// List items for restaurant
router.get(
  '/restaurant/:restaurantId/items',
  validateParams(restaurantParamsSchema),
  controller.listMenuItems
);

// Create item
router.post(
  '/restaurant/:restaurantId/items',
  validateParams(restaurantParamsSchema),
  validateBody(createMenuItemSchema),
  controller.createMenuItem
);

// Reorder items
router.post(
  '/categories/:categoryId/items/reorder',
  validateParams(categoryParamsSchema),
  validateBody(reorderMenuItemsSchema),
  controller.reorderMenuItems
);

// Get, update, delete item
router.get(
  '/items/:id',
  validateParams(menuItemParamsSchema),
  controller.getMenuItem
);

router.patch(
  '/items/:id',
  validateParams(menuItemParamsSchema),
  validateBody(updateMenuItemSchema),
  controller.updateMenuItem
);

router.delete(
  '/items/:id',
  validateParams(menuItemParamsSchema),
  controller.deleteMenuItem
);

// Toggle availability
router.patch(
  '/items/:id/availability',
  validateParams(menuItemParamsSchema),
  controller.toggleAvailability
);

export default router;
