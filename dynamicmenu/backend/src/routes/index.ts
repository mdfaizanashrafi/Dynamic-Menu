/**
 * API Routes Index
 * 
 * @module routes/index
 * @description Central route registration for the DynamicMenu API.
 * 
 * ## Route Ordering
 * Routes are registered in the following order:
 * 1. Health check (public, no auth)
 * 2. Public routes (customer-facing, no auth)
 * 3. Authentication routes (public auth endpoints)
 * 4. Protected routes (require authentication)
 * 
 * ## Security
 * - Public routes are grouped and placed before protected routes
 * - All protected routes should use the `authenticate` middleware
 * - Route order matters - more specific routes should come before generic ones
 */

import { Router } from 'express';
import { requestLoggingMiddleware } from '@utils/tenantLogger';
import authRoutes from '@modules/auth/auth.routes';
import restaurantRoutes from '@modules/restaurant/restaurant.routes';
import menuRoutes from '@modules/menu/menu.routes';
import qrRoutes from '@modules/qr/qr.routes';
import analyticsRoutes from '@modules/analytics/analytics.routes';
import offerRoutes from '@modules/offer/offer.routes';
import publicRoutes from '@modules/public/public.routes';

const router = Router();

// Global middleware registration
router.use(requestLoggingMiddleware);

/**
 * Health Check Endpoint
 * 
 * Used by load balancers and monitoring systems to verify API availability.
 * Returns basic service status information.
 * 
 * @route GET /api/health
 * @public
 */
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * Public API Routes (No Authentication Required)
 * 
 * These routes are customer-facing and designed for public access.
 * They provide restaurant information, menus, and QR code processing.
 * 
 * @route /api/public/*
 * @public
 */
router.use('/public', publicRoutes);

/**
 * Authentication Routes
 * 
 * Public endpoints for user authentication including login, registration,
 * password reset, and token refresh.
 * 
 * @route /api/auth/*
 * @public
 */
router.use('/auth', authRoutes);

/**
 * Protected API Routes
 * 
 * All routes below this point require authentication.
 * The authentication middleware should be applied in each route file.
 * 
 * Route order:
 * 1. Restaurant management
 * 2. Menu management
 * 3. QR code management
 * 4. Analytics
 */

/**
 * Restaurant Management Routes
 * 
 * CRUD operations for restaurant profiles, settings, and configuration.
 * Requires authentication.
 * 
 * @route /api/restaurants/*
 * @protected
 */
router.use('/restaurants', restaurantRoutes);

/**
 * Menu Management Routes
 * 
 * CRUD operations for menu categories, items, and modifiers.
 * Requires authentication.
 * 
 * @route /api/menu/*
 * @protected
 */
router.use('/menu', menuRoutes);

/**
 * QR Code Management Routes
 * 
 * Generation and management of QR codes for table ordering.
 * Requires authentication.
 * 
 * @route /api/qr/*
 * @protected
 */
router.use('/qr', qrRoutes);

/**
 * Analytics Routes
 * 
 * Restaurant analytics, reporting, and statistics.
 * Requires authentication.
 * 
 * @route /api/analytics/*
 * @protected
 */
router.use('/analytics', analyticsRoutes);

/**
 * Offer/Deal Management Routes
 * 
 * Promotional offers, discounts, and special deals.
 * Requires authentication. Some operations require admin/manager role.
 * 
 * @route /api/offers/*
 * @protected
 */
router.use('/offers', offerRoutes);

export default router;
