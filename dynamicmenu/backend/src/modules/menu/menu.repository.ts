/**
 * Menu Repository
 * Data access layer for menu, categories, and items
 */

import { prisma } from '@config/database';
import { Menu, Category, MenuItem, Prisma } from '@prisma/client';
import { NotFoundError } from '@utils/errors';
import { logger } from '@utils/logger';
import {
  CreateMenuInput,
  UpdateMenuInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.types';

// ============================================
// MENU OPERATIONS
// ============================================

const menuSelect = {
  id: true,
  name: true,
  description: true,
  type: true,
  isActive: true,
  isSeasonal: true,
  startTime: true,
  endTime: true,
  daysOfWeek: true,
  startDate: true,
  endDate: true,
  sortOrder: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
};

export const findMenuById = async (id: string): Promise<Menu> => {
  const menu = await prisma.menu.findUnique({
    where: { id },
    select: menuSelect,
  });

  if (!menu) {
    throw new NotFoundError('Menu', id);
  }

  return menu;
};

export const findMenusByRestaurant = async (
  restaurantId: string,
  options: { page: number; limit: number; includeInactive?: boolean }
): Promise<{ menus: Menu[]; total: number }> => {
  const { page, limit, includeInactive } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.MenuWhereInput = {
    restaurantId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  const [menus, total] = await Promise.all([
    prisma.menu.findMany({
      where,
      select: menuSelect,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limit,
    }),
    prisma.menu.count({ where }),
  ]);

  return { menus, total };
};

/**
 * Find all active menus for a restaurant (without pagination)
 * Used for time-based filtering
 */
export const findActiveMenus = async (restaurantId: string): Promise<Menu[]> => {
  return prisma.menu.findMany({
    where: {
      restaurantId,
      isActive: true,
    },
    select: menuSelect,
    orderBy: { sortOrder: 'asc' },
  });
};

export const createMenu = async (
  data: CreateMenuInput,
  restaurantId: string
): Promise<Menu> => {
  const menu = await prisma.menu.create({
    data: {
      ...data,
      restaurantId,
    },
    select: menuSelect,
  });

  logger.info('Menu created', { menuId: menu.id, restaurantId });
  return menu;
};

export const updateMenu = async (
  id: string,
  data: UpdateMenuInput
): Promise<Menu> => {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data: data as Prisma.MenuUpdateInput,
      select: menuSelect,
    });

    logger.info('Menu updated', { menuId: id });
    return menu;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Menu', id);
      }
    }
    throw error;
  }
};

export const deleteMenu = async (id: string): Promise<void> => {
  try {
    await prisma.menu.delete({ where: { id } });
    logger.info('Menu deleted', { menuId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Menu', id);
      }
    }
    throw error;
  }
};

// ============================================
// CATEGORY OPERATIONS
// ============================================

const categorySelect = {
  id: true,
  name: true,
  description: true,
  image: true,
  sortOrder: true,
  menuId: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
};

export const findCategoryById = async (id: string): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });

  if (!category) {
    throw new NotFoundError('Category', id);
  }

  return category;
};

export const findCategoriesByRestaurant = async (
  restaurantId: string,
  options?: { menuId?: string }
): Promise<Category[]> => {
  const where: Prisma.CategoryWhereInput = {
    restaurantId,
    ...(options?.menuId ? { menuId: options.menuId } : {}),
  };

  return prisma.category.findMany({
    where,
    select: categorySelect,
    orderBy: { sortOrder: 'asc' },
  });
};

export const createCategory = async (
  data: CreateCategoryInput,
  restaurantId: string
): Promise<Category> => {
  const category = await prisma.category.create({
    data: {
      ...data,
      restaurantId,
    },
    select: categorySelect,
  });

  logger.info('Category created', { categoryId: category.id, restaurantId });
  return category;
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryInput
): Promise<Category> => {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: data as Prisma.CategoryUpdateInput,
      select: categorySelect,
    });

    logger.info('Category updated', { categoryId: id });
    return category;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category', id);
      }
    }
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id } });
    logger.info('Category deleted', { categoryId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Category', id);
      }
    }
    throw error;
  }
};

export const reorderCategories = async (
  restaurantId: string,
  categoryIds: string[]
): Promise<void> => {
  await prisma.$transaction(
    categoryIds.map((id, index) =>
      prisma.category.update({
        where: { id, restaurantId },
        data: { sortOrder: index },
      })
    )
  );

  logger.info('Categories reordered', { restaurantId, count: categoryIds.length });
};

// ============================================
// MENU ITEM OPERATIONS
// ============================================

const menuItemSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  comparePrice: true,
  image: true,
  images: true,
  isAvailable: true,
  isFeatured: true,
  isPopular: true,
  sortOrder: true,
  categoryId: true,
  restaurantId: true,
  translations: true,
  createdAt: true,
  updatedAt: true,
};

export const findMenuItemById = async (
  id: string
): Promise<MenuItem & { tags?: { id: string; name: string; color: string; textColor: string; icon: string | null }[] }> => {
  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: {
      ...menuItemSelect,
      tags: {
        select: {
          id: true,
          name: true,
          color: true,
          textColor: true,
          icon: true,
        },
      },
    },
  });

  if (!item) {
    throw new NotFoundError('Menu item', id);
  }

  return item;
};

export const findMenuItemsByRestaurant = async (
  restaurantId: string,
  options: {
    page: number;
    limit: number;
    categoryId?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    search?: string;
  }
): Promise<{ items: MenuItem[]; total: number }> => {
  const { page, limit, categoryId, isAvailable, isFeatured, search } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.MenuItemWhereInput = {
    restaurantId,
    ...(categoryId && { categoryId }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      select: menuItemSelect,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limit,
    }),
    prisma.menuItem.count({ where }),
  ]);

  return { items, total };
};

export const createMenuItem = async (
  data: CreateMenuItemInput,
  restaurantId: string
): Promise<MenuItem> => {
  const { tagIds, ...itemData } = data;

  const item = await prisma.menuItem.create({
    data: {
      ...itemData,
      restaurantId,
      ...(tagIds && {
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      }),
    },
    select: menuItemSelect,
  });

  logger.info('Menu item created', { itemId: item.id, restaurantId });
  return item;
};

export const updateMenuItem = async (
  id: string,
  data: UpdateMenuItemInput
): Promise<MenuItem> => {
  try {
    const { tagIds, ...itemData } = data;

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...itemData,
        ...(tagIds && {
          tags: {
            set: tagIds.map((tagId) => ({ id: tagId })),
          },
        }),
      },
      select: menuItemSelect,
    });

    logger.info('Menu item updated', { itemId: id });
    return item;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Menu item', id);
      }
    }
    throw error;
  }
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  try {
    await prisma.menuItem.delete({ where: { id } });
    logger.info('Menu item deleted', { itemId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Menu item', id);
      }
    }
    throw error;
  }
};

export const reorderMenuItems = async (
  categoryId: string,
  itemIds: string[]
): Promise<void> => {
  await prisma.$transaction(
    itemIds.map((id, index) =>
      prisma.menuItem.update({
        where: { id, categoryId },
        data: { sortOrder: index },
      })
    )
  );

  logger.info('Menu items reordered', { categoryId, count: itemIds.length });
};

// Toggle item availability
export const toggleItemAvailability = async (
  id: string,
  isAvailable: boolean
): Promise<MenuItem> => {
  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      select: menuItemSelect,
    });

    logger.info('Menu item availability toggled', { itemId: id, isAvailable });
    return item;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Menu item', id);
      }
    }
    throw error;
  }
};
