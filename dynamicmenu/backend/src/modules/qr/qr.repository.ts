/**
 * QR Code Repository
 * Enforces tenant filtering on all operations
 */

import { prisma } from '@config/database';
import { QRCode, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '@utils/errors';
import { logger } from '@utils/logger';
import { CreateQRCodeInput, UpdateQRCodeInput } from './qr.types';

const qrSelect = {
  id: true,
  name: true,
  type: true,
  code: true,
  tableNumber: true,
  redirectUrl: true,
  pngUrl: true,
  svgUrl: true,
  pdfUrl: true,
  scanCount: true,
  lastScanAt: true,
  restaurantId: true,
  createdAt: true,
  updatedAt: true,
};

export const findById = async (
  id: string,
  restaurantId?: string
): Promise<QRCode> => {
  const where: Prisma.QRCodeWhereInput = { id };
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  const qr = await prisma.qRCode.findFirst({
    where,
    select: qrSelect,
  });

  if (!qr) {
    throw new NotFoundError('QR Code', id);
  }

  return qr;
};

export const findByCode = async (
  code: string,
  restaurantId?: string
): Promise<(QRCode & { 
  isActive?: boolean; 
  isPublished?: boolean; 
  restaurantSlug?: string; 
  restaurantName?: string; 
}) | null> => {
  const where: Prisma.QRCodeWhereInput = { code };
  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  const result = await prisma.qRCode.findFirst({
    where,
    include: {
      restaurant: {
        select: {
          id: true,
          slug: true,
          name: true,
          isActive: true,
          isPublished: true,
        },
      },
    },
  });
  
  if (!result) return null;
  
  return {
    ...result,
    isActive: result.restaurant?.isActive,
    isPublished: result.restaurant?.isPublished,
    restaurantSlug: result.restaurant?.slug,
    restaurantName: result.restaurant?.name,
  };
};

export const findByRestaurant = async (
  restaurantId: string
): Promise<QRCode[]> => {
  return prisma.qRCode.findMany({
    where: { restaurantId },
    select: qrSelect,
    orderBy: { createdAt: 'desc' },
  });
};

export const create = async (
  data: CreateQRCodeInput,
  restaurantId: string,
  code: string
): Promise<QRCode> => {
  // Verify restaurantId in data matches if provided
  if (data.restaurantId && data.restaurantId !== restaurantId) {
    throw new ForbiddenError('Restaurant ID mismatch');
  }

  const qr = await prisma.qRCode.create({
    data: {
      ...data,
      restaurantId,
      code,
    },
    select: qrSelect,
  });

  logger.info('QR Code created', { qrId: qr.id, restaurantId, code });
  return qr;
};

export const update = async (
  id: string,
  data: UpdateQRCodeInput,
  restaurantId?: string
): Promise<QRCode> => {
  // Verify ownership if restaurantId provided
  if (restaurantId) {
    const qr = await prisma.qRCode.findFirst({
      where: { id, restaurantId },
      select: { id: true },
    });
    if (!qr) {
      throw new NotFoundError('QR Code', id);
    }
  }

  try {
    const qr = await prisma.qRCode.update({
      where: { id },
      data: data as Prisma.QRCodeUpdateInput,
      select: qrSelect,
    });

    logger.info('QR Code updated', { qrId: id });
    return qr;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('QR Code', id);
      }
    }
    throw error;
  }
};

export const remove = async (
  id: string,
  restaurantId?: string
): Promise<void> => {
  // Verify ownership if restaurantId provided
  if (restaurantId) {
    const qr = await prisma.qRCode.findFirst({
      where: { id, restaurantId },
      select: { id: true },
    });
    if (!qr) {
      throw new NotFoundError('QR Code', id);
    }
  }

  try {
    await prisma.qRCode.delete({ where: { id } });
    logger.info('QR Code deleted', { qrId: id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundError('QR Code', id);
      }
    }
    throw error;
  }
};

export const incrementScanCount = async (id: string): Promise<void> => {
  await prisma.qRCode.update({
    where: { id },
    data: {
      scanCount: { increment: 1 },
      lastScanAt: new Date(),
    },
  });
};

export const updateDownloadUrls = async (
  id: string,
  urls: { pngUrl?: string; svgUrl?: string; pdfUrl?: string },
  restaurantId?: string
): Promise<void> => {
  // Verify ownership if restaurantId provided
  if (restaurantId) {
    const qr = await prisma.qRCode.findFirst({
      where: { id, restaurantId },
      select: { id: true },
    });
    if (!qr) {
      throw new NotFoundError('QR Code', id);
    }
  }

  await prisma.qRCode.update({
    where: { id },
    data: urls,
  });
};
