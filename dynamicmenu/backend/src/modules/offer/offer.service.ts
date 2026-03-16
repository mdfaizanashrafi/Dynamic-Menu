/**
 * Offer Service
 * Business logic layer for offer operations
 */

import { Offer } from '@prisma/client';
import { ValidationError } from '@utils/errors';
import { logger } from '@utils/logger';
import * as repository from './offer.repository';
import { CreateOfferInput, UpdateOfferInput, ListOffersOptions } from './offer.types';

// ============================================
// VALIDATION HELPERS
// ============================================

const validateOfferDates = (startDate: Date, endDate: Date): void => {
  if (endDate <= startDate) {
    throw new ValidationError('End date must be after start date');
  }
};

// ============================================
// CRUD SERVICES
// ============================================

export const createOffer = async (
  data: CreateOfferInput,
  restaurantId: string
): Promise<Offer> => {
  validateOfferDates(data.startDate, data.endDate);

  const offer = await repository.create(data, restaurantId);
  logger.info('Offer service: created', { offerId: offer.id });

  return offer;
};

export const getOfferById = async (id: string): Promise<Offer> => {
  return repository.findById(id);
};

export const listOffers = async (
  restaurantId: string,
  options: ListOffersOptions
) => {
  const { offers, total } = await repository.findByRestaurant(restaurantId, options);

  return {
    offers: offers.map(formatOfferResponse),
    meta: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
};

export const updateOffer = async (
  id: string,
  data: UpdateOfferInput
): Promise<Offer> => {
  if (data.startDate && data.endDate) {
    validateOfferDates(data.startDate, data.endDate);
  }

  const offer = await repository.update(id, data);
  logger.info('Offer service: updated', { offerId: id });

  return offer;
};

export const deleteOffer = async (id: string): Promise<void> => {
  await repository.remove(id);
  logger.info('Offer service: deleted', { offerId: id });
};

// ============================================
// BUSINESS LOGIC SERVICES
// ============================================

export const getActiveOffersForRestaurant = async (
  restaurantId: string
): Promise<Offer[]> => {
  const offers = await repository.findActiveOffers(restaurantId);
  return offers.map(formatOfferResponse);
};

export const toggleOfferStatus = async (
  id: string,
  isActive: boolean
): Promise<Offer> => {
  const offer = await repository.update(id, { isActive });
  logger.info('Offer service: status toggled', { offerId: id, isActive });

  return offer;
};

// ============================================
// RESPONSE FORMATTERS
// ============================================

const formatOfferResponse = (offer: Offer): Offer => {
  return {
    ...offer,
    discountValue: offer.discountValue,
  };
};
