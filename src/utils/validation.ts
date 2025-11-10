/**
 * Validation Utilities
 */

import {VALIDATION, ERROR_MESSAGES, CHAT_CONFIG} from '../config/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============ EMAIL VALIDATION ============

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return {isValid: false, error: 'Email is required'};
  }

  if (email.length < VALIDATION.EMAIL.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Email must be at least ${VALIDATION.EMAIL.MIN_LENGTH} characters`,
    };
  }

  if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.EMAIL.REGEX.test(email)) {
    return {isValid: false, error: ERROR_MESSAGES.AUTH.INVALID_EMAIL};
  }

  return {isValid: true};
};

// ============ PASSWORD VALIDATION ============

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return {isValid: false, error: 'Password is required'};
  }

  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`,
    };
  }

  if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.PASSWORD.REGEX.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, and number',
    };
  }

  return {isValid: true};
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (password !== confirmPassword) {
    return {isValid: false, error: 'Passwords do not match'};
  }

  return {isValid: true};
};

// ============ DISPLAY NAME VALIDATION ============

export const validateDisplayName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return {isValid: false, error: 'Name is required'};
  }

  if (name.trim().length < VALIDATION.DISPLAY_NAME.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Name must be at least ${VALIDATION.DISPLAY_NAME.MIN_LENGTH} characters`,
    };
  }

  if (name.trim().length > VALIDATION.DISPLAY_NAME.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Name must be less than ${VALIDATION.DISPLAY_NAME.MAX_LENGTH} characters`,
    };
  }

  return {isValid: true};
};

// ============ USERNAME VALIDATION ============

export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim().length === 0) {
    return {isValid: false, error: 'Username is required'};
  }

  if (username.length < VALIDATION.USERNAME.MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${VALIDATION.USERNAME.MIN_LENGTH} characters`,
    };
  }

  if (username.length > VALIDATION.USERNAME.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username must be less than ${VALIDATION.USERNAME.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.USERNAME.REGEX.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return {isValid: true};
};

// ============ CHAT VALIDATION ============

export const validateGroupName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return {isValid: false, error: ERROR_MESSAGES.CHAT.EMPTY_NAME};
  }

  if (name.trim().length > CHAT_CONFIG.MAX_GROUP_NAME_LENGTH) {
    return {isValid: false, error: ERROR_MESSAGES.CHAT.NAME_TOO_LONG};
  }

  return {isValid: true};
};

export const validateGroupMembers = (members: string[]): ValidationResult => {
  if (members.length < CHAT_CONFIG.MIN_GROUP_MEMBERS) {
    return {isValid: false, error: ERROR_MESSAGES.CHAT.MIN_MEMBERS};
  }

  if (members.length > CHAT_CONFIG.MAX_GROUP_MEMBERS) {
    return {isValid: false, error: ERROR_MESSAGES.CHAT.MAX_MEMBERS};
  }

  return {isValid: true};
};

export const validateMessage = (message: string): ValidationResult => {
  if (!message || message.trim().length === 0) {
    return {isValid: false, error: 'Message cannot be empty'};
  }

  if (message.trim().length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message must be less than ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters`,
    };
  }

  return {isValid: true};
};

// ============ GENERAL VALIDATION ============

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// ============ FORM VALIDATION ============

export const validateLoginForm = (
  email: string,
  password: string,
): {isValid: boolean; errors: {email?: string; password?: string}} => {
  const errors: {email?: string; password?: string} = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  if (!password || password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignUpForm = (
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string,
): {
  isValid: boolean;
  errors: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} => {
  const errors: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  const nameValidation = validateDisplayName(displayName);
  if (!nameValidation.isValid) {
    errors.displayName = nameValidation.error;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  const passwordMatchValidation = validatePasswordMatch(
    password,
    confirmPassword,
  );
  if (!passwordMatchValidation.isValid) {
    errors.confirmPassword = passwordMatchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateDisplayName,
  validateUsername,
  validateGroupName,
  validateGroupMembers,
  validateMessage,
  isEmpty,
  isValidUrl,
  isValidPhoneNumber,
  sanitizeInput,
  validateLoginForm,
  validateSignUpForm,
};
