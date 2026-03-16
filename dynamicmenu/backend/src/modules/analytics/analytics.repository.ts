/**
 * Analytics Repository
 * Data access layer for analytics operations
 * Enforces tenant filtering on all queries
 */

import { prisma } from '@config/database';
import { MenuAnalytics, MenuItemAnalytics, Prisma } from '@prisma/client';
import { NotFoundError } from '@utils/errors';
import { logger } from '@utils/logger';

// ============================================
// MENU ANALYTICS OPERATIONS
// ============================================

export const findByRestaurant = async (
  restaurantId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    days?: number;
  }
): Promise<{ dailyStats: MenuAnalytics[]; itemStats: MenuItemAnalytics[] }> => {
  const endDate = options.endDate || new Date();
  const startDate = options.startDate || new Date();
  
  if (!options.startDate && options.days) {
    startDate.setDate(endDate.getDate() - options.days);
  }

  const [dailyStats, itemStats] = await Promise.all([
    prisma.menuAnalytics.findMany({
      where: {
        restaurantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.menuItemAnalytics.findMany({
      where: {
        menuItem: { restaurantId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        menuItem: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { views: 'desc' },
      take: 10,
    }),
  ]);

  return { dailyStats, itemStats };
};

export const recordView = async (
  data: {
    restaurantId: string;
    itemId?: string;
  }
): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert menu analytics record
  await prisma.menuAnalytics.upsert({
    where: {
      restaurantId_date: {
        restaurantId: data.restaurantId,
        date: today,
      },
    },
    update: {
      totalViews: { increment: 1 },
    },
    create: {
      restaurantId: data.restaurantId,
      date: today,
      totalViews: 1,
      uniqueVisitors: 1,
    },
  });

  // Record item view if provided
  if (data.itemId) {
    // Verify item belongs to restaurant
    const item = await prisma.menuItem.findFirst({
      where: { id: data.itemId, restaurantId: data.restaurantId },
      select: { id: true },
    });

    if (item) {
      await prisma.menuItemAnalytics.upsert({
        where: {
          menuItemId_date: {
            menuItemId: data.itemId,
            date: today,
          },
        },
        update: {
          views: { increment: 1 },
        },
        create: {
          menuItemId: data.itemId,
          date: today,
          views: 1,
          clicks: 0,
        },
      });
    }
  }

  logger.debug('Menu view recorded', { restaurantId: data.restaurantId });
};

export const getSummary = async (
  restaurantId: string
): Promise<{
  today: { views: number; uniqueVisitors: number };
  yesterday: { views: number; uniqueVisitors: number };
  last7Days: number;
  topItems: Array<{
    id: string;
    name: string;
    image: string | null;
    price: number;
    views: number;
  }>;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Today's stats
  const todayStats = await prisma.menuAnalytics.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date: today,
      },
    },
  });

  // Yesterday's stats
  const yesterdayStats = await prisma.menuAnalytics.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date: yesterday,
      },
    },
  });

  // Last 7 days
  const last7Days = await prisma.menuAnalytics.findMany({
    where: {
      restaurantId,
      date: {
        gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: 'desc' },
  });

  // Top items
  const topItems = await prisma.menuItemAnalytics.findMany({
    where: {
      menuItem: { restaurantId },
      date: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    include: {
      menuItem: {
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
        },
      },
    },
    orderBy: { views: 'desc' },
    take: 5,
  });

  return {
    today: {
      views: todayStats?.totalViews || 0,
      uniqueVisitors: todayStats?.uniqueVisitors || 0,
    },
    yesterday: {
      views: yesterdayStats?.totalViews || 0,
      uniqueVisitors: yesterdayStats?.uniqueVisitors || 0,
    },
    last7Days: last7Days.reduce((sum, day) => sum + day.totalViews, 0),
    topItems: topItems.map((item) => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      image: item.menuItem.image,
      price: Number(item.menuItem.price),
      views: item.views,
    })),
  };
};

export const recordClick = async (
  itemId: string,
  restaurantId: string
): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verify item belongs to restaurant
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId },
    select: { id: true },
  });

  if (!item) {
    throw new NotFoundError('Menu item', itemId);
  }

  await prisma.menuItemAnalytics.upsert({
    where: {
      menuItemId_date: {
        menuItemId: itemId,
        date: today,
      },
    },
    update: {
      clicks: { increment: 1 },
    },
    create: {
      menuItemId: itemId,
      date: today,
      views: 0,
      clicks: 1,
    },
  });

  logger.debug('Item click recorded', { itemId, restaurantId });
};
