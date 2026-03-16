/**
 * Restaurant Controller
 * HTTP request handlers for restaurant endpoints
 * Thin layer - delegates to service
 */

import { Request, Response, NextFunction } from 'express';
import * as service from './restaurant.service';
import { CreateRestaurantInput, UpdateRestaurantInput } from './restaurant.types';

// Create restaurant
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateRestaurantInput;
    const ownerId = req.user!.id;

    const restaurant = await service.createRestaurant(data, ownerId);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Get all restaurants for current user
export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ownerId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await service.listRestaurants(ownerId, { page, limit });

    res.json({
      success: true,
      data: result.restaurants,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// Get single restaurant by ID
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurant = await service.getRestaurantById(id);

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Get restaurant by slug
export const getBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const restaurant = await service.getRestaurantBySlug(slug);

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Update restaurant
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateRestaurantInput;

    const restaurant = await service.updateRestaurant(id, data);

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// Delete restaurant
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteRestaurant(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get restaurant statistics
export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await service.getRestaurantStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Generate unique slug
export const generateSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;
    const slug = await service.generateUniqueSlug(name);

    res.json({
      success: true,
      data: { slug },
    });
  } catch (error) {
    next(error);
  }
};
