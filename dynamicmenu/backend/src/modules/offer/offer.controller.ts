/**
 * Offer Controller
 * HTTP request handlers for offer endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as service from './offer.service';
import { CreateOfferInput, UpdateOfferInput } from './offer.types';

// ============================================
// OFFER CONTROLLERS
// ============================================

export const createOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateOfferInput;
    const { restaurantId } = req.params;

    const offer = await service.createOffer(data, restaurantId);

    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const listOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeInactive = req.query.includeInactive === 'true';

    const result = await service.listOffers(restaurantId, { page, limit, includeInactive });

    res.json({
      success: true,
      data: result.offers,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = await service.getOfferById(id);

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateOfferInput;

    const offer = await service.updateOffer(id, data);

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteOffer(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ============================================
// PUBLIC CONTROLLERS (Customer-facing)
// ============================================

export const getActiveOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const offers = await service.getActiveOffersForRestaurant(restaurantId);

    res.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ADMIN CONTROLLERS
// ============================================

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const offer = await service.toggleOfferStatus(id, isActive);

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};
