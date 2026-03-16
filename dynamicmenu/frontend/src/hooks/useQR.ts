/**
 * useQR Hook
 * 
 * Custom hooks for QR code operations.
 * Provides loading states, error handling, and scan result data.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  QRScanResult,
  QRCode,
  QRCodeDownloadUrls,
  QRDesignOptions,
  CreateQRCodeInput,
  RegenerateQRCodeInput,
  ApiError,
} from '@/types';
import { QRCodeType, QRCodeSize } from '@/types';
import {
  processQRScan,
  getQRCodes,
  getQRCode,
  createQRCode as createQRCodeApi,
  updateQRCode as updateQRCodeApi,
  deleteQRCode as deleteQRCodeApi,
  regenerateQRCode as regenerateQRCodeApi,
  getQRCodeDownloads,
} from '@/services/qr.service';

// ============================================
// useQRCode Hook - For scanning QR codes
// ============================================

export interface UseQRCodeReturn {
  /** QR scan result data */
  data: QRScanResult | null;
  /** Whether the QR code is being processed */
  isLoading: boolean;
  /** Error object if the scan failed */
  error: ApiError | null;
  /** Function to manually reprocess the QR code */
  refetch: () => Promise<void>;
  /** Whether the QR code is valid and the restaurant is available */
  isValid: boolean;
  /** Restaurant slug from the scan result (if valid) */
  restaurantSlug: string | null;
  /** Restaurant name from the scan result (if valid) */
  restaurantName: string | null;
  /** QR code type (TABLE, RESTAURANT, etc.) */
  qrType: QRCodeType | null;
  /** Table number (if applicable) */
  tableNumber: number | null;
}

/**
 * Hook to process a QR code scan
 * 
 * @param code - QR code string (from URL params or scanner)
 * @returns Object containing scan result, loading state, error, and derived values
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error, isValid, restaurantSlug } = useQRCode('abc123');
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * if (!isValid) return <InvalidQRMessage />;
 * 
 * // Navigate to restaurant menu
 * navigate(`/menu/${restaurantSlug}`);
 * ```
 */
