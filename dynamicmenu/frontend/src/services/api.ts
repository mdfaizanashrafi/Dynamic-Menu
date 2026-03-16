/**
 * Base API Client
 * 
 * Centralized API client with axios-like fetch wrapper.
 * Handles request/response interceptors, error handling, and base URL configuration.
 */

import type { ApiResponse, ApiErrorResponse } from '@/types';
import { ApiError } from '@/types';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// ============================================
// Request Types
// ============================================

interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Build URL with query parameters
 */
function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}

/**
 * Parse JSON safely
 */
function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Handle API errors
 */
function handleApiError(response: Response, errorData: ApiErrorResponse | null): never {
  // Handle specific error codes
  if (errorData?.success === false) {
    const { code, message, details, retryAfter } = errorData.error;
    throw new ApiError(code, message, response.status, details, retryAfter);
  }

  // Handle HTTP status codes
  switch (response.status) {
    case 400:
      throw new ApiError('BAD_REQUEST', 'Bad request', 400);
    case 401:
      throw new ApiError('UNAUTHORIZED', 'Unauthorized', 401);
    case 403:
      throw new ApiError('FORBIDDEN', 'Forbidden', 403);
    case 404:
      throw new ApiError('NOT_FOUND', 'Resource not found', 404);
    case 409:
      throw new ApiError('CONFLICT', 'Resource conflict', 409);
    case 429:
      throw new ApiError('RATE_LIMIT_EXCEEDED', 'Too many requests', 429);
    case 500:
      throw new ApiError('INTERNAL_ERROR', 'Internal server error', 500);
    case 503:
      throw new ApiError('SERVICE_UNAVAILABLE', 'Service unavailable', 503);
    default:
      throw new ApiError('UNKNOWN_ERROR', `HTTP error ${response.status}`, response.status);
  }
}

// ============================================
// Core Request Function
// ============================================

async function request<T>(
  method: string,
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, params, headers = {}, ...restConfig } = config;

  // Build full URL
  const fullUrl = buildUrl(`${API_BASE_URL}${url}`, params);

  // Prepare headers
  const authToken = getAuthToken();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
  };

  // Merge headers
  const mergedHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...(headers as Record<string, string>),
  };

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: mergedHeaders,
    ...restConfig,
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  requestOptions.signal = controller.signal;

  try {
    const response = await fetch(fullUrl, requestOptions);
    clearTimeout(timeoutId);

    // Parse response body
    const responseText = await response.text();
    const responseData = safeJsonParse(responseText) as ApiResponse<T> | ApiErrorResponse | null;

    // Handle non-OK responses
    if (!response.ok) {
      handleApiError(response, responseData as ApiErrorResponse | null);
    }

    // Return data if successful
    if (responseData && 'success' in responseData && responseData.success === true) {
      return responseData.data;
    }

    // If response doesn't follow our API format, return the raw data
    return responseData as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('REQUEST_TIMEOUT', 'Request timeout', 408);
    }

    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('NETWORK_ERROR', 'Network error. Please check your connection.', 0);
    }

    // Unknown errors
    throw new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred', 500);
  }
}

// ============================================
// API Client
// ============================================

export const api: ApiClient = {
  /**
   * GET request
   */
  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>('GET', url, config);
  },

  /**
   * POST request
   */
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('POST', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('PUT', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>('PATCH', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>('DELETE', url, config);
  },
};

// ============================================
// Export base URL for external use
// ============================================

export { API_BASE_URL };

// ============================================
// Helper to set auth token
// ============================================

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch {
    // Ignore storage errors (e.g., private browsing mode)
  }
}

// ============================================
// Helper to clear auth token
// ============================================

export function clearAuthToken(): void {
  setAuthToken(null);
}
