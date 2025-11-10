/**
 * Centralized TypeScript Types & Interfaces
 */

import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

// ============ USER TYPES ============

export interface User {
  id: string;
  displayName: string;
  email: string;
  fcmToken?: string;
  photoURL?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  uid?: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ============ CHAT TYPES ============

export interface GroupChat {
  id: string;
  name: string;
  members: string[];
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  createdBy: string;
  lastReadTimestamps?: {[userId: string]: FirebaseFirestoreTypes.Timestamp};
  typingUser?: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  senderName: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  seenBy: string[];
  replyTo?: ReplyMessage | null;
}

export interface ReplyMessage {
  id: string;
  text: string;
  sender: string;
}

// ============ NAVIGATION TYPES ============

export type RootStackParamList = {
  SPLASH_SCREEN: undefined;
  ONBOARDING_SCREEN: undefined;
  LOGIN_SCREEN: undefined;
  SIGNUP_SCREEN: undefined;
  FORGOT_PASSWORD: undefined;
  VERIFY_OTP: {email: string};
  RESET_PASSWORD: {email: string; otp: string};
  SUCCESS_RESET: undefined;
  HOME_SCREEN: undefined;
  CHAT_SCREEN: {chatId: string; groupNameed: string};
  CREATE_GROUP_CHAT: undefined;
  PROFILE_SCREEN: undefined;
  SETTINGS_SCREEN: undefined;
  WALLPAPER_SCREEN: undefined;
};

// ============ REDUX TYPES ============

export interface AppState {
  isDarkMode: boolean;
  isOnline: boolean;
  lastSync?: Date;
}

export interface ThemeState {
  isDark: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export interface RootState {
  user: UserState;
  userDetails: UserState;
  appState: AppState;
  theme: ThemeState;
}

// ============ API TYPES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ============ NOTIFICATION TYPES ============

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
}

export enum NotificationType {
  MESSAGE = 'message',
  SYSTEM = 'system',
  ALERT = 'alert',
}

// ============ FORM TYPES ============

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// ============ UTILITY TYPES ============

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
  status: AsyncStatus;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
