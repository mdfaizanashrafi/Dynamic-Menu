/**
 * QR Code Service
 */

import QRCodeLib from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { env } from '@config/env';
import { logger } from '@utils/logger';
import * as repository from './qr.repository';
import * as restaurantRepository from '../restaurant/restaurant.repository';
import {
  CreateQRCodeInput,
  UpdateQRCodeInput,
  RegenerateQRCodeInput,
  QRCodeDownloadUrls,
  QRDesignOptions,
  qrCodeSizes,
  QRCodeSizeType,
} from './qr.types';
import { QRCode as QRCodeType } from '@prisma/client';

// Generate unique QR code
const generateQRCode = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
};

// Build redirect URL
const buildRedirectUrl = (code: string): string => {
  return `${env.FRONTEND_URL}/menu/qr/${code}`;
};

// Default design options
const defaultDesignOptions: QRDesignOptions = {
  color: '#000000',
  frameStyle: 'NONE',
};

// Generate SVG with branding
const generateBrandedSVG = (
  qrSvg: string,
  size: number,
  restaurantName: string,
  logoBase64?: string,
  designOptions: QRDesignOptions = defaultDesignOptions
): string => {
  const qrSize = size * 0.85; // QR takes 85% of canvas
  const padding = (size - qrSize) / 2;
  const logoSize = qrSize * 0.3; // Logo is 30% of QR size
  const watermarkHeight = size * 0.08;
  
  // Parse the QR SVG to extract the path
  const pathMatch = qrSvg.match(/<path[^>]*d="([^"]*)"[^>]*>/);
  const qrPath = pathMatch ? pathMatch[1] : '';
  
  // Calculate viewBox and scale
  const qrModuleSize = qrSize / 25; // Approximate module size for version 2-3 QR
  
  // Generate logo SVG
  let logoSvg = '';
  if (logoBase64) {
    // Use restaurant logo
    logoSvg = `
      <rect x="${(size - logoSize) / 2}" y="${(size - logoSize) / 2}" 
            width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.1}" 
            fill="white" stroke="${designOptions.color}" stroke-width="2"/>
      <image x="${(size - logoSize) / 2 + logoSize * 0.1}" 
             y="${(size - logoSize) / 2 + logoSize * 0.1}" 
             width="${logoSize * 0.8}" height="${logoSize * 0.8}" 
             href="${logoBase64}" preserveAspectRatio="xMidYMid slice"/>
    `;
  } else {
    // Use restaurant initial in colored circle
    const initial = restaurantName.charAt(0).toUpperCase();
    logoSvg = `
      <circle cx="${size / 2}" cy="${size / 2}" r="${logoSize / 2}" 
              fill="${designOptions.color}" opacity="0.9"/>
      <text x="${size / 2}" y="${size / 2}" 
            font-family="Arial, sans-serif" font-size="${logoSize * 0.5}" 
            font-weight="bold" fill="white" text-anchor="middle" 
            dominant-baseline="central">${initial}</text>
    `;
  }
  
  // Frame style
  let frameSvg = '';
  if (designOptions.frameStyle === 'ROUNDED') {
    frameSvg = `<rect x="${padding * 0.5}" y="${padding * 0.5}" 
                      width="${size - padding}" height="${size - padding + watermarkHeight}" 
                      rx="${size * 0.05}" fill="white" stroke="#E5E7EB" stroke-width="2"/>`;
  } else if (designOptions.frameStyle === 'FANCY') {
    frameSvg = `
      <rect x="${padding * 0.3}" y="${padding * 0.3}" 
            width="${size - padding * 0.6}" height="${size - padding * 0.6 + watermarkHeight}" 
            rx="${size * 0.08}" fill="white" stroke="${designOptions.color}" stroke-width="3"/>
      <rect x="${padding * 0.5}" y="${padding * 0.5}" 
            width="${size - padding}" height="${size - padding + watermarkHeight}" 
            rx="${size * 0.05}" fill="white"/>
    `;
  }
  
  // Watermark
  const watermarkSvg = `
    <text x="${size / 2}" y="${size - padding * 0.3}" 
          font-family="Arial, sans-serif" font-size="${size * 0.025}" 
          fill="#9CA3AF" text-anchor="middle">Powered by DynamicMenu</text>
  `;
  
  // Construct final SVG
  const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size + watermarkHeight}" viewBox="0 0 ${size} ${size + watermarkHeight}" 
     xmlns="http://www.w3.org/2000/svg">
  <defs>
    <rect id="clipRect" x="${padding}" y="${padding}" width="${qrSize}" height="${qrSize}" rx="4"/>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size + watermarkHeight}" fill="white"/>
  
  ${frameSvg}
  
  <!-- QR Code with color support -->
  <g transform="translate(${padding}, ${padding}) scale(${qrSize / 200})">
    <path d="${qrPath}" fill="${designOptions.color}"/>
  </g>
  
  <!-- Logo overlay -->
  ${logoSvg}
  
  <!-- Watermark -->
  ${watermarkSvg}
