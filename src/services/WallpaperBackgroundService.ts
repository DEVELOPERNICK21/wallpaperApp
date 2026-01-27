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
import ManageWallpaper from 'react-native-manage-wallpaper';

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
  type: 'home' | 'lock' | 'both',
): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    let callback;
    switch (type) {
      case 'home':
        callback = ManageWallpaper.TYPE.HOME;
        break;
      case 'lock':
        callback = ManageWallpaper.TYPE.LOCK;
        break;
      case 'both':
        callback = ManageWallpaper.TYPE.BOTH;
        break;
    }

    await ManageWallpaper.setWallpaper({uri}, callback);
    
    // Save last update date
    await AsyncStorage.setItem('calendarLastUpdateDate', new Date().toISOString());
    
    console.log('Background wallpaper update successful');
    return true;
  } catch (error) {
    console.error('Error setting wallpaper from background:', error);
    return false;
  }
};

/**
 * Initialize background fetch task
 * Call this when app starts and auto-update is enabled
 */
export const initializeBackgroundTask = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !BackgroundFetch) {
    return false;
  }

  try {
    const config = await getWallpaperConfig();
    if (!config || !config.enabled) {
      return false;
    }

    // Configure background fetch
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Minimum 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      },
      async (taskId: string) => {
        console.log('Background task started:', taskId);
        
        try {
          const needsUpdate = await shouldUpdateWallpaper();
          if (!needsUpdate) {
            console.log('No update needed - already updated today');
            BackgroundFetch.finish(taskId);
            return;
          }

          // NOTE: You need to render and capture the calendar here
          // This requires access to the calendar component or a headless renderer
          // For now, this is a placeholder - you'll need to implement calendar rendering
          // in the background context or use a pre-rendered image approach
          
          console.log('Background task completed');
          BackgroundFetch.finish(taskId);
        } catch (error) {
          console.error('Background task error:', error);
          BackgroundFetch.finish(taskId);
        }
      },
      (error: Error) => {
        console.error('Background fetch failed:', error);
      },
    );

    // Start background fetch
    await BackgroundFetch.start();
    console.log('Background task initialized');
    return true;
  } catch (error) {
    console.error('Error initializing background task:', error);
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
