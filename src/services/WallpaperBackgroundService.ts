/**
 * Wallpaper Background Service
 * 
 * This service handles daily automatic wallpaper updates using background tasks.
 * 
 * IMPORTANT NOTES:
 * - Android: Requires react-native-background-fetch or WorkManager
 * - iOS: NOT SUPPORTED (Apple restriction - wallpapers cannot be changed programmatically)
 * - Background tasks may be killed by OEMs (Xiaomi, Huawei, etc.) unless whitelisted
 * 
 * SETUP REQUIRED:
 * 1. Install: npm install react-native-background-fetch
 * 2. Configure Android: Follow react-native-background-fetch setup guide
 * 3. Whitelist app in device battery optimization settings
 */

import {Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setHomeWallpaper, isWallpaperSupported} from '../utils/WallpaperManager';

// Try to import background-fetch (may not be installed)
let BackgroundFetch: any = null;
try {
  BackgroundFetch = require('react-native-background-fetch').default;
} catch (e) {
  console.warn('react-native-background-fetch not installed. Background tasks will not work.');
}

interface WallpaperUpdateConfig {
  enabled: boolean;
  type: 'home' | 'lock' | 'both';
  lastUpdateDate?: string;
}

/**
 * Check if wallpaper needs updating (if a day has passed)
 */
export const shouldUpdateWallpaper = async (): Promise<boolean> => {
  try {
    const lastUpdateDate = await AsyncStorage.getItem('calendarLastUpdateDate');
    if (!lastUpdateDate) {
      return true; // Never updated, should update
    }

    const lastUpdate = new Date(lastUpdateDate);
    const currentDate = new Date();
    const todayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const lastUpdateDateOnly = new Date(
      lastUpdate.getFullYear(),
      lastUpdate.getMonth(),
      lastUpdate.getDate(),
    );

    // Check if a new day has started
    return todayDate.getTime() > lastUpdateDateOnly.getTime();
  } catch (error) {
    console.error('Error checking update status:', error);
    return false;
  }
};

/**
 * Get wallpaper update configuration from storage
 */
export const getWallpaperConfig = async (): Promise<WallpaperUpdateConfig | null> => {
  try {
    const enabled = await AsyncStorage.getItem('calendarAutoUpdateEnabled');
    const type = await AsyncStorage.getItem('calendarAutoUpdateType');
    const lastUpdate = await AsyncStorage.getItem('calendarLastUpdateDate');

    if (enabled === null) {
      return null;
    }

    return {
      enabled: enabled === 'true',
      type: (type === 'home' || type === 'lock' || type === 'both' ? type : 'both') as 'home' | 'lock' | 'both',
      lastUpdateDate: lastUpdate || undefined,
    };
  } catch (error) {
    console.error('Error getting wallpaper config:', error);
    return null;
  }
};

/**
 * Set wallpaper from URI (used by background task)
 */
export const setWallpaperFromUri = async (
  uri: string,
  type: 'home' | 'lock' | 'both', // Type parameter kept for compatibility, but always uses HOME
): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // Use simplified HOME-only wallpaper setting (most reliable)
    const success = await setHomeWallpaper(uri);
    
    if (success) {
      // Save last update date
      await AsyncStorage.setItem('calendarLastUpdateDate', new Date().toISOString());
      console.log('Background wallpaper update successful');
    }
    
    return success;
  } catch (error) {
    console.error('Error setting wallpaper from background:', error);
    return false;
  }
};

// Callback function to capture calendar (set by YearCalendar component)
let captureCalendarCallback: (() => Promise<string | null>) | null = null;

/**
 * Set the callback function for capturing calendar
 * This is called by YearCalendar component to register its capture function
 */
export const setCaptureCalendarCallback = (
  callback: (() => Promise<string | null>) | null,
): void => {
  if (callback === null) {
    captureCalendarCallback = null;
    return;
  }
  captureCalendarCallback = callback;
};

/**
 * Initialize background fetch task
 * Call this when app starts and auto-update is enabled
 */
export const initializeBackgroundTask = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !BackgroundFetch) {
    console.warn('Background fetch not available (iOS or not installed)');
    return false;
  }

  try {
    const config = await getWallpaperConfig();
    if (!config || !config.enabled) {
      console.log('Background task not enabled or config not found');
      return false;
    }

    // Configure background fetch
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Minimum 15 minutes (Android restriction)
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Works offline
      },
      async (taskId: string) => {
        console.log('🔄 Background task started:', taskId);
        
        try {
          const needsUpdate = await shouldUpdateWallpaper();
          if (!needsUpdate) {
            console.log('✅ No update needed - already updated today');
            BackgroundFetch.finish(taskId);
            return;
          }

          // Try to capture calendar if callback is available (app is active)
          if (captureCalendarCallback) {
            console.log('📸 App is active - capturing calendar...');
            const uri = await captureCalendarCallback();
            if (uri) {
              const success = await setWallpaperFromUri(uri, config.type);
              if (success) {
                console.log('✅ Wallpaper updated successfully from background task');
              } else {
                console.error('❌ Failed to set wallpaper from background task');
              }
            } else {
              console.warn('⚠️ Failed to capture calendar image');
            }
          } else {
            // App is terminated - headless task will handle this
            console.log('📱 App is terminated - headless task will handle update');
          }
          
          BackgroundFetch.finish(taskId);
        } catch (error) {
          console.error('❌ Background task error:', error);
          BackgroundFetch.finish(taskId);
        }
      },
      (error: Error) => {
        console.error('❌ Background fetch failed:', error);
      },
    );

    // Start background fetch
    await BackgroundFetch.start();
    console.log('✅ Background task initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing background task:', error);
    return false;
  }
};

/**
 * Stop background fetch task
 */
export const stopBackgroundTask = async (): Promise<void> => {
  if (Platform.OS !== 'android' || !BackgroundFetch) {
    return;
  }

  try {
    await BackgroundFetch.stop();
    console.log('Background task stopped');
  } catch (error) {
    console.error('Error stopping background task:', error);
  }
};

/**
 * Check background fetch status
 */
export const getBackgroundTaskStatus = async (): Promise<{
  available: boolean;
  enabled: boolean;
}> => {
  if (Platform.OS !== 'android' || !BackgroundFetch) {
    return {available: false, enabled: false};
  }

  try {
    const status = await BackgroundFetch.status();
    return {
      available: true,
      enabled: status === BackgroundFetch.STATUS_AVAILABLE,
    };
  } catch (error) {
    console.error('Error getting background task status:', error);
    return {available: false, enabled: false};
  }
};
