/**
 * Analytics Service
 */

import { prisma } from '@config/database';
import { logger } from '@utils/logger';
import { RecordViewInput, AnalyticsQueryInput } from './analytics.types';

// Record menu view
export const recordMenuView = async (data: RecordViewInput): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert analytics record
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
    await recordItemView(data.itemId);
  }

  logger.debug('Menu view recorded', { restaurantId: data.restaurantId });
};

// Record item view
export const recordItemView = async (itemId: string): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.menuItemAnalytics.upsert({
    where: {
      menuItemId_date: {
        menuItemId: itemId,
        date: today,
      },
    },
    update: {
      views: { increment: 1 },
    },
    create: {
      menuItemId: itemId,
      date: today,
      views: 1,
    },
  });
};

// Get restaurant analytics
export const getRestaurantAnalytics = async (
  restaurantId: string,
  query: AnalyticsQueryInput
) => {
  const endDate = query.endDate || new Date();
  const startDate = query.startDate || new Date();
  
  if (!query.startDate && query.days) {
    startDate.setDate(endDate.getDate() - query.days);
  }

  // Get daily analytics
  const dailyStats = await prisma.menuAnalytics.findMany({
    where: {
      restaurantId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  // Get item analytics
  const itemStats = await prisma.menuItemAnalytics.findMany({
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
  });

  // Calculate totals
  const totals = dailyStats.reduce(
    (acc, day) => ({
      totalViews: acc.totalViews + day.totalViews,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
    }),
    { totalViews: 0, uniqueVisitors: 0 }
  );

  return {
    summary: {
      ...totals,
      avgDailyViews: Math.round(totals.totalViews / (dailyStats.length || 1)),
    },
    dailyStats,
    popularItems: itemStats.map((item) => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      image: item.menuItem.image,
      views: item.views,
      clicks: item.clicks,
    })),
  };
};

// Get dashboard summary
export const getDashboardSummary = async (restaurantId: string) => {
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
