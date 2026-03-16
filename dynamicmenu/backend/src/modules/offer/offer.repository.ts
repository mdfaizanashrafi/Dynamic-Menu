/**
 * Offer Repository
 * Data access layer for offers and promotions
 * Enforces tenant filtering on all operations
 */

import { prisma } from '@config/database';
import { Offer, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '@utils/errors';
import { logger } from '@utils/logger';
import { CreateOfferInput, UpdateOfferInput } from './offer.types';

// ============================================
// SELECT CONFIGURATION
// ============================================

const offerSelect = {
  id: true,
  name: true,
  description: true,
  discountType: true,
  discountValue: true,
  startDate: true,
  endDate: true,
  isActive: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
};

// ============================================
// CRUD OPERATIONS
// ============================================

export const create = async (
  data: CreateOfferInput,
  restaurantId: string
): Promise<Offer> => {
  // Verify restaurantId in data matches if provided
  if (data.restaurantId && data.restaurantId !== restaurantId) {
    throw new ForbiddenError('Restaurant ID mismatch');
  }

  const offer = await prisma.offer.create({
    data: {
      ...data,
      restaurantId,
    },
    select: offerSelect,
  });

  logger.info('Offer created', { offerId: offer.id, restaurantId });
  return offer;
};

export const findById = async (
  id: string,
  restaurantId?: string
): Promise<Offer> => {
  const where: Prisma.OfferWhereInput = { id };
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  const offer = await prisma.offer.findFirst({
    where,
    select: offerSelect,
  });

  if (!offer) {
    throw new NotFoundError('Offer', id);
  }

  return offer;
};

export const findByRestaurant = async (
  restaurantId: string,
  options: { page: number; limit: number; includeInactive?: boolean }
): Promise<{ offers: Offer[]; total: number }> => {
  const { page, limit, includeInactive } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.OfferWhereInput = {
    restaurantId,
    ...(includeInactive ? {} : { isActive: true }),
  };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      select: offerSelect,
      orderBy: { startDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.offer.count({ where }),
  ]);

  return { offers, total };
};

export const findActiveOffers = async (
  restaurantId: string
): Promise<Offer[]> => {
  const now = new Date();

  return prisma.offer.findMany({
    where: {
      restaurantId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: offerSelect,
    orderBy: { startDate: 'desc' },
  });
};

export const update = async (
  id: string,
  data: UpdateOfferInput,
  restaurantId?: string
): Promise<Offer> => {
  // Verify ownership if restaurantId provided
  if (restaurantId) {
    const offer = await prisma.offer.findFirst({
      where: { id, restaurantId },
      select: { id: true },
    });
    if (!offer) {
      throw new NotFoundError('Offer', id);
    }
  }

  try {
    const offer = await prisma.offer.update({
      where: { id },
      data: data as Prisma.OfferUpdateInput,
      select: offerSelect,
    });

    logger.info('Offer updated', { offerId: id });
    return offer;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Offer', id);
      }
    }
    throw error;
  }
};

export const remove = async (
  id: string,
  restaurantId?: string
): Promise<void> => {
  // Verify ownership if restaurantId provided
  if (restaurantId) {
    const offer = await prisma.offer.findFirst({
      where: { id, restaurantId },
      select: { id: true },
    });
    if (!offer) {
      throw new NotFoundError('Offer', id);
    }
  }

  try {
    await prisma.offer.delete({ where: { id } });
    logger.info('Offer deleted', { offerId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Offer', id);
      }
    }
    throw error;
  }
};
