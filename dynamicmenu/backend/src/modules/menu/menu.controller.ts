/**
 * Menu Controller
 * HTTP request handlers for menu endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as service from './menu.service';
import {
  CreateMenuInput,
  UpdateMenuInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from './menu.types';

// ============================================
// MENU CONTROLLERS
// ============================================

export const createMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateMenuInput;
    const { restaurantId } = req.params;

    const menu = await service.createMenu(data, restaurantId);

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const listMenus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeInactive = req.query.includeInactive === 'true';

    const result = await service.listMenus(restaurantId, { page, limit, includeInactive });

    res.json({
      success: true,
      data: result.menus,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const menu = await service.getMenuById(id);

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateMenuInput;

    const menu = await service.updateMenu(id, data);

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteMenu(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ============================================
// CATEGORY CONTROLLERS
// ============================================

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateCategoryInput;
    const { restaurantId } = req.params;

    const category = await service.createCategory(data, restaurantId);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const menuId = req.query.menuId as string | undefined;

    const categories = await service.listCategories(restaurantId, { menuId });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await service.getCategoryById(id);

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateCategoryInput;

    const category = await service.updateCategory(id, data);

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteCategory(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const { categoryIds } = req.body;

    await service.reorderCategories(restaurantId, categoryIds);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// MENU ITEM CONTROLLERS
// ============================================

export const createMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateMenuItemInput;
    const { restaurantId } = req.params;

    const item = await service.createMenuItem(data, restaurantId);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const listMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const categoryId = req.query.categoryId as string | undefined;
    const isAvailable = req.query.isAvailable === 'true' ? true : 
                       req.query.isAvailable === 'false' ? false : undefined;
    const isFeatured = req.query.isFeatured === 'true' ? true : undefined;
    const search = req.query.search as string | undefined;

    const result = await service.listMenuItems(restaurantId, {
      page,
      limit,
      categoryId,
      isAvailable,
      isFeatured,
      search,
    });

    res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await service.getMenuItemById(id);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateMenuItemInput;

    const item = await service.updateMenuItem(id, data);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteMenuItem(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorderMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { itemIds } = req.body;

    await service.reorderMenuItems(categoryId, itemIds);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = await service.toggleAvailability(id, isAvailable);

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
