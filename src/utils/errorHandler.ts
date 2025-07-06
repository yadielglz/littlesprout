import toast from 'react-hot-toast';

export interface AppError {
  message: string;
  code?: string;
  originalError?: Error;
  context?: string;
}

export class ErrorHandler {
  private static logError(error: AppError) {
    console.error('Application Error:', {
      message: error.message,
      code: error.code,
      context: error.context,
      originalError: error.originalError,
      timestamp: new Date().toISOString(),
    });
  }

  static handle(error: AppError) {
    this.logError(error);
    
    // Show user-friendly message
    const userMessage = this.getUserMessage(error);
    toast.error(userMessage);
    
    return error;
  }

  private static getUserMessage(error: AppError): string {
    // Firebase specific errors
    if (error.code?.includes('auth/')) {
      return this.getAuthErrorMessage(error.code);
    }
    
    if (error.code?.includes('firestore/')) {
      return this.getFirestoreErrorMessage(error.code);
    }
    
    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Default user message
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  private static getAuthErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Authentication error. Please try again.';
    }
  }

  private static getFirestoreErrorMessage(code: string): string {
    switch (code) {
      case 'firestore/permission-denied':
        return 'You don\'t have permission to access this data.';
      case 'firestore/not-found':
        return 'The requested data was not found.';
      case 'firestore/unavailable':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'firestore/deadline-exceeded':
        return 'Request timed out. Please try again.';
      default:
        return 'Database error. Please try again.';
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T,
    enableRetry: boolean = false
  ): Promise<T | undefined> {
    try {
      if (enableRetry) {
        const { RetryMechanism } = await import('./retryMechanism');
        return await RetryMechanism.withRetry(operation, {
          onRetry: (attempt, error) => {
            console.warn(`Retrying ${context} (attempt ${attempt}):`, error);
          }
        });
      } else {
        return await operation();
      }
    } catch (error) {
      this.handle({
        message: (error as Error).message,
        code: (error as any).code,
        originalError: error as Error,
        context,
      });
      
      return fallbackValue;
    }
  }

  static withSyncErrorHandling<T>(
    operation: () => T,
    context: string,
    fallbackValue?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handle({
        message: (error as Error).message,
        code: (error as any).code,
        originalError: error as Error,
        context,
      });
      
      return fallbackValue;
    }
  }
}

// Convenience functions
export const handleError = (error: AppError) => ErrorHandler.handle(error);
export const withErrorHandling = ErrorHandler.withErrorHandling;
export const withSyncErrorHandling = ErrorHandler.withSyncErrorHandling; 