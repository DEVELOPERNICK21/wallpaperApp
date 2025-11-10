/**
 * Centralized Application Constants
 * All magic strings and configuration values should be defined here
 */

// ============ APP CONFIGURATION ============

export const APP_CONFIG = {
  NAME: 'Wallpaper',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
} as const;

// ============ FIREBASE COLLECTIONS ============

export const FIREBASE_COLLECTIONS = {
  USERS: 'Users',
  GROUP_CHATS: 'GroupChats',
  MESSAGES: 'Messages',
  NOTIFICATIONS: 'Notifications',
} as const;

// ============ ASYNC STORAGE KEYS ============

export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  FCM_TOKEN: 'fcmToken',
} as const;

// ============ API CONFIGURATION ============

export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.yourapp.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// ============ FIREBASE CONFIGURATION ============

export const FIREBASE_CONFIG = {
  MESSAGE_FETCH_LIMIT: 50,
  TYPING_TIMEOUT: 3000, // 3 seconds
  NEW_MESSAGE_WINDOW: 30000, // 30 seconds
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const,
} as const;

// ============ CHAT CONFIGURATION ============

export const CHAT_CONFIG = {
  MIN_GROUP_MEMBERS: 2,
  MAX_GROUP_MEMBERS: 50,
  MAX_GROUP_NAME_LENGTH: 50,
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_DEBOUNCE: 500, // milliseconds
} as const;

// ============ UI CONFIGURATION ============

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  SPLASH_DURATION: 1000,
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 500,
  THROTTLE_DELAY: 1000,
} as const;

// ============ VALIDATION RULES ============

export const VALIDATION = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    REGEX: /^[a-zA-Z0-9_]+$/,
  },
  DISPLAY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const;

// ============ ERROR MESSAGES ============

export const ERROR_MESSAGES = {
  // Auth Errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'Email already in use',
    WEAK_PASSWORD: 'Password is too weak',
    INVALID_EMAIL: 'Invalid email address',
    NETWORK_ERROR: 'Network error. Please check your connection',
    TOO_MANY_REQUESTS: 'Too many attempts. Please try again later',
    SESSION_EXPIRED: 'Your session has expired. Please login again',
  },

  // Chat Errors
  CHAT: {
    NOT_FOUND: 'Chat not found',
    LOAD_FAILED: 'Failed to load messages',
    SEND_FAILED: 'Failed to send message',
    DELETE_FAILED: 'Failed to delete message',
    CREATE_GROUP_FAILED: 'Failed to create group',
    MIN_MEMBERS: `Select at least ${CHAT_CONFIG.MIN_GROUP_MEMBERS} members`,
    MAX_MEMBERS: `Maximum ${CHAT_CONFIG.MAX_GROUP_MEMBERS} members allowed`,
    EMPTY_NAME: 'Please enter a group name',
    NAME_TOO_LONG: `Group name must be less than ${CHAT_CONFIG.MAX_GROUP_NAME_LENGTH} characters`,
  },

  // Network Errors
  NETWORK: {
    NO_CONNECTION: 'No internet connection',
    TIMEOUT: 'Request timeout. Please try again',
    SERVER_ERROR: 'Server error. Please try again later',
  },

  // General Errors
  GENERAL: {
    UNKNOWN_ERROR: 'Something went wrong',
    PERMISSION_DENIED: 'Permission denied',
    NOT_FOUND: 'Resource not found',
  },
} as const;

// ============ SUCCESS MESSAGES ============

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    SIGNUP: 'Account created successfully',
    PASSWORD_RESET: 'Password reset email sent',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  CHAT: {
    GROUP_CREATED: 'Group created successfully',
    GROUP_DELETED: 'Group deleted successfully',
    MESSAGE_SENT: 'Message sent',
    MESSAGE_DELETED: 'Message deleted',
    MESSAGES_CLEARED: 'Messages cleared',
  },
} as const;

// ============ FIREBASE ERROR CODES ============

export const FIREBASE_ERROR_CODES = {
  // Auth
  'auth/user-not-found': ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
  'auth/wrong-password': ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
  'auth/email-already-in-use': ERROR_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
  'auth/weak-password': ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
  'auth/invalid-email': ERROR_MESSAGES.AUTH.INVALID_EMAIL,
  'auth/network-request-failed': ERROR_MESSAGES.AUTH.NETWORK_ERROR,
  'auth/too-many-requests': ERROR_MESSAGES.AUTH.TOO_MANY_REQUESTS,
  'auth/user-token-expired': ERROR_MESSAGES.AUTH.SESSION_EXPIRED,

  // Firestore
  'permission-denied': ERROR_MESSAGES.GENERAL.PERMISSION_DENIED,
  'not-found': ERROR_MESSAGES.GENERAL.NOT_FOUND,
  unavailable: ERROR_MESSAGES.NETWORK.NO_CONNECTION,
  'deadline-exceeded': ERROR_MESSAGES.NETWORK.TIMEOUT,
} as const;

// ============ REGEX PATTERNS ============

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// ============ DATE FORMATS ============

export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy HH:mm',
  DATE_ONLY: 'MMMM dd, yyyy',
  TIME_ONLY: 'HH:mm',
  SHORT: 'MMM dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============ NOTIFICATION TYPES ============

export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  GROUP_INVITE: 'group_invite',
  MENTION: 'mention',
  SYSTEM: 'system',
} as const;

// ============ SCREEN NAMES ============
// Note: Consider migrating ScreenConstants.tsx to use this
export const SCREENS = {
  // Auth
  SPLASH: 'SPLASH_SCREEN',
  ONBOARDING: 'ONBOARDING_SCREEN',
  LOGIN: 'LOGIN_SCREEN',
  SIGNUP: 'SIGNUP_SCREEN',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  VERIFY_OTP: 'VERIFY_OTP',
  RESET_PASSWORD: 'RESET_PASSWORD',
  SUCCESS_RESET: 'SUCCESS_RESET',

  // Main
  HOME: 'HOME_SCREEN',
  CHAT: 'CHAT_SCREEN',
  CREATE_GROUP: 'CREATE_GROUP_CHAT',
  PROFILE: 'PROFILE_SCREEN',
  SETTINGS: 'SETTINGS_SCREEN',
  WALLPAPER: 'WALLPAPER_SCREEN',
} as const;

// ============ PERMISSIONS ============

export const PERMISSIONS = {
  CAMERA: 'camera',
  PHOTO_LIBRARY: 'photo_library',
  NOTIFICATIONS: 'notifications',
  LOCATION: 'location',
} as const;

export default {
  APP_CONFIG,
  FIREBASE_COLLECTIONS,
  STORAGE_KEYS,
  API_CONFIG,
  FIREBASE_CONFIG,
  CHAT_CONFIG,
  UI_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FIREBASE_ERROR_CODES,
  REGEX_PATTERNS,
  DATE_FORMATS,
  NOTIFICATION_TYPES,
  SCREENS,
  PERMISSIONS,
};
