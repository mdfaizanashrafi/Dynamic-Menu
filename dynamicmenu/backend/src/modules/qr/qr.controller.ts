/**
 * QR Code Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as service from './qr.service';
import {
  CreateQRCodeInput,
  UpdateQRCodeInput,
  RegenerateQRCodeInput,
  DownloadQRCodeInput,
  QRCodeSizeType,
} from './qr.types';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body as CreateQRCodeInput;
    const { restaurantId } = req.params;

    const qr = await service.createQRCode(data, restaurantId);

    res.status(201).json({
      success: true,
      data: qr,
    });
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const qrCodes = await service.listQRCodes(restaurantId);

    res.json({
      success: true,
      data: qrCodes,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const qr = await service.getQRCodeById(id);

    res.json({
      success: true,
      data: qr,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateQRCodeInput;

    const qr = await service.updateQRCode(id, data);

    res.json({
      success: true,
      data: qr,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteQRCode(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Regenerate QR code with new branding
export const regenerate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as RegenerateQRCodeInput;

    const qr = await service.regenerateQRCode(id, data);

    res.json({
      success: true,
      data: qr,
      message: 'QR code regenerated successfully with new branding',
    });
  } catch (error) {
    next(error);
  }
};

// Get download URLs for a QR code
export const getDownloads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { size } = req.query as { size?: QRCodeSizeType };

    const downloads = await service.getQRCodeDownloads(id, size);

    res.json({
      success: true,
      data: downloads,
    });
  } catch (error) {
    next(error);
  }
};

// Download QR code as ZIP (all sizes)
export const downloadZip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const zipBuffer = await service.downloadAllQRCodeSizes(id);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-code-${id}.zip"`
    );
    res.send(zipBuffer);
  } catch (error) {
    next(error);
  }
};

// Public scan endpoint
export const scan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    const result = await service.processScan(code);

    if (!result) {
      res.status(404).json({
        success: false,
        error: {
          code: 'QR_NOT_FOUND',
          message: 'Invalid QR code',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
