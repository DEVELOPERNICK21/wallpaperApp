/**
 * Headless Task Handler for Background Wallpaper Updates
 * 
 * This task runs when the app is terminated and a background fetch event occurs.
 * 
 * IMPORTANT LIMITATION:
 * - Cannot render React components in headless mode
 * - Can only execute JavaScript logic
 * - For true background updates, we need to either:
 *   1. Use a native module to generate calendar image
 *   2. Pre-generate calendar images
 *   3. Show notification to user to open app
 * 
 * Current implementation: Shows notification when update is needed
 */

import {AppRegistry} from 'react-native';
import {shouldUpdateWallpaper, getWallpaperConfig, setWallpaperFromUri} from './WallpaperBackgroundService';

// Try to import notifee (may not be available in headless context)
let notifee: any = null;
try {
  notifee = require('@notifee/react-native').default;
} catch (e) {
  console.warn('@notifee/react-native not available in headless context');
}

/**
 * Headless task that runs when app is terminated
 * This is registered in index.js
 */
const HeadlessTask = async (taskId: string) => {
  console.log('📱 Headless task started:', taskId);

  try {
    // Check if wallpaper update is needed
    const needsUpdate = await shouldUpdateWallpaper();
    if (!needsUpdate) {
      console.log('✅ No update needed - already updated today');
      return;
    }

    // Get wallpaper configuration
    const config = await getWallpaperConfig();
    if (!config || !config.enabled) {
      console.log('⚠️ Auto-update disabled');
      return;
    }

    // IMPORTANT: We cannot render React components in headless mode
    // So we have two options:
    // 1. Show notification to user (current implementation)
    // 2. Use native module to generate calendar image (requires native code)
    
    // Option 1: Show notification (if notifee is available)
    if (notifee) {
      try {
        await notifee.createChannel({
          id: 'wallpaper-update',
          name: 'Wallpaper Update',
          importance: 4, // High importance
        });

        await notifee.displayNotification({
          title: '📅 Calendar Wallpaper Update',
          body: 'Open the app to update your calendar wallpaper for today',
          android: {
            channelId: 'wallpaper-update',
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: 'Update Now',
                pressAction: {
                  id: 'update',
                },
              },
            ],
          },
        });

        console.log('📬 Notification sent - user needs to open app to update wallpaper');
      } catch (notifError) {
        console.error('Error showing notification:', notifError);
      }
    } else {
      console.log('⚠️ Notification service not available - user needs to open app manually');
    }
    
    // Note: For true automatic updates without user interaction,
    // you need to implement a native module that generates the calendar image
    // See: WALLPAPER_AUTO_UPDATE_SETUP.md for details

  } catch (error) {
    console.error('❌ Headless task error:', error);
  }
};

// Register headless task
AppRegistry.registerHeadlessTask('BackgroundFetch', () => HeadlessTask);

export default HeadlessTask;
