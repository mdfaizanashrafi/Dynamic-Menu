/**
 * Auth Service
 * Authentication and authorization business logic
 */

import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { prisma } from '@config/database';
import { UnauthorizedError, ConflictError, NotFoundError } from '@utils/errors';
import { logger } from '@utils/logger';
import { hashPassword, verifyPassword } from '@utils/password';
import { sendWelcomeEmail } from '@utils/email';
import { LoginInput, RegisterInput } from './auth.types';
import type { AuthResponse } from '../../types/index';

// Generate JWT token
const generateToken = (payload: {
  userId: string;
  email: string;
  role: string;
}): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as number,
  });
};

// Generate unique slug for restaurant
const generateRestaurantSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${uniqueSuffix}`;
};

// Register new user
export const register = async (
  data: RegisterInput
): Promise<AuthResponse> => {
  // Check if email exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user with default restaurant in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        subscriptionTier: 'FREE', // Default to FREE tier
      },
    });

    // Create default "Free Restaurant" for the user
    const restaurantName = `${data.firstName}'s Restaurant`;
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug: generateRestaurantSlug(restaurantName),
        ownerId: user.id,
        isActive: true,
        isPublished: false,
      },
    });

    // Create a default menu for the restaurant
    await tx.menu.create({
      data: {
        name: 'Main Menu',
        description: 'Your main menu',
        type: 'MAIN',
        restaurantId: restaurant.id,
        isActive: true,
      },
    });

    return { user, restaurant };
  });

  const { user, restaurant } = result;

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info('User registered with default restaurant', { 
    userId: user.id, 
    email: user.email,
    restaurantId: restaurant.id,
    subscriptionTier: user.subscriptionTier,
  });

  // Send welcome email asynchronously (don't block registration)
  const userName = `${data.firstName} ${data.lastName}`;
  sendWelcomeEmail(data.email, userName, restaurant.name).catch((error) => {
    logger.error('Failed to send welcome email', { error, userId: user.id });
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      trialEndsAt: user.trialEndsAt,
    },
    token,
  };
};

// Login user
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Verify password
  const isValid = await verifyPassword(data.password, user.password);

  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info('User logged in', { userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      trialEndsAt: user.trialEndsAt,
    },
    token,
  };
};

// Get current user
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      subscriptionTier: true,
      trialEndsAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User', userId);
  }

  return user;
};

// Check if user can create more restaurants (freemium check)
export const canCreateRestaurant = async (userId: string): Promise<{ allowed: boolean; reason?: string }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { restaurants: true },
      },
    },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  const restaurantCount = user._count.restaurants;

  // FREE tier: 1 restaurant max
  if (user.subscriptionTier === 'FREE' && restaurantCount >= 1) {
    return { 
      allowed: false, 
      reason: 'Free plan allows only 1 restaurant. Upgrade to Pro for unlimited restaurants.' 
    };
  }

  // PRO tier: 5 restaurants max
  if (user.subscriptionTier === 'PRO' && restaurantCount >= 5) {
    return { 
      allowed: false, 
      reason: 'Pro plan allows up to 5 restaurants. Upgrade to Enterprise for unlimited restaurants.' 
    };
  }

  // ENTERPRISE tier: unlimited restaurants
  return { allowed: true };
};