export function useQRCode(code: string | undefined): UseQRCodeReturn {
  const [data, setData] = useState<QRScanResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const processScan = useCallback(async () => {
    if (!code) {
      setIsLoading(false);
      setError(new ApiError('INVALID_CODE', 'QR code is required', 400));
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await processQRScan(code);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'UNKNOWN_ERROR',
            err instanceof Error ? err.message : 'Failed to process QR code',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    processScan();
  }, [processScan]);

  // Derived values for convenience
  const isValid = data?.valid ?? false;
  const restaurantSlug = data?.restaurantSlug ?? null;
  const restaurantName = data?.restaurantName ?? null;
  const qrType = data?.qrType ?? null;
  const tableNumber = data?.tableNumber ?? null;

  return {
    data,
    isLoading,
    error,
    refetch: processScan,
    isValid,
    restaurantSlug,
    restaurantName,
    qrType,
    tableNumber,
  };
}

// ============================================
// useQRRedirect Hook
// ============================================

export interface UseQRRedirectReturn {
  /** Whether the redirect URL is being resolved */
  isLoading: boolean;
  /** Error object if the resolution failed */
  error: ApiError | null;
  /** The target URL to redirect to */
  targetUrl: string | null;
  /** Whether the QR code is valid */
  isValid: boolean;
}

/**
 * Hook to resolve a QR code and get the redirect URL
 * Useful for redirecting immediately after scanning
 * 
 * @param code - QR code string
 * @returns Object containing the target URL and status
 * 
 * @example
 * ```tsx
 * const { targetUrl, isLoading, isValid } = useQRRedirect('abc123');
 * 
 * useEffect(() => {
 *   if (!isLoading && isValid && targetUrl) {
 *     window.location.href = targetUrl;
 *   }
 * }, [isLoading, isValid, targetUrl]);
 * ```
 */
export function useQRRedirect(code: string | undefined): UseQRRedirectReturn {
  const { data, isLoading, error, isValid } = useQRCode(code);

  // Build the target URL based on scan result
  const targetUrl = (() => {
    if (!isValid || !data?.restaurantSlug) {
      return null;
    }

    // Build URL with table number if present
    const params = new URLSearchParams();
    if (data.tableNumber) {
      params.set('table', String(data.tableNumber));
    }
    if (data.qrType) {
      params.set('type', data.qrType);
    }

    const queryString = params.toString();
    return `/menu/${data.restaurantSlug}${queryString ? `?${queryString}` : ''}`;
  })();

  return {
    isLoading,
    error,
    targetUrl,
    isValid,
  };
}

// ============================================
// useQRCodes Hook - For managing QR codes in dashboard
// ============================================

export interface UseQRCodesReturn {
  /** List of QR codes */
  qrCodes: QRCode[];
  /** Whether QR codes are loading */
  isLoading: boolean;
  /** Error object if loading failed */
  error: ApiError | null;
  /** Refresh QR codes list */
  refetch: () => Promise<void>;
  /** Create a new QR code */
  createQRCode: (data: CreateQRCodeInput) => Promise<QRCode>;
  /** Update a QR code */
  updateQRCode: (id: string, data: Partial<Pick<QRCode, 'name' | 'type' | 'tableNumber'>>) => Promise<QRCode>;
  /** Delete a QR code */
  deleteQRCode: (id: string) => Promise<void>;
  /** Regenerate a QR code with new branding */
  regenerateQRCode: (id: string, options?: RegenerateQRCodeInput) => Promise<QRCode>;
  /** Whether an operation is in progress */
  isOperationLoading: boolean;
}

/**
 * Hook to manage QR codes for a restaurant
 * 
 * @param restaurantId - Restaurant ID
 * @returns Object containing QR codes list and CRUD operations
 * 
 * @example
 * ```tsx
 * const { 
 *   qrCodes, 
 *   isLoading, 
 *   createQRCode, 
 *   deleteQRCode,
 *   regenerateQRCode 
 * } = useQRCodes('restaurant-id');
 * 
 * // Create new QR code with branding
 * await createQRCode({
 *   name: 'Table 1',
 *   type: QRCodeType.TABLE,
 *   tableNumber: 1,
 *   color: '#000000',
 *   frameStyle: 'ROUNDED'
 * });
 * 
 * // Regenerate with new branding
 * await regenerateQRCode('qr-id', { color: '#FF6B35', frameStyle: 'FANCY' });
 * ```
 */
export function useQRCodes(restaurantId: string | undefined): UseQRCodesReturn {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOperationLoading, setIsOperationLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchQRCodes = useCallback(async () => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const codes = await getQRCodes(restaurantId);
      setQrCodes(codes);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'FETCH_ERROR',
            err instanceof Error ? err.message : 'Failed to fetch QR codes',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const createQRCode = useCallback(
    async (data: CreateQRCodeInput): Promise<QRCode> => {
      if (!restaurantId) {
        throw new ApiError('NO_RESTAURANT', 'No restaurant selected', 400);
      }

      setIsOperationLoading(true);

      try {
        const newQR = await createQRCodeApi(restaurantId, data);
        setQrCodes((prev) => [newQR, ...prev]);
        return newQR;
      } finally {
        setIsOperationLoading(false);
      }
    },
    [restaurantId]
  );

  const updateQRCode = useCallback(
    async (
      id: string,
      data: Partial<Pick<QRCode, 'name' | 'type' | 'tableNumber'>>
    ): Promise<QRCode> => {
      setIsOperationLoading(true);

      try {
        const updated = await updateQRCodeApi(id, data);
        setQrCodes((prev) =>
          prev.map((qr) => (qr.id === id ? updated : qr))
        );
        return updated;
      } finally {
        setIsOperationLoading(false);
      }
    },
    []
  );

  const deleteQRCode = useCallback(async (id: string): Promise<void> => {
    setIsOperationLoading(true);

    try {
      await deleteQRCodeApi(id);
      setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
    } finally {
      setIsOperationLoading(false);
    }
  }, []);

  const regenerateQRCode = useCallback(
    async (id: string, options: RegenerateQRCodeInput = {}): Promise<QRCode> => {
      setIsOperationLoading(true);

      try {
        const updated = await regenerateQRCodeApi(id, options);
        setQrCodes((prev) =>
          prev.map((qr) => (qr.id === id ? updated : qr))
        );
        return updated;
      } finally {
        setIsOperationLoading(false);
      }
    },
    []
  );

  return {
    qrCodes,
    isLoading,
    error,
    refetch: fetchQRCodes,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    regenerateQRCode,
    isOperationLoading,
  };
}

// ============================================
// useQRCodeDetail Hook - For single QR code operations
// ============================================

export interface UseQRCodeDetailReturn {
  /** QR code data */
  qrCode: QRCode | null;
  /** Download URLs for all sizes */
  downloadUrls: QRCodeDownloadUrls | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error object if loading failed */
  error: ApiError | null;
  /** Refresh QR code data */
  refetch: () => Promise<void>;
  /** Download specific size */
  downloadSize: (size: QRCodeSize) => Promise<{ png: string; svg: string } | null>;
  /** Whether download is in progress */
  isDownloading: boolean;
}

/**
 * Hook to get detailed information about a single QR code
 * 
 * @param qrCodeId - QR Code ID
 * @returns Object containing QR code details and download operations
 * 
 * @example
 * ```tsx
 * const { 
 *   qrCode, 
 *   downloadUrls, 
 *   isLoading,
 *   downloadSize 
 * } = useQRCodeDetail('qr-id');
 * 
 * // Download specific size
 * const { png, svg } = await downloadSize(QRCodeSize.LARGE);
 * ```
 */
export function useQRCodeDetail(
  qrCodeId: string | undefined
): UseQRCodeDetailReturn {
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<QRCodeDownloadUrls | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchQRCode = useCallback(async () => {
    if (!qrCodeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [code, urls] = await Promise.all([
        getQRCode(qrCodeId),
        getQRCodeDownloads(qrCodeId),
      ]);
      setQrCode(code);
      setDownloadUrls(urls);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            'FETCH_ERROR',
            err instanceof Error ? err.message : 'Failed to fetch QR code',
            500
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [qrCodeId]);

  useEffect(() => {
    fetchQRCode();
  }, [fetchQRCode]);

  const downloadSize = useCallback(
    async (size: QRCodeSize): Promise<{ png: string; svg: string } | null> => {
      if (!qrCodeId) return null;

      setIsDownloading(true);

      try {
        const { getQRCodeDownloadBySize } = await import('@/services/qr.service');
        const urls = await getQRCodeDownloadBySize(qrCodeId, size);
        return urls;
      } catch (err) {
        console.error('Failed to download QR code size:', err);
        return null;
      } finally {
        setIsDownloading(false);
      }
    },
    [qrCodeId]
  );

  return {
    qrCode,
    downloadUrls,
    isLoading,
    error,
    refetch: fetchQRCode,
    downloadSize,
    isDownloading,
  };
}

// ============================================
// useQRGenerator Hook - For QR code generation with preview
// ============================================

export interface UseQRGeneratorReturn {
  /** Preview URL for the QR code */
  previewUrl: string | null;
  /** Whether preview is generating */
  isGenerating: boolean;
  /** Current design options */
  designOptions: QRDesignOptions;
  /** Update design options */
  setDesignOptions: (options: QRDesignOptions) => void;
  /** Generate preview */
  generatePreview: (text: string) => Promise<void>;
  /** Reset to defaults */
  resetOptions: () => void;
}

const defaultDesignOptions: QRDesignOptions = {
  color: '#000000',
  frameStyle: 'NONE',
};

/**
 * Hook for QR code generation with real-time preview
 * 
 * @returns Object containing preview state and design controls
 * 
 * @example
 * ```tsx
 * const { 
 *   previewUrl, 
 *   isGenerating,
 *   designOptions,
 *   setDesignOptions,
 *   generatePreview 
 * } = useQRGenerator();
 * 
 * // Update color
 * setDesignOptions({ ...designOptions, color: '#FF6B35' });
 * 
 * // Generate preview
 * await generatePreview('https://example.com');
 * ```
 */
export function useQRGenerator(): UseQRGeneratorReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [designOptions, setDesignOptions] = useState<QRDesignOptions>(
    defaultDesignOptions
  );

  const generatePreview = useCallback(
    async (text: string): Promise<void> => {
      setIsGenerating(true);

      try {
        // In a real implementation, this would call an API
        // For now, we'll use the QRCode library directly
        const QRCode = await import('qrcode');
        const url = await QRCode.toDataURL(text, {
          width: 300,
          margin: 2,
          color: {
            dark: designOptions.color,
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setPreviewUrl(url);
      } catch (err) {
        console.error('Failed to generate QR preview:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [designOptions]
  );

  const resetOptions = useCallback(() => {
    setDesignOptions(defaultDesignOptions);
  }, []);

  return {
    previewUrl,
    isGenerating,
    designOptions,
    setDesignOptions,
    generatePreview,
    resetOptions,
  };
}

export default useQRCode;
