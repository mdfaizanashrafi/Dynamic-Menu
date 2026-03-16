/**
 * Offer Repository
 * Data access layer for offers and promotions
 */

import { prisma } from '@config/database';
import { Offer, Prisma } from '@prisma/client';
import { NotFoundError } from '@utils/errors';
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

export const findById = async (id: string): Promise<Offer> => {
  const offer = await prisma.offer.findUnique({
    where: { id },
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
  data: UpdateOfferInput
): Promise<Offer> => {
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

export const remove = async (id: string): Promise<void> => {
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
