/**
 * Auth Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as service from './auth.service';
import { LoginInput, RegisterInput } from './auth.types';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as RegisterInput;
    const result = await service.register(data);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as LoginInput;
    const result = await service.login(data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await service.getCurrentUser(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
