/**
 * QR Code Module Types
 */

import { z } from 'zod';
import { QRCodeType } from '@prisma/client';

export const QRCodeSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  XL: 'XL',
} as const;

export type QRCodeSizeType = keyof typeof QRCodeSize;

export const qrCodeSizes = {
  SMALL: { width: 256, qrSize: 200, padding: 28 },
  MEDIUM: { width: 512, qrSize: 400, padding: 56 },
  LARGE: { width: 1024, qrSize: 800, padding: 112 },
  XL: { width: 2048, qrSize: 1600, padding: 224 },
} as const;

export const createQRCodeSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(QRCodeType).default(QRCodeType.TABLE),
  tableNumber: z.number().int().positive().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XL']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  frameStyle: z.enum(['NONE', 'ROUNDED', 'FANCY']).optional(),
  restaurantId: z.string().uuid(),
});

export const updateQRCodeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.nativeEnum(QRCodeType).optional(),
  tableNumber: z.number().int().positive().optional(),
  redirectUrl: z.string().url().optional(),
  code: z.string().optional(),
});

export const regenerateQRCodeSchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  frameStyle: z.enum(['NONE', 'ROUNDED', 'FANCY']).optional(),
});

export const qrCodeParamsSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantParamsSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const downloadQRCodeSchema = z.object({
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'XL']).optional(),
  format: z.enum(['PNG', 'SVG', 'PDF']).optional(),
});

export type CreateQRCodeInput = z.infer<typeof createQRCodeSchema>;
export type UpdateQRCodeInput = z.infer<typeof updateQRCodeSchema>;
export type RegenerateQRCodeInput = z.infer<typeof regenerateQRCodeSchema>;
export type DownloadQRCodeInput = z.infer<typeof downloadQRCodeSchema>;

// QR Code download URLs response
export interface QRCodeDownloadUrls {
  small: {
    png: string;
    svg?: string;
  };
  medium: {
    png: string;
    svg?: string;
  };
  large: {
    png: string;
    svg?: string;
    pdf?: string;
  };
  xl: {
    png: string;
    svg?: string;
    pdf?: string;
  };
}

// QR Code with branding info
export interface QRCodeWithBranding {
  id: string;
  name: string;
  type: QRCodeType;
  code: string;
  tableNumber?: number;
  redirectUrl: string;
  downloadUrls: QRCodeDownloadUrls;
  scanCount: number;
  lastScanAt?: Date;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
  // Branding info
  branding: {
    restaurantName: string;
    logo?: string;
    primaryColor: string;
    qrColor: string;
    frameStyle: 'NONE' | 'ROUNDED' | 'FANCY';
  };
}

// QR Design options
export interface QRDesignOptions {
  color: string;
  frameStyle: 'NONE' | 'ROUNDED' | 'FANCY';
  logoUrl?: string;
}
