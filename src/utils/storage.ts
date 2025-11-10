/**
 * Centralized Storage Utilities
 * All AsyncStorage operations go through this service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/constants';
import {User} from '../types';

// ============ USER STORAGE ============

export const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    console.log('✅ User data stored');
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    console.log('✅ User data removed');
  } catch (error) {
    console.error('Error removing user data:', error);
    throw error;
  }
};

// ============ AUTH TOKEN STORAGE ============

export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

// ============ THEME STORAGE ============

export const storeTheme = async (isDark: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, isDark.toString());
  } catch (error) {
    console.error('Error storing theme:', error);
    throw error;
  }
};

export const getTheme = async (): Promise<boolean> => {
  try {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'true';
  } catch (error) {
    console.error('Error retrieving theme:', error);
    return false; // Default to light theme
  }
};

// ============ ONBOARDING STORAGE ============

export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
    );
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// ============ FCM TOKEN STORAGE ============

export const storeFCMToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
  } catch (error) {
    console.error('Error storing FCM token:', error);
    throw error;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    return null;
  }
};

// ============ GENERIC STORAGE METHODS ============

export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('✅ All storage cleared');
  } catch (error) {
    console.error('Error clearing all storage:', error);
    throw error;
  }
};

export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

export const multiGet = async (
  keys: string[],
): Promise<readonly (readonly [string, string | null])[]> => {
  try {
    return await AsyncStorage.multiGet(keys);
  } catch (error) {
    console.error('Error in multiGet:', error);
    return [];
  }
};

export const multiSet = async (
  keyValuePairs: [string, string][],
): Promise<void> => {
  try {
    await AsyncStorage.multiSet(keyValuePairs);
  } catch (error) {
    console.error('Error in multiSet:', error);
    throw error;
  }
};

export const multiRemove = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error in multiRemove:', error);
    throw error;
  }
};

// ============ UTILITY METHODS ============

export const hasKey = async (key: string): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.includes(key);
  } catch (error) {
    console.error(`Error checking if key ${key} exists:`, error);
    return false;
  }
};

export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    let totalSize = 0;

    items.forEach(([key, value]) => {
      if (value) {
        totalSize += key.length + value.length;
      }
    });

    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

// Backward compatibility exports (for existing code)
export const storeUserData = storeUser;
export const getUserData = getUser;
export const removeUserData = removeUser;

export default {
  // User
  storeUser,
  getUser,
  removeUser,
  storeUserData, // Backward compat
  getUserData, // Backward compat
  removeUserData, // Backward compat

  // Auth
  storeAuthToken,
  getAuthToken,
  removeAuthToken,

  // Theme
  storeTheme,
  getTheme,

  // Onboarding
  setOnboardingCompleted,
  isOnboardingCompleted,

  // FCM
  storeFCMToken,
  getFCMToken,

  // Generic
  storeData,
  getData,
  removeData,
  clearAllData,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  hasKey,
  getStorageSize,
};
