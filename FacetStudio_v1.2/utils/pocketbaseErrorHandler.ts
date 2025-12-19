/**
 * PocketBase Error Handling and Retry Utility
 * Provides graceful error handling and automatic retry for failed operations
 */

export class PocketBaseError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
    public isAuthError: boolean = false
  ) {
    super(message);
    this.name = 'PocketBaseError';
  }
}

/**
 * Parse PocketBase error response and create appropriate error
 */
export const parsePocketBaseError = (error: any): PocketBaseError => {
  // Network errors (no response from server)
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new PocketBaseError(
      'Unable to connect to server. Please check your internet connection.',
      undefined,
      true,
      false
    );
  }

  // PocketBase API errors
  if (error.status) {
    const statusCode = error.status;
    const isAuthError = statusCode === 401 || statusCode === 403;

    let message = 'An error occurred while communicating with the server.';

    if (statusCode === 401) {
      message = 'You must be logged in to perform this action.';
    } else if (statusCode === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (statusCode === 404) {
      message = 'The requested resource was not found.';
    } else if (statusCode === 429) {
      message = 'Too many requests. Please slow down and try again.';
    } else if (statusCode >= 500) {
      message = 'Server error. Please try again later.';
    }

    // Try to extract more specific message from response
    if (error.data?.message) {
      message = error.data.message;
    }

    return new PocketBaseError(message, statusCode, false, isAuthError);
  }

  // Unknown error
  return new PocketBaseError(
    error.message || 'An unknown error occurred.',
    undefined,
    false,
    false
  );
};

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Execute a PocketBase operation with automatic retry on failure
 * 
 * @param operation - The async operation to execute
 * @param config - Retry configuration
 * @returns Result of the operation
 * @throws PocketBaseError if all retries fail
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const { maxRetries, delayMs, backoffMultiplier } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: PocketBaseError | null = null;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = parsePocketBaseError(error);

      // Don't retry on auth errors or client errors (4xx)
      if (lastError.isAuthError || (lastError.statusCode && lastError.statusCode < 500)) {
        throw lastError;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Log retry attempt
      console.warn(
        `PocketBase operation failed (attempt ${attempt + 1}/${maxRetries + 1}): ${lastError.message}. Retrying in ${currentDelay}ms...`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  // All retries failed
  throw lastError || new PocketBaseError('Operation failed after multiple retries.');
};

/**
 * Gracefully handle PocketBase errors with user-friendly messages
 * Returns null on error and logs to console
 */
export const gracefulFetch = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const pbError = parsePocketBaseError(error);
    console.error('PocketBase operation failed (graceful):', pbError.message);
    return fallbackValue;
  }
};
