/**
 * Analytics Routes
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateQuery } from '@middleware/validate';
import { resolveTenant } from '@middleware/tenantResolver';
import { z } from 'zod';
import * as service from './analytics.service';
import { recordViewSchema, analyticsQuerySchema } from './analytics.types';

const router = Router();

// Public endpoint to record views
router.post('/view', validateBody(recordViewSchema), async (req, res, next) => {
  try {
    const data = req.body;
    await service.recordMenuView(data);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(authenticate);

// Get restaurant analytics with tenant resolution
router.get('/restaurant/:restaurantId', resolveTenant('owner'), async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const query = req.query;

    const analytics = await service.getRestaurantAnalytics(restaurantId, {
      days: parseInt(query.days as string) || 30,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard summary with tenant resolution
router.get('/restaurant/:restaurantId/summary', resolveTenant('owner'), async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const summary = await service.getDashboardSummary(restaurantId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
