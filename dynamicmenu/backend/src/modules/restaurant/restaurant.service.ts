/**
 * Restaurant Service
 * Business logic layer for restaurant operations
 * Handles validation, transformations, and orchestration
 */

import { Restaurant } from '@prisma/client';
import { ConflictError } from '@utils/errors';
import { logger } from '@utils/logger';
import * as repository from './restaurant.repository';
import { CreateRestaurantInput, UpdateRestaurantInput } from './restaurant.types';
import { generateSlug } from '@utils/slug';

// Create restaurant with validation
export const createRestaurant = async (
  data: CreateRestaurantInput,
  ownerId: string
): Promise<Restaurant> => {
  // Normalize slug
  const slug = data.slug.toLowerCase().trim();

  // Check slug uniqueness
  const exists = await repository.slugExists(slug);
  if (exists) {
    throw new ConflictError(`Restaurant with slug '${slug}' already exists`);
  }

  // Create restaurant
  const restaurant = await repository.create(
    { ...data, slug },
    ownerId
  );

  logger.info('Restaurant service: created', { 
    restaurantId: restaurant.id,
    slug,
  });

  return restaurant;
};

// Get restaurant by ID
export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  return repository.findById(id);
};

// Get restaurant by slug
export const getRestaurantBySlug = async (slug: string): Promise<Restaurant> => {
  return repository.findBySlug(slug);
};

// Get public restaurant (published only)
export const getPublicRestaurant = async (slug: string): Promise<Restaurant> => {
  return repository.findPublishedBySlug(slug);
};

// List restaurants for owner
export const listRestaurants = async (
  ownerId: string,
  options: { page: number; limit: number }
) => {
  const { restaurants, total } = await repository.findByOwner(ownerId, options);

  const totalPages = Math.ceil(total / options.limit);

  return {
    restaurants,
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
    },
  };
};

// Update restaurant with validation
export const updateRestaurant = async (
  id: string,
  data: UpdateRestaurantInput
): Promise<Restaurant> => {
  // Check if slug is being updated and is unique
  if (data.slug) {
    const slug = data.slug.toLowerCase().trim();
    const existing = await repository.findBySlug(slug).catch(() => null);
    
    if (existing && existing.id !== id) {
      throw new ConflictError(`Restaurant with slug '${slug}' already exists`);
    }
    
    data.slug = slug;
  }

  const restaurant = await repository.update(id, data);

  logger.info('Restaurant service: updated', { 
    restaurantId: id,
  });

  return restaurant;
};

// Delete restaurant
export const deleteRestaurant = async (id: string): Promise<void> => {
  await repository.remove(id);

  logger.info('Restaurant service: deleted', { 
    restaurantId: id,
  });
};

// Get restaurant statistics
export const getRestaurantStats = async (id: string) => {
  return repository.getStatistics(id);
};

// Generate unique slug from name
export const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (await repository.slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
