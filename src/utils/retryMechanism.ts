import toast from 'react-hot-toast';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  showToast?: boolean;
}

export class RetryMechanism {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      onRetry,
      showToast = true,
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          if (showToast) {
            toast.error(`Operation failed after ${maxAttempts} attempts. Please try again later.`);
          }
          throw lastError;
        }

        // Check if we should retry (some errors are not retryable)
        if (!this.isRetryableError(lastError)) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        if (showToast && attempt === 1) {
          toast.loading(`Retrying... (${attempt}/${maxAttempts})`, {
            id: 'retry-toast',
            duration: delay,
          });
        }

        await this.delay(delay);
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }

    throw lastError!;
  }

  private static isRetryableError(error: Error): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = (error as any).code || '';

    // Network errors are retryable
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('connection')) {
      return true;
    }

    // Firebase specific retryable errors
    if (errorCode.includes('unavailable') || 
        errorCode.includes('deadline-exceeded') ||
        errorCode.includes('resource-exhausted')) {
      return true;
    }

    // HTTP status codes that are retryable
    const status = (error as any).status;
    if (status >= 500 || status === 429) {
      return true;
    }

    // Non-retryable errors (authentication, permission, etc.)
    if (errorCode.includes('permission-denied') ||
        errorCode.includes('unauthenticated') ||
        errorCode.includes('not-found') ||
        errorCode.includes('invalid-argument')) {
      return false;
    }

    return true; // Default to retryable for unknown errors
  }

  static createRetryableOperation<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ) {
    return () => this.withRetry(operation, options);
  }
}

// Helper hook for React components
export const useRetry = () => {
  const retry = <T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ) => {
    return RetryMechanism.withRetry(operation, options);
  };

  return { retry };
};

export default RetryMechanism; 