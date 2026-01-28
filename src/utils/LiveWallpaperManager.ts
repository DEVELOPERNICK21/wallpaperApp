/**
 * Live Wallpaper Manager Utility
 *
 * Provides functions to check if live wallpaper is supported
 * and open the live wallpaper settings/picker
 */

import {Platform, Linking, Alert} from 'react-native';

/**
 * Check if live wallpaper is supported on the current device
 *
 * Live wallpaper is only supported on Android
 *
 * @returns boolean - true if live wallpaper is supported, false otherwise
 */
export const isLiveWallpaperSupported = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }

  // Live wallpaper is supported on Android 5.0+ (API 21+)
  // Most modern Android devices support it
  // We can't check programmatically without native code,
  // so we assume it's supported on Android
  return Platform.OS === 'android';
};

/**
 * Open live wallpaper settings/picker
 *
 * On Android, this opens the system live wallpaper picker
 * where users can select and set the calendar live wallpaper
 *
 * @returns Promise<void>
 */
export const openLiveWallpaperSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Not Supported',
      'Live wallpaper is only available on Android devices.',
    );
    return;
  }

  try {
    // Try to open live wallpaper picker intent
    // This will show all available live wallpapers including our calendar wallpaper
    const intent = 'android.service.wallpaper.CHANGE_LIVE_WALLPAPER';

    // Use Linking to open the intent
    // Note: This may not work on all devices as some OEMs customize the wallpaper picker
    const url = `intent:#Intent;action=${intent};end`;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback: Open general wallpaper settings
      // Users can then navigate to live wallpapers
      Alert.alert(
        'Open Wallpaper Settings',
        'Please go to Settings → Display → Wallpaper → Live Wallpapers to set the calendar live wallpaper.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                // Try to open display settings
                await Linking.openSettings();
              } catch (error) {
                console.error('Error opening settings:', error);
                Alert.alert(
                  'Settings',
                  'Please manually go to Settings → Display → Wallpaper → Live Wallpapers',
                );
              }
            },
          },
        ],
      );
    }
  } catch (error) {
    console.error('Error opening live wallpaper settings:', error);
    Alert.alert(
      'Unable to Open Settings',
      'Please manually go to Settings → Display → Wallpaper → Live Wallpapers to set the calendar live wallpaper.',
    );
  }
};

/**
 * Alternative method: Open live wallpaper picker via native module
 *
 * This would require a native module to directly open the live wallpaper picker
 * For now, we use the Linking API approach above
 */
export const openLiveWallpaperPicker = async (): Promise<void> => {
  return openLiveWallpaperSettings();
};
