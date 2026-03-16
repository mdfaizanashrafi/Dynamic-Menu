/**
 * QR Code Service
 * 
 * API functions for QR code-related operations.
 * Handles QR code scanning, generation, and processing.
 */

import { api } from './api';
import type { 
  QRScanResult, 
  QRCode, 
  QRCodeDownloadUrls,
  CreateQRCodeInput,
  RegenerateQRCodeInput,
} from '@/types';
import { QRCodeSize } from '@/types';

// ============================================
// Public QR API
// ============================================

/**
 * Process a QR code scan (public endpoint)
 * Validates the QR code and returns restaurant information
 * 
 * @param code - QR code string
 * @returns QR scan result with restaurant info if valid
 */
export async function processQRScan(code: string): Promise<QRScanResult> {
  return api.get<QRScanResult>(`/public/qr/${code}`);
}

// ============================================
// Authenticated QR API (for dashboard)
// ============================================

/**
 * Get all QR codes for a restaurant
 * @param restaurantId - Restaurant ID
 * @returns Array of QR codes
 */
export async function getQRCodes(restaurantId: string): Promise<QRCode[]> {
  return api.get<QRCode[]>(`/restaurants/${restaurantId}/qr-codes`);
}

/**
 * Get a single QR code by ID
 * @param qrCodeId - QR Code ID
 * @returns QR code data
 */
export async function getQRCode(qrCodeId: string): Promise<QRCode> {
  return api.get<QRCode>(`/qr-codes/${qrCodeId}`);
}

/**
 * Create a new QR code with branding options
 * @param restaurantId - Restaurant ID
 * @param data - QR code data with optional size, color, and frame style
 * @returns Created QR code with generated code string and branding
 */
export async function createQRCode(
  restaurantId: string,
  data: CreateQRCodeInput
): Promise<QRCode> {
  return api.post<QRCode>(`/restaurants/${restaurantId}/qr-codes`, data);
}

/**
 * Update a QR code
 * @param qrCodeId - QR Code ID
 * @param data - Partial QR code data
 * @returns Updated QR code
 */
export async function updateQRCode(
  qrCodeId: string,
  data: Partial<Pick<QRCode, 'name' | 'type' | 'tableNumber'>>
): Promise<QRCode> {
  return api.patch<QRCode>(`/qr-codes/${qrCodeId}`, data);
}

/**
 * Delete a QR code
 * @param qrCodeId - QR Code ID
 */
export async function deleteQRCode(qrCodeId: string): Promise<void> {
  return api.delete<void>(`/qr-codes/${qrCodeId}`);
}

/**
 * Regenerate QR code with new branding options
 * Generates new code string and updated branding
 * 
 * @param qrCodeId - QR Code ID
 * @param data - Optional branding options (color, frameStyle)
 * @returns Updated QR code with new code string and branding
 */
export async function regenerateQRCode(
  qrCodeId: string,
  data: RegenerateQRCodeInput = {}
): Promise<QRCode> {
  return api.post<QRCode>(`/qr-codes/${qrCodeId}/regenerate`, data);
}

/**
 * Get QR code download URLs for all sizes
 * Generates fresh download URLs for PNG, SVG formats in all sizes
 * 
 * @param qrCodeId - QR Code ID
 * @returns Object with download URLs for all sizes
 */
export async function getQRCodeDownloads(qrCodeId: string): Promise<QRCodeDownloadUrls> {
  return api.get<QRCodeDownloadUrls>(`/qr-codes/${qrCodeId}/downloads`);
}

/**
 * Get QR code download for specific size
 * 
 * @param qrCodeId - QR Code ID
 * @param size - Size variant (SMALL, MEDIUM, LARGE, XL)
 * @returns Object with download URLs for the specified size
 */
export async function getQRCodeDownloadBySize(
  qrCodeId: string,
  size: QRCodeSize
): Promise<{ png: string; svg: string }> {
  return api.get<{ png: string; svg: string }>(
    `/qr-codes/${qrCodeId}/downloads?size=${size}`
  );
}

/**
 * Download all QR code sizes as a ZIP file
 * 
 * @param qrCodeId - QR Code ID
 * @returns ZIP file blob containing all size variants
 */
export async function downloadQRCodeZip(qrCodeId: string): Promise<Blob> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || ''}/api/qr-codes/${qrCodeId}/download-zip`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to download QR code ZIP');
  }
  
  return response.blob();
}

/**
 * Track QR code scan (analytics)
 * Call this when a QR code is scanned to update analytics
 * 
 * @param code - QR code string
 */
export async function trackQRScan(code: string): Promise<void> {
  return api.post<void>(`/qr-codes/track`, { code });
}

// ============================================
// Download Helpers
// ============================================

/**
 * Download a QR code image to the user's device
 * @param dataUrl - Data URL of the image
 * @param filename - Filename for the download
 */
export function downloadQRImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get QR code size dimensions
 * @param size - QR code size variant
 * @returns Dimensions for the specified size
 */
export function getQRCodeDimensions(size: QRCodeSize): {
  width: number;
  qrSize: number;
  padding: number;
  label: string;
  description: string;
} {
  const dimensions = {
    [QRCodeSize.SMALL]: {
      width: 256,
      qrSize: 200,
      padding: 28,
      label: 'Small',
      description: '256px - Perfect for digital use',
    },
    [QRCodeSize.MEDIUM]: {
      width: 512,
      qrSize: 400,
      padding: 56,
      label: 'Medium',
      description: '512px - Great for small prints',
    },
    [QRCodeSize.LARGE]: {
      width: 1024,
      qrSize: 800,
      padding: 112,
      label: 'Large',
      description: '1024px - Ideal for posters',
    },
    [QRCodeSize.XL]: {
      width: 2048,
      qrSize: 1600,
      padding: 224,
      label: 'XL',
      description: '2048px - For large format printing',
    },
  };
  
  return dimensions[size];
}

/**
 * Get all available QR code sizes
 * @returns Array of size options with labels and descriptions
 */
export function getAllQRCodeSizes(): Array<{
  value: QRCodeSize;
  label: string;
  description: string;
  width: number;
}> {
  return [
    { value: QRCodeSize.SMALL, label: 'Small', description: '256px - Digital use', width: 256 },
    { value: QRCodeSize.MEDIUM, label: 'Medium', description: '512px - Small prints', width: 512 },
    { value: QRCodeSize.LARGE, label: 'Large', description: '1024px - Posters', width: 1024 },
    { value: QRCodeSize.XL, label: 'XL', description: '2048px - Large format', width: 2048 },
  ];
}
