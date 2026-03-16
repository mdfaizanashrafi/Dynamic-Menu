/**
 * useMenu Hook
 * 
 * Custom hooks for fetching and managing menu data.
 * Includes hooks for full menu and time-based current menu.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Category, Menu, Restaurant, ApiError } from '@/types';
import {
  getRestaurantMenu,
  getCurrentMenu,
  getFeaturedItems,
  getPopularItems,
} from '@/services/restaurant.service';

// ============================================
// useMenu Hook - Full Menu
// ============================================

export interface UseMenuReturn {
  /** Restaurant data */
  restaurant: Restaurant | null;
  /** Array of menu categories */
  categories: Category[];
  /** Whether data is being fetched */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch full menu for a restaurant
 * 
 * @param slug - Restaurant slug (from URL params)
 * @returns Object containing restaurant, categories, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { restaurant, categories, isLoading, error, refetch } = useMenu('bella-vista');
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} onRetry={refetch} />;
 * return <Menu restaurant={restaurant} categories={categories} />;
 * ```
 */
export function useMenu(slug: string | undefined): UseMenuReturn {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      setError(new ApiError('INVALID_SLUG', 'Restaurant slug is required', 400));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const menuData = await getRestaurantMenu(slug);
      setRestaurant(menuData.restaurant);
      setCategories(menuData.categories);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to load menu',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    restaurant,
    categories,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// useCurrentMenu Hook - Time-based Menu
// ============================================

export interface UseCurrentMenuReturn {
  /** Restaurant data */
  restaurant: Restaurant | null;
  /** Currently active menus based on time */
  menus: Menu[];
  /** Server timestamp when menu was fetched */
  currentTime: string | null;
  /** Whether data is being fetched */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch currently active menus based on time
 * Returns breakfast, lunch, dinner, etc. based on current time
 * 
 * @param slug - Restaurant slug (from URL params)
 * @returns Object containing restaurant, active menus, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { restaurant, menus, isLoading, error } = useCurrentMenu('bella-vista');
 * 
 * if (isLoading) return <Loading />;
 * if (menus.length > 0) {
 *   return <ActiveMenu menu={menus[0]} />;
 * }
 * return <ClosedMessage />;
 * ```
 */
export function useCurrentMenu(slug: string | undefined): UseCurrentMenuReturn {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      setError(new ApiError('INVALID_SLUG', 'Restaurant slug is required', 400));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentMenuData = await getCurrentMenu(slug);
      setRestaurant(currentMenuData.restaurant);
      setMenus(currentMenuData.menus);
      setCurrentTime(currentMenuData.currentTime);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to load current menu',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    restaurant,
    menus,
    currentTime,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// useFeaturedItems Hook
// ============================================

export interface UseFeaturedItemsReturn {
  /** Array of featured menu items */
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    comparePrice?: number;
    image?: string;
    isAvailable: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    tags: Array<{
      id: string;
      name: string;
      color: string;
      textColor: string;
      icon?: string;
    }>;
  }>;
  /** Whether data is being fetched */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch featured items for a restaurant
 * 
 * @param slug - Restaurant slug
 * @returns Object containing featured items, loading state, error, and refetch function
 */
export function useFeaturedItems(slug: string | undefined): UseFeaturedItemsReturn {
  const [items, setItems] = useState<UseFeaturedItemsReturn['items']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const featuredItems = await getFeaturedItems(slug);
      setItems(featuredItems);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to load featured items',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// usePopularItems Hook
// ============================================

export interface UsePopularItemsReturn {
  /** Array of popular menu items */
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    comparePrice?: number;
    image?: string;
    isAvailable: boolean;
    isFeatured: boolean;
    isPopular: boolean;
    tags: Array<{
      id: string;
      name: string;
      color: string;
      textColor: string;
      icon?: string;
    }>;
  }>;
  /** Whether data is being fetched */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch popular items for a restaurant
 * 
 * @param slug - Restaurant slug
 * @returns Object containing popular items, loading state, error, and refetch function
 */
export function usePopularItems(slug: string | undefined): UsePopularItemsReturn {
  const [items, setItems] = useState<UsePopularItemsReturn['items']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const popularItems = await getPopularItems(slug);
      setItems(popularItems);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to load popular items',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export default useMenu;
