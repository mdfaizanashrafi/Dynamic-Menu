/**
 * useRestaurant Hook
 * 
 * Custom hook for fetching and managing restaurant data.
 * Provides loading states, error handling, and refetch functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Restaurant, ApiError } from '@/types';
import { getRestaurant } from '@/services/restaurant.service';

export interface UseRestaurantReturn {
  /** Restaurant data or null if not loaded */
  data: Restaurant | null;
  /** Whether data is being fetched */
  isLoading: boolean;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Function to manually refetch the data */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch restaurant data by slug
 * 
 * @param slug - Restaurant slug (from URL params)
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { data: restaurant, isLoading, error, refetch } = useRestaurant('bella-vista');
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} onRetry={refetch} />;
 * return <RestaurantInfo restaurant={restaurant} />;
 * ```
 */
export function useRestaurant(slug: string | undefined): UseRestaurantReturn {
  const [data, setData] = useState<Restaurant | null>(null);
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
      const restaurant = await getRestaurant(slug);
      setData(restaurant);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to load restaurant',
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
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export default useRestaurant;
