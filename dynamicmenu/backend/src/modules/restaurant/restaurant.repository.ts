/**
 * Restaurant Repository
 * Data access layer for restaurant operations
 * Follows Single Responsibility Principle
 */

import { prisma } from '@config/database';
import { Restaurant, Prisma } from '@prisma/client';
import { NotFoundError } from '@utils/errors';
import { logger } from '@utils/logger';
import { CreateRestaurantInput, UpdateRestaurantInput } from './restaurant.types';

// Default selection for restaurant queries
const defaultSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  logo: true,
  address: true,
  phone: true,
  email: true,
  website: true,
  primaryColor: true,
  secondaryColor: true,
  fontFamily: true,
  isActive: true,
  isPublished: true,
  defaultLanguage: true,
  supportedLanguages: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
};

// Find restaurant by ID
export const findById = async (id: string): Promise<Restaurant> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: defaultSelect,
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant', id);
  }

  return restaurant;
};

// Find restaurant by slug
export const findBySlug = async (slug: string): Promise<Restaurant> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: defaultSelect,
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant', slug);
  }

  return restaurant;
};

// Find restaurant by slug (public - only published)
export const findPublishedBySlug = async (slug: string): Promise<Restaurant> => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { 
      slug,
      isActive: true,
      isPublished: true,
    },
    select: defaultSelect,
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant', slug);
  }

  return restaurant;
};

// Find all restaurants by owner
export const findByOwner = async (
  ownerId: string,
  options: { page: number; limit: number }
): Promise<{ restaurants: Restaurant[]; total: number }> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where: { ownerId },
      select: {
        ...defaultSelect,
        _count: {
          select: {
            menus: true,
            menuItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.restaurant.count({ where: { ownerId } }),
  ]);

  return { restaurants, total };
};

// Check if slug exists
export const slugExists = async (slug: string): Promise<boolean> => {
  const count = await prisma.restaurant.count({
    where: { slug },
  });
  return count > 0;
};

// Create new restaurant
export const create = async (
  data: CreateRestaurantInput,
  ownerId: string
): Promise<Restaurant> => {
  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      ownerId,
    } as unknown as Prisma.RestaurantCreateInput,
    select: defaultSelect,
  });

  logger.info('Restaurant created', { 
    restaurantId: restaurant.id, 
    ownerId,
    name: restaurant.name,
  });

  return restaurant;
};

// Update restaurant
export const update = async (
  id: string,
  data: UpdateRestaurantInput
): Promise<Restaurant> => {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: data as Prisma.RestaurantUpdateInput,
      select: defaultSelect,
    });

    logger.info('Restaurant updated', { 
      restaurantId: id,
      name: restaurant.name,
    });

    return restaurant;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Restaurant', id);
      }
    }
    throw error;
  }
};

// Delete restaurant
export const remove = async (id: string): Promise<void> => {
  try {
    await prisma.restaurant.delete({
      where: { id },
    });

    logger.info('Restaurant deleted', { restaurantId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Restaurant', id);
      }
    }
    throw error;
  }
};

// Get restaurant statistics
export const getStatistics = async (id: string) => {
  const stats = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          menus: true,
          categories: true,
          menuItems: true,
          qrCodes: true,
        },
      },
    },
  });

  if (!stats) {
    throw new NotFoundError('Restaurant', id);
  }

  return {
    menuCount: stats._count.menus,
    categoryCount: stats._count.categories,
    itemCount: stats._count.menuItems,
    qrCodeCount: stats._count.qrCodes,
  };
};
