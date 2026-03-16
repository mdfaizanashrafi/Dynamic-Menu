/**
 * Request Validation Middleware
 * 
 * @module middleware/validate
 * @description Zod-based validation for incoming request data (body, params, query).
 * 
 * ## Features
 * - Body validation for POST/PUT/PATCH requests
 * - Route parameter validation
 * - Query string validation with type coercion
 * - Automatic error formatting with field-level details
 * 
 * ## Usage
 * ```typescript
 * import { z } from 'zod';
 * import { validateBody, validateParams } from '@middleware/validate';
 * 
 * const createSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 * 
 * router.post('/users', validateBody(createSchema), handler);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, z } from 'zod';
import { ValidationError } from '@utils/errors';

/**
 * Validates request body against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * @throws {ValidationError} When validation fails
 * 
 * @example
 * const schema = z.object({
 *   name: z.string().min(1),
 *   age: z.number().min(0),
 * });
 * 
 * router.post('/users', validateBody(schema), createUser);
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError('Validation failed', errors);
      }

      // Replace body with parsed and typed data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates route parameters against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * @throws {ValidationError} When validation fails
 * 
 * @example
 * const paramsSchema = z.object({
 *   id: z.string().uuid(),
 * });
 * 
 * router.get('/users/:id', validateParams(paramsSchema), getUser);
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError('Invalid parameters', errors);
      }

      // Replace params with parsed and typed data
      req.params = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates query parameters against a Zod schema
 * 
 * Note: Query values are always strings, use z.coerce for number/boolean conversion.
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 * @throws {ValidationError} When validation fails
 * 
 * @example
 * const querySchema = z.object({
 *   page: z.coerce.number().min(1).default(1),
 *   search: z.string().optional(),
 * });
 * 
 * router.get('/users', validateQuery(querySchema), listUsers);
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError('Invalid query parameters', errors);
      }

      // Replace query with parsed and typed data
      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Formats Zod errors into a simple field-to-message mapping
 * 
 * @param error - ZodError instance
 * @returns Record mapping field paths to error messages
 * 
 * @example
 * // Input: { name: ['', 'too_small'], age: [-1, 'too_small'] }
 * // Output: { name: "String must contain at least 1 character(s)", age: "Number must be greater than 0" }
 */
const formatZodErrors = (error: ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
};

/**
 * Common pagination schema for list endpoints
 * 
 * @example
 * // URL: /api/items?page=2&limit=50
 * router.get('/items', validateQuery(paginationSchema), handler);
 * // Result: req.query = { page: 2, limit: 50 }
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Common ID parameter schema for resource endpoints
 * 
 * @example
 * router.get('/users/:id', validateParams(idParamSchema), handler);
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format' }),
});

/**
 * Common slug parameter schema for public endpoints
 * 
 * @example
 * router.get('/restaurants/:slug', validateParams(slugParamSchema), handler);
 */
export const slugParamSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  }),
});
