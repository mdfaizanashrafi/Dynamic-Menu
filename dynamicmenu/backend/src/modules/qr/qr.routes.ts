/**
 * QR Code Routes
 */

import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validateBody, validateParams } from '@middleware/validate';
import * as controller from './qr.controller';
import {
  createQRCodeSchema,
  updateQRCodeSchema,
  regenerateQRCodeSchema,
  qrCodeParamsSchema,
  restaurantParamsSchema,
} from './qr.types';

const router = Router();

// Public scan route (no auth required)
router.get('/scan/:code', controller.scan);

// Protected routes
router.use(authenticate);

// List QR codes for restaurant
router.get(
  '/restaurant/:restaurantId',
  validateParams(restaurantParamsSchema),
  controller.list
);

// Create QR code
router.post(
  '/restaurant/:restaurantId',
  validateParams(restaurantParamsSchema),
  validateBody(createQRCodeSchema),
  controller.create
);

// Get, update, delete QR code
router.get(
  '/:id',
  validateParams(qrCodeParamsSchema),
  controller.getById
);

router.patch(
  '/:id',
  validateParams(qrCodeParamsSchema),
  validateBody(updateQRCodeSchema),
  controller.update
);

router.delete(
  '/:id',
  validateParams(qrCodeParamsSchema),
  controller.remove
);

// Regenerate QR code with new branding
router.post(
  '/:id/regenerate',
  validateParams(qrCodeParamsSchema),
  validateBody(regenerateQRCodeSchema),
  controller.regenerate
);

// Get download URLs for a QR code
router.get(
  '/:id/downloads',
  validateParams(qrCodeParamsSchema),
  controller.getDownloads
);

// Download all sizes as ZIP
router.get(
  '/:id/download-zip',
  validateParams(qrCodeParamsSchema),
  controller.downloadZip
);

export default router;
