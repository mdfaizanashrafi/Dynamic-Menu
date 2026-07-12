import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
    }
    if (!result.success) {
      const issues = result.error instanceof ZodError
        ? result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        : 'Validation failed';
      res.status(400).json({ success: false, error: { message: issues } });
      return;
    }
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const issues = result.error instanceof ZodError
        ? result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        : 'Validation failed';
      res.status(400).json({ success: false, error: { message: issues } });
      return;
    }
    next();
  };
}
