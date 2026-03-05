/**
 * Error Helper
 * Centralized error handling utilities
 */

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Parse error from various sources (Axios, Fetch, etc.)
 */
export function parseApiError(error: unknown): ApiError {
  // Default error
  const defaultError: ApiError = {
    message: 'An unexpected error occurred',
    statusCode: 500,
  };

  if (!error) return defaultError;

  // Axios error
  if (typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        data?: { message?: string; error?: string };
        status?: number;
      };
    };

    const responseData = axiosError.response?.data;
    return {
      message: responseData?.message || responseData?.error || defaultError.message,
      statusCode: axiosError.response?.status || 500,
      error: responseData?.error,
    };
  }

  // Fetch error
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return defaultError;
}

/**
 * Get user-friendly error message based on status code
 */
export function getUserFriendlyErrorMessage(statusCode: number, defaultMessage?: string): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return defaultMessage || 'An error occurred. Please try again.';
  }
}

/**
 * Log error for debugging
 */
export function logError(context: string, error: unknown): void {
  const parsedError = parseApiError(error);
  console.error(`[${context}] Error:`, {
    message: parsedError.message,
    statusCode: parsedError.statusCode,
    error: parsedError.error,
    raw: error,
  });
}

