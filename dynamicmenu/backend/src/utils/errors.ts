/**
 * Centralized Error Handling System
 * 
 * @module utils/errors
 * @description Standardized API error responses with consistent error codes and HTTP status codes.
 * All custom errors extend the base AppError class, ensuring uniform error handling across the application.
 * 
 * @example
 * // Throwing a not found error
 * throw new NotFoundError('User', '123');
 * 
 * @example
 * // Throwing a validation error with details
 * throw new ValidationError('Invalid input', { email: 'Must be a valid email' });
 */

/**
 * Base Application Error Class
 * 
 * All custom application errors should extend this class.
 * Operational errors (expected errors like validation failures) are logged at lower severity.
 * Programming errors (unexpected bugs) are logged as errors.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Determines if this error represents a client error (4xx status code)
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Determines if this error represents a server error (5xx status code)
   */
  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Not Found Error (404)
 * 
 * Used when a requested resource cannot be found.
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`,
      identifier 
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`,
      404
    );
  }
}

/**
 * Validation Error (400)
 * 
 * Used when request data fails validation.
 * Can include detailed field-level validation errors.
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string>;

  constructor(message: string, details?: Record<string, string>) {
    super('VALIDATION_ERROR', message, 400);
    this.details = details;
  }
}

/**
 * Unauthorized Error (401)
 * 
 * Used when authentication is required but not provided or invalid.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

/**
 * Forbidden Error (403)
 * 
 * Used when the authenticated user doesn't have permission to access the resource.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

/**
 * Conflict Error (409)
 * 
 * Used when the request conflicts with the current state of the server
 * (e.g., duplicate unique values).
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

/**
 * Rate Limit Error (429)
 * 
 * Used when the client has sent too many requests in a given amount of time.
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super('RATE_LIMIT_EXCEEDED', message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Database Error (503)
 * 
 * Used when a database operation fails unexpectedly.
 * This is typically a server-side issue.
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super('DATABASE_ERROR', message, 503);
  }
}

/**
 * Service Unavailable Error (503)
 * 
 * Used when the server is temporarily unable to handle the request
 * (e.g., maintenance, upstream service unavailable).
 */
export class ServiceUnavailableError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Service temporarily unavailable', retryAfter?: number) {
    super('SERVICE_UNAVAILABLE', message, 503);
    this.retryAfter = retryAfter;
  }
}

/**
 * Bad Request Error (400)
 * 
 * General purpose error for malformed requests.
 * Use ValidationError for request body validation issues.
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super('BAD_REQUEST', message, 400);
  }
}

/**
 * Standardized Error Response Interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryAfter?: number;
  };
}

/**
 * Formats an error into a standardized API response.
 * 
 * @param error - The error to format
 * @returns Standardized error response object
 * 
 * @security This function never exposes stack traces or internal error details.
 * All internal errors are sanitized to prevent information leakage.
 */
export const formatErrorResponse = (error: AppError | Error): ErrorResponse => {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // Include validation details if available
    if (error instanceof ValidationError && error.details) {
      response.error.details = error.details;
    }

    // Include retry-after header hint if available
    if (error instanceof RateLimitError && error.retryAfter) {
      response.error.retryAfter = error.retryAfter;
    }

    if (error instanceof ServiceUnavailableError && error.retryAfter) {
      response.error.retryAfter = error.retryAfter;
    }

    return response;
  }

  // Unknown error - don't expose details to prevent information leakage
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  };
};

/**
 * Helper function to determine if a status code represents a client error (4xx)
 */
export const isClientError = (statusCode: number): boolean => {
  return statusCode >= 400 && statusCode < 500;
};

/**
 * Helper function to determine if a status code represents a server error (5xx)
 */
export const isServerError = (statusCode: number): boolean => {
  return statusCode >= 500 && statusCode < 600;
};