</svg>`;
  
  return finalSvg;
};

// Generate QR code for a specific size
const generateQRForSize = async (
  redirectUrl: string,
  size: number,
  restaurantName: string,
  logoBase64?: string,
  designOptions: QRDesignOptions = defaultDesignOptions
): Promise<{ png: string; svg: string }> => {
  // Generate base QR code with HIGH error correction for logo overlay
  const qrSvg = await QRCodeLib.toString(redirectUrl, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'H',
    width: size,
  });
  
  // Generate branded SVG
  const qrSize = size * 0.85;
  const watermarkHeight = size * 0.08;
  const brandedSvg = generateBrandedSVG(
    qrSvg,
    size,
    restaurantName,
    logoBase64,
    designOptions
  );
  
  // Convert SVG to PNG data URL (in production, use sharp or canvas)
  // For now, we'll use the qrcode library's PNG generation and overlay
  const pngBuffer = await QRCodeLib.toBuffer(redirectUrl, {
    width: Math.floor(qrSize),
    margin: 0,
    errorCorrectionLevel: 'H',
    color: {
      dark: designOptions.color,
      light: '#FFFFFF',
    },
  });
  
  // Create composite PNG with white background, logo, and watermark
  // In production, this would use sharp or canvas for proper compositing
  const pngBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  
  return {
    png: pngBase64,
    svg: `data:image/svg+xml;base64,${Buffer.from(brandedSvg).toString('base64')}`,
  };
};

// Generate all size variants
const generateAllQRVariants = async (
  redirectUrl: string,
  restaurantName: string,
  logoBase64?: string,
  designOptions: QRDesignOptions = defaultDesignOptions
): Promise<QRCodeDownloadUrls> => {
  const sizes: QRCodeSizeType[] = ['SMALL', 'MEDIUM', 'LARGE', 'XL'];
  const urls: Partial<QRCodeDownloadUrls> = {};
  
  for (const size of sizes) {
    const sizeConfig = qrCodeSizes[size];
    const { png, svg } = await generateQRForSize(
      redirectUrl,
      sizeConfig.width,
      restaurantName,
      logoBase64,
      designOptions
    );
    
    urls[size.toLowerCase() as keyof QRCodeDownloadUrls] = {
      png,
      svg,
      ...(size === 'LARGE' || size === 'XL' ? { pdf: undefined } : {}),
    } as QRCodeDownloadUrls[keyof QRCodeDownloadUrls];
  }
  
  return urls as QRCodeDownloadUrls;
};

// Create QR code
export const createQRCode = async (
  data: CreateQRCodeInput,
  restaurantId: string
): Promise<QRCodeType> => {
  const code = generateQRCode();
  const redirectUrl = buildRedirectUrl(code);
  
  // Get restaurant info for branding
  const restaurant = await restaurantRepository.findById(restaurantId);
  
  const qr = await repository.create(data, restaurantId, code);
  
  // Generate QR code images with branding
  try {
    const designOptions: QRDesignOptions = {
      color: data.color || '#000000',
      frameStyle: data.frameStyle || 'NONE',
    };
    
    // In production, fetch and convert logo to base64
    const logoBase64 = restaurant.logo || undefined;
    
    const downloadUrls = await generateAllQRVariants(
      redirectUrl,
      restaurant.name,
      logoBase64,
      designOptions
    );
    
    // Store download URLs
    await repository.updateDownloadUrls(qr.id, {
      pngUrl: downloadUrls.medium.png,
      svgUrl: downloadUrls.medium.svg,
    });
    
    logger.info('QR Code images generated with branding', { qrId: qr.id });
  } catch (error) {
    logger.error('Failed to generate QR images', error as Error);
  }
  
  return repository.findById(qr.id);
};

// Regenerate QR code with new branding
export const regenerateQRCode = async (
  id: string,
  data: RegenerateQRCodeInput
): Promise<QRCodeType> => {
  const qr = await repository.findById(id);
  const restaurant = await restaurantRepository.findById(qr.restaurantId);
  
  // Generate new code
  const newCode = generateQRCode();
  const redirectUrl = buildRedirectUrl(newCode);
  
  const designOptions: QRDesignOptions = {
    color: data.color || '#000000',
    frameStyle: data.frameStyle || 'NONE',
  };
  
  // Generate new QR images
  const logoBase64 = restaurant.logo || undefined;
  const downloadUrls = await generateAllQRVariants(
    redirectUrl,
    restaurant.name,
    logoBase64,
    designOptions
  );
  
  // Update QR code with new code and URLs
  await repository.update(id, {
    code: newCode,
    redirectUrl,
  });
  
  await repository.updateDownloadUrls(id, {
    pngUrl: downloadUrls.medium.png,
    svgUrl: downloadUrls.medium.svg,
  });
  
  logger.info('QR Code regenerated with new branding', { qrId: id });
  return repository.findById(id);
};

// Get QR code by ID
export const getQRCodeById = async (id: string): Promise<QRCodeType> => {
  return repository.findById(id);
};

// List QR codes for restaurant
export const listQRCodes = async (restaurantId: string): Promise<QRCodeType[]> => {
  return repository.findByRestaurant(restaurantId);
};

// Update QR code
export const updateQRCode = async (
  id: string,
  data: UpdateQRCodeInput
): Promise<QRCodeType> => {
  return repository.update(id, data);
};

// Delete QR code
export const deleteQRCode = async (id: string): Promise<void> => {
  return repository.remove(id);
};

// Process QR scan
export const processScan = async (code: string) => {
  const qr = await repository.findByCode(code);

  if (!qr) {
    return null;
  }

  // Increment scan count
  await repository.incrementScanCount(qr.id);

  // Check if restaurant is active
  if (!qr.isActive || !qr.isPublished) {
    return {
      valid: false,
      reason: 'Restaurant not available',
    };
  }

  return {
    valid: true,
    restaurantSlug: qr.restaurantSlug,
    restaurantName: qr.restaurantName,
    qrType: qr.type,
    tableNumber: qr.tableNumber,
  };
};

// Get download URLs for a QR code
export const getQRCodeDownloads = async (
  id: string,
  size?: QRCodeSizeType
): Promise<QRCodeDownloadUrls | { png: string; svg: string }> => {
  const qr = await repository.findById(id);
  const restaurant = await restaurantRepository.findById(qr.restaurantId);
  
  const designOptions: QRDesignOptions = {
    color: '#000000',
    frameStyle: 'NONE',
  };
  
  const logoBase64 = restaurant.logo || undefined;
  
  if (size) {
    const sizeConfig = qrCodeSizes[size];
    return generateQRForSize(
      qr.redirectUrl || buildRedirectUrl(qr.code),
      sizeConfig.width,
      restaurant.name,
      logoBase64,
      designOptions
    );
  }
  
  return generateAllQRVariants(
    qr.redirectUrl || buildRedirectUrl(qr.code),
    restaurant.name,
    logoBase64,
    designOptions
  );
};

// Download QR code as ZIP (all sizes)
export const downloadAllQRCodeSizes = async (
  id: string
): Promise<Buffer> => {
  const downloadUrls = await getQRCodeDownloads(id);
  
  // In production, create a ZIP file with all PNG/SVG sizes
  // For now, return a placeholder
  logger.info('Generating QR code ZIP download', { qrId: id });
  return Buffer.from(JSON.stringify(downloadUrls));
};
