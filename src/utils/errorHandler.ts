/**
 * Centralized Error Handling Utilities
 */

import {Alert} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {FIREBASE_ERROR_CODES, ERROR_MESSAGES} from '../config/constants';

export interface AppError {
  code: string;
  message: string;
  originalError?: any;
}

/**
 * Parse Firebase error to user-friendly message
 */
export const parseFirebaseError = (error: any): string => {
  if (!error) return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

  // Check if it's a Firebase error with a code
  if (
    error.code &&
    FIREBASE_ERROR_CODES[error.code as keyof typeof FIREBASE_ERROR_CODES]
  ) {
    return FIREBASE_ERROR_CODES[
      error.code as keyof typeof FIREBASE_ERROR_CODES
    ];
  }

  // Check if there's a custom message
  if (error.message) {
    return error.message;
  }

  // Default error
  return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
};

/**
 * Show error toast message
 */
export const showErrorToast = (
  error: any,
  fallbackMessage: string = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
) => {
  const message = parseFirebaseError(error) || fallbackMessage;

  showMessage({
    message: 'Error',
    description: message,
    type: 'danger',
    icon: 'danger',
    duration: 4000,
  });
};

/**
 * Show success toast message
 */
export const showSuccessToast = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'success',
    icon: 'success',
    duration: 3000,
  });
};

/**
 * Show info toast message
 */
export const showInfoToast = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'info',
    icon: 'info',
    duration: 3000,
  });
};

/**
 * Show warning toast message
 */
export const showWarningToast = (message: string, description?: string) => {
  showMessage({
    message,
    description,
    type: 'warning',
    icon: 'warning',
    duration: 3000,
  });
};

/**
 * Show error alert dialog
 */
export const showErrorAlert = (
  error: any,
  title: string = 'Error',
  onPress?: () => void,
) => {
  const message = parseFirebaseError(error);

  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress,
    },
  ]);
};

/**
 * Show confirmation alert
 */
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel',
) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: 'destructive',
      onPress: onConfirm,
    },
  ]);
};

/**
 * Log error to console (in development) and optionally to analytics service
 */
export const logError = (
  error: any,
  context: string = 'Unknown Context',
  additionalData?: any,
) => {
  if (__DEV__) {
    console.error(`[${context}]`, error, additionalData);
  }

  // TODO: Add analytics/crash reporting service here
  // Example: Crashlytics.recordError(error);
};

/**
 * Handle async operation with error handling
 */
export const handleAsync = async <T>(
  operation: () => Promise<T>,
  errorContext: string = 'Operation',
  showToastOnError: boolean = true,
): Promise<{data: T | null; error: any}> => {
  try {
    const data = await operation();
    return {data, error: null};
  } catch (error) {
    logError(error, errorContext);

    if (showToastOnError) {
      showErrorToast(error);
    }

    return {data: null, error};
  }
};

/**
 * Retry async operation with exponential backoff
 */
export const retryAsync = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logError(error, `Retry attempt ${i + 1}/${maxRetries}`);

      if (i < maxRetries - 1) {
        // Wait with exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, delayMs * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const networkCodes = [
    'auth/network-request-failed',
    'unavailable',
    'network-error',
  ];

  return (
    networkCodes.includes(error.code) ||
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('connection')
  );
};

/**
 * Check if error is a permission error
 */
export const isPermissionError = (error: any): boolean => {
  return (
    error?.code === 'permission-denied' ||
    error?.message?.toLowerCase().includes('permission')
  );
};

/**
 * Create custom error
 */
export const createError = (
  code: string,
  message: string,
  originalError?: any,
): AppError => {
  return {
    code,
    message,
    originalError,
  };
};

export default {
  parseFirebaseError,
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  showErrorAlert,
  showConfirmAlert,
  logError,
  handleAsync,
  retryAsync,
  isNetworkError,
  isPermissionError,
  createError,
};
