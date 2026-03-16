/**
 * Menu Service
 * Business logic layer for menu operations
 */

import { Menu, Category, MenuItem } from '@prisma/client';
import { logger } from '@utils/logger';
import * as repository from './menu.repository';
import {
  CreateMenuInput,
  UpdateMenuInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.types';

// ============================================
// MENU SERVICES
// ============================================

export const createMenu = async (
  data: CreateMenuInput,
  restaurantId: string
): Promise<Menu> => {
  const menu = await repository.createMenu(data, restaurantId);
  logger.info('Menu service: created', { menuId: menu.id });
  return menu;
};

export const getMenuById = async (id: string): Promise<Menu> => {
  return repository.findMenuById(id);
};

export const listMenus = async (
  restaurantId: string,
  options: { page: number; limit: number; includeInactive?: boolean }
) => {
  const { menus, total } = await repository.findMenusByRestaurant(restaurantId, options);

  return {
    menus,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
};

export const updateMenu = async (
  id: string,
  data: UpdateMenuInput
): Promise<Menu> => {
  const menu = await repository.updateMenu(id, data);
  logger.info('Menu service: updated', { menuId: id });
  return menu;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await repository.deleteMenu(id);
  logger.info('Menu service: deleted', { menuId: id });
};

// ============================================
// CATEGORY SERVICES
// ============================================

export const createCategory = async (
  data: CreateCategoryInput,
  restaurantId: string
): Promise<Category> => {
  const category = await repository.createCategory(data, restaurantId);
  logger.info('Category service: created', { categoryId: category.id });
  return category;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  return repository.findCategoryById(id);
};

export const listCategories = async (
  restaurantId: string,
  options?: { menuId?: string }
): Promise<Category[]> => {
  return repository.findCategoriesByRestaurant(restaurantId, options);
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryInput
): Promise<Category> => {
  const category = await repository.updateCategory(id, data);
  logger.info('Category service: updated', { categoryId: id });
  return category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await repository.deleteCategory(id);
  logger.info('Category service: deleted', { categoryId: id });
};

export const reorderCategories = async (
  restaurantId: string,
  categoryIds: string[]
): Promise<void> => {
  await repository.reorderCategories(restaurantId, categoryIds);
  logger.info('Category service: reordered', { restaurantId });
};

// ============================================
// MENU ITEM SERVICES
// ============================================

export const createMenuItem = async (
  data: CreateMenuItemInput,
  restaurantId: string
): Promise<MenuItem> => {
  const item = await repository.createMenuItem(data, restaurantId);
  logger.info('Menu item service: created', { itemId: item.id });
  return item;
};

export const getMenuItemById = async (
  id: string
): Promise<MenuItem> => {
  return repository.findMenuItemById(id);
};

export const listMenuItems = async (
  restaurantId: string,
  options: {
    page: number;
    limit: number;
    categoryId?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    search?: string;
  }
) => {
  const { items, total } = await repository.findMenuItemsByRestaurant(restaurantId, options);

  return {
    items,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
};

export const updateMenuItem = async (
  id: string,
  data: UpdateMenuItemInput
): Promise<MenuItem> => {
  const item = await repository.updateMenuItem(id, data);
  logger.info('Menu item service: updated', { itemId: id });
  return item;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  await repository.deleteMenuItem(id);
  logger.info('Menu item service: deleted', { itemId: id });
};

export const reorderMenuItems = async (
  categoryId: string,
  itemIds: string[]
): Promise<void> => {
  await repository.reorderMenuItems(categoryId, itemIds);
  logger.info('Menu item service: reordered', { categoryId });
};

export const toggleAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<MenuItem> => {
  const item = await repository.toggleItemAvailability(id, isAvailable);
  logger.info('Menu item service: availability toggled', { itemId: id, isAvailable });
  return item;
};

// ============================================
// PUBLIC MENU SERVICES (Customer-facing)
// ============================================

/**
 * Check if current time is within menu's time window
 * Handles edge cases: null values, overnight ranges (e.g., 22:00 - 02:00)
 */
const isWithinTimeWindow = (startTime: string | null, endTime: string | null): boolean => {
  // If no time restrictions, menu is always available
  if (!startTime && !endTime) return true;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours * 60 + currentMinutes; // Convert to minutes

  // Parse start time
  const startMinutes = startTime ? parseTimeToMinutes(startTime) : null;
  // Parse end time
  const endMinutes = endTime ? parseTimeToMinutes(endTime) : null;

  // If only start time is set, check if current time is after start
  if (startMinutes !== null && endMinutes === null) {
    return currentTime >= startMinutes;
  }

  // If only end time is set, check if current time is before end
  if (startMinutes === null && endMinutes !== null) {
    return currentTime <= endMinutes;
  }

  // Both times are set - handle normal and overnight ranges
  if (startMinutes !== null && endMinutes !== null) {
    // Handle overnight ranges (e.g., 22:00 - 02:00)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
    // Normal range (e.g., 07:00 - 23:00)
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }

  return true;
};

/**
 * Parse time string "HH:MM" to minutes since midnight
 */
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if current day is in menu's daysOfWeek array
 * daysOfWeek: [1,2,3,4,5,6,7] for Mon-Sun
 */
const isActiveDay = (daysOfWeek: number[] | null): boolean => {
  // If no days specified, menu is available every day
  if (!daysOfWeek || daysOfWeek.length === 0) return true;

  const now = new Date();
  // getDay() returns 0 for Sunday, 1-6 for Mon-Sat
  // Convert to 1-7 format where 1=Mon, 7=Sun
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();

  return daysOfWeek.includes(currentDay);
};

/**
 * Check if current date is within seasonal menu's date range
 */
const isWithinSeasonalWindow = (
  isSeasonal: boolean,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  // If not a seasonal menu, skip date check
  if (!isSeasonal) return true;

  const now = new Date();
  // Reset time portion for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If seasonal but no dates set, menu is not active
  if (!startDate && !endDate) return false;

  // Parse start date (set to beginning of day)
  const start = startDate
    ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    : null;

  // Parse end date (set to end of day)
  const end = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
    : null;

  // Check date range
  if (start && end) {
    return today >= start && today <= end;
  }

  if (start) {
    return today >= start;
  }

  if (end) {
    return today <= end;
  }

  return false;
};

/**
 * Get currently active menus based on time constraints
 * Filters by:
 * - isActive status
 * - Current time between startTime and endTime
 * - Current day in daysOfWeek
 * - Current date between startDate and endDate for seasonal menus
 * Returns menus sorted by sortOrder
 */
export const getCurrentlyActiveMenus = async (restaurantId: string): Promise<Menu[]> => {
  // Get all active menus from repository
  const menus = await repository.findActiveMenus(restaurantId);

  const now = new Date();
  logger.debug('Checking menu time-based visibility', {
    restaurantId,
    currentTime: now.toISOString(),
  });

  // Filter menus based on time constraints
  const activeMenus = menus.filter((menu) => {
    // Check time window
    const timeMatch = isWithinTimeWindow(menu.startTime, menu.endTime);

    // Check day of week
    const dayMatch = isActiveDay(menu.daysOfWeek);

    // Check seasonal date range
    const seasonalMatch = isWithinSeasonalWindow(
      menu.isSeasonal,
      menu.startDate,
      menu.endDate
    );

    const isActive = timeMatch && dayMatch && seasonalMatch;

    if (!isActive) {
      logger.debug('Menu filtered out by time constraints', {
        menuId: menu.id,
        name: menu.name,
        timeMatch,
        dayMatch,
        seasonalMatch,
      });
    }

    return isActive;
  });

  logger.info('Retrieved currently active menus', {
    restaurantId,
    totalMenus: menus.length,
    activeMenus: activeMenus.length,
  });

  // Already sorted by sortOrder from repository
  return activeMenus;
};

export const getPublicMenu = async (restaurantId: string) => {
  // Get all active categories with their items
  const categories = await repository.findCategoriesByRestaurant(restaurantId);

  const categoriesWithItems = await Promise.all(
    categories.map(async (category) => {
      const { items } = await repository.findMenuItemsByRestaurant(restaurantId, {
        page: 1,
        limit: 1000,
        categoryId: category.id,
        isAvailable: true,
      });

      return {
        ...category,
        items: items.map((item) => ({
          ...item,
          price: Number(item.price),
          comparePrice: item.comparePrice ? Number(item.comparePrice) : undefined,
        })),
      };
    })
  );

  // Filter out empty categories
  return categoriesWithItems.filter((cat) => cat.items.length > 0);
};

export const getFeaturedItems = async (restaurantId: string) => {
  const { items } = await repository.findMenuItemsByRestaurant(restaurantId, {
    page: 1,
    limit: 10,
    isAvailable: true,
    isFeatured: true,
  });

  return items.map((item) => ({
    ...item,
    price: Number(item.price),
    comparePrice: item.comparePrice ? Number(item.comparePrice) : undefined,
  }));
};

export const getPopularItems = async (restaurantId: string) => {
  const { items } = await repository.findMenuItemsByRestaurant(restaurantId, {
    page: 1,
    limit: 10,
    isAvailable: true,
  });

  // Filter popular items
  const popularItems = items.filter((item) => item.isPopular);

  return popularItems.map((item) => ({
    ...item,
    price: Number(item.price),
    comparePrice: item.comparePrice ? Number(item.comparePrice) : undefined,
  }));
};
