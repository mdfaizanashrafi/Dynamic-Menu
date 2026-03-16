/**
 * QR Code Routes
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateParams } from '@middleware/validate';
import { resolveTenant } from '@middleware/tenantResolver';
import { idempotencyMiddleware } from '@middleware/idempotencyMiddleware';
import * as controller from './qr.controller';
import {
  createQRCodeSchema,
  updateQRCodeSchema,
  regenerateQRCodeSchema,
  qrCodeParamsSchema,
  restaurantParamsSchema,
} from './qr.types';

const router = Router();

// Public scan route (no auth required) with tenant resolution
router.get('/scan/:code', resolveTenant('qr'), controller.scan);

// Protected routes
router.use(authenticate);

// List QR codes for restaurant
router.get(
  '/restaurant/:restaurantId',
  resolveTenant('owner'),
  validateParams(restaurantParamsSchema),
  controller.list
);

// Create QR code
router.post(
  '/restaurant/:restaurantId',
  resolveTenant('owner'),
  idempotencyMiddleware,
  validateParams(restaurantParamsSchema),
  validateBody(createQRCodeSchema),
  controller.create
);

// Get, update, delete QR code
router.get(
  '/:id',
  resolveTenant('owner'),
  validateParams(qrCodeParamsSchema),
  controller.getById
);

router.patch(
  '/:id',
  resolveTenant('owner'),
  idempotencyMiddleware,
  validateParams(qrCodeParamsSchema),
  validateBody(updateQRCodeSchema),
  controller.update
);

router.delete(
  '/:id',
  resolveTenant('owner'),
  validateParams(qrCodeParamsSchema),
  controller.remove
);

// Regenerate QR code with new branding
router.post(
  '/:id/regenerate',
  resolveTenant('owner'),
  idempotencyMiddleware,
  validateParams(qrCodeParamsSchema),
  validateBody(regenerateQRCodeSchema),
  controller.regenerate
);

// Get download URLs for a QR code
router.get(
  '/:id/downloads',
  resolveTenant('owner'),
  validateParams(qrCodeParamsSchema),
  controller.getDownloads
);

// Download all sizes as ZIP
router.get(
  '/:id/download-zip',
  resolveTenant('owner'),
  validateParams(qrCodeParamsSchema),
  controller.downloadZip
);

export default router;
