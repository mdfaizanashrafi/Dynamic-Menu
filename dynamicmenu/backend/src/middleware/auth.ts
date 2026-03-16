/**
 * Authentication & Authorization Middleware
 * 
 * @module middleware/auth
 * @description JWT token validation, user authentication, and role-based authorization.
 * 
 * ## Security Features
 * - JWT token verification with secure secret
 * - User existence and active status validation
 * - Role-based access control (RBAC)
 * - Optional authentication for public routes that benefit from user context
 * 
 * ## Usage
 * ```typescript
 * // Require authentication
 * router.get('/protected', authenticate, handler);
 * 
 * // Require specific roles
 * router.delete('/admin', authenticate, authorize('ADMIN'), handler);
 * 
 * // Optional authentication
 * router.get('/public', optionalAuth, handler);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { UnauthorizedError, ForbiddenError } from '@utils/errors';
import { prisma } from '@config/database';
import { UserRole } from '@prisma/client';

/**
 * Extended Express Request type with authenticated user
 * 
 * @interface
 * @extends Express.Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * JWT Payload structure after token verification
 */
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the Authorization header and attaches
 * the user object to the request. Throws UnauthorizedError if:
 * - No token is provided
 * - Token is invalid or expired
 * - User doesn't exist
 * - User account is inactive
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws {UnauthorizedError} When authentication fails
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Attach user to request for use in route handlers
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Role-Based Authorization Middleware Factory
 * 
 * Creates middleware that restricts access to users with specific roles.
 * Must be used AFTER the authenticate middleware.
 * 
 * @param allowedRoles - List of roles that are permitted to access the route
 * @returns Express middleware function
 * @throws {UnauthorizedError} When user is not authenticated
 * @throws {ForbiddenError} When user role is not in allowedRoles
 * 
 * @example
 * // Only admins can access
 * router.delete('/users/:id', authenticate, authorize('ADMIN'), handler);
 * 
 * // Admins and managers can access
 * router.patch('/orders/:id', authenticate, authorize('ADMIN', 'MANAGER'), handler);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * 
 * Similar to authenticate but doesn't fail if no token is provided.
 * Useful for public routes that can be enhanced when a user is logged in.
 * If token is invalid, continues without user context (doesn't throw error).
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @example
 * // Route works for both guests and logged-in users
 * router.get('/menu/:slug', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Show personalized recommendations
 *   } else {
 *     // Show default menu
 *   }
 * });
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (user?.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch {
    // Continue without user on any token error
    // This is intentional - optional auth shouldn't fail on invalid tokens
    next();
  }
};
