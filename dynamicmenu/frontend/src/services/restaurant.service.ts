/**
 * Restaurant Service
 * 
 * API functions for restaurant-related operations.
 * Handles fetching restaurant data, menus, and items.
 */

import { api } from './api';
import type {
  Restaurant,
  MenuData,
  CurrentMenuData,
  PublicMenuItem,
  Category,
} from '@/types';

// ============================================
// Restaurant API
// ============================================

/**
 * Get restaurant by slug (public endpoint)
 * @param slug - Restaurant slug
 * @returns Restaurant data
 */
export async function getRestaurant(slug: string): Promise<Restaurant> {
  return api.get<Restaurant>(`/public/restaurant/${slug}`);
}

/**
 * Get full menu for a restaurant (public endpoint)
 * @param slug - Restaurant slug
 * @returns Menu data including restaurant and categories
 */
export async function getRestaurantMenu(slug: string): Promise<MenuData> {
  return api.get<MenuData>(`/public/menu/${slug}`);
}

/**
 * Get currently active menus based on time (breakfast, lunch, dinner, etc.)
 * @param slug - Restaurant slug
 * @returns Current menu data with active menus
 */
export async function getCurrentMenu(slug: string): Promise<CurrentMenuData> {
  return api.get<CurrentMenuData>(`/public/menu/${slug}/current`);
}

/**
 * Get featured items for a restaurant
 * @param slug - Restaurant slug
 * @returns Array of featured menu items
 */
export async function getFeaturedItems(slug: string): Promise<PublicMenuItem[]> {
  return api.get<PublicMenuItem[]>(`/public/menu/${slug}/featured`);
}

/**
 * Get popular items for a restaurant
 * @param slug - Restaurant slug
 * @returns Array of popular menu items
 */
export async function getPopularItems(slug: string): Promise<PublicMenuItem[]> {
  return api.get<PublicMenuItem[]>(`/public/menu/${slug}/popular`);
}

// ============================================
// Authenticated Restaurant API (for dashboard)
// ============================================

/**
 * Get all restaurants for the current user
 * @returns Array of restaurants
 */
export async function getRestaurants(): Promise<Restaurant[]> {
  return api.get<Restaurant[]>('/restaurants');
}

/**
 * Get restaurant by ID (requires authentication)
 * @param id - Restaurant ID
 * @returns Restaurant data
 */
export async function getRestaurantById(id: string): Promise<Restaurant> {
  return api.get<Restaurant>(`/restaurants/${id}`);
}

/**
 * Create a new restaurant
 * @param data - Restaurant data
 * @returns Created restaurant
 */
export async function createRestaurant(
  data: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Restaurant> {
  return api.post<Restaurant>('/restaurants', data);
}

/**
 * Update a restaurant
 * @param id - Restaurant ID
 * @param data - Partial restaurant data
 * @returns Updated restaurant
 */
export async function updateRestaurant(
  id: string,
  data: Partial<Restaurant>
): Promise<Restaurant> {
  return api.patch<Restaurant>(`/restaurants/${id}`, data);
}

/**
 * Delete a restaurant
 * @param id - Restaurant ID
 */
export async function deleteRestaurant(id: string): Promise<void> {
  return api.delete<void>(`/restaurants/${id}`);
}

// ============================================
// Category API
// ============================================

/**
 * Get categories for a restaurant
 * @param restaurantId - Restaurant ID
 * @returns Array of categories with items
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  return api.get<Category[]>(`/restaurants/${restaurantId}/categories`);
}

/**
 * Create a new category
 * @param restaurantId - Restaurant ID
 * @param data - Category data
 * @returns Created category
 */
export async function createCategory(
  restaurantId: string,
  data: Omit<Category, 'id' | 'items' | 'createdAt' | 'updatedAt'>
): Promise<Category> {
  return api.post<Category>(`/restaurants/${restaurantId}/categories`, data);
}

/**
 * Update a category
 * @param categoryId - Category ID
 * @param data - Partial category data
 * @returns Updated category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<Category>
): Promise<Category> {
  return api.patch<Category>(`/categories/${categoryId}`, data);
}

/**
 * Delete a category
 * @param categoryId - Category ID
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  return api.delete<void>(`/categories/${categoryId}`);
}

/**
 * Reorder categories
 * @param restaurantId - Restaurant ID
 * @param categoryIds - Ordered array of category IDs
 */
export async function reorderCategories(
  restaurantId: string,
  categoryIds: string[]
): Promise<void> {
  return api.post<void>(`/restaurants/${restaurantId}/categories/reorder`, {
    categoryIds,
  });
}
