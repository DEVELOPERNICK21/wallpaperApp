/**
 * Wallpaper Manager Utility
 *
 * Supports setting wallpaper on HOME screen, LOCK screen, or BOTH screens.
 *
 * IMPORTANT: Lock screen wallpaper may be blocked on some Android devices
 * by OEM restrictions. If lock screen setting fails, try home screen only.
 *
 * DIAGNOSTIC MODE:
 * If wallpaper setting fails, use testWithStaticImage() to verify if the
 * native module works at all. If static image also fails, the issue is
 * in the native module or device restrictions, NOT in your JS code.
 */

import {Platform, Alert} from 'react-native';
import ManageWallpaper, {
  TYPE as WallpaperType,
} from 'react-native-manage-wallpaper';
import RNFS from 'react-native-fs';

// Export test function for easy access from dev menu or debug buttons
export {testWithStaticImage};

/**
 * DIAGNOSTIC TEST: Test with a static image file
 *
 * Use this to prove if the native module works at all.
 *
 * Steps:
 * 1. Manually place a test.jpg file in /sdcard/Download/
 * 2. Call: testWithStaticImage()
 * 3. Check result:
 *    - ✅ Works → Your ViewShot/capture path is the issue
 *    - ❌ Fails → Native module is broken or device blocks it
 *
 * @returns Promise<boolean> - true if static image works, false otherwise
 */
export const testWithStaticImage = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.warn('Test only works on Android');
    return false;
  }

  // Try multiple possible paths for Downloads directory
  const possiblePaths = [
    `${RNFS.DownloadDirectoryPath}/test.jpg`, // Use RNFS path (most reliable)
    '/storage/emulated/0/Download/test.jpg', // Standard Android 10+
    '/sdcard/Download/test.jpg', // Legacy path
  ];

  console.log('🧪 DIAGNOSTIC TEST: Testing with static image');
  console.log('🧪 Checking paths:', possiblePaths);

  let testPath: string | null = null;
  let testUri: string | null = null;

  // Find which path exists
  for (const path of possiblePaths) {
    try {
      const exists = await RNFS.exists(path);
      console.log(`🧪 Checking: ${path} → exists: ${exists}`);

      if (exists) {
        const fileInfo = await RNFS.stat(path);
        if (fileInfo.size > 0) {
          testPath = path;
          testUri = `file://${path}`;
          console.log(`✅ Found test file at: ${path}`);
          break;
        }
      }
    } catch (error) {
      console.log(`🧪 Path ${path} not accessible:`, error);
    }
  }

  if (!testPath || !testUri) {
    const downloadPath = RNFS.DownloadDirectoryPath;

    // Try to find captured calendar image as fallback
    let capturedImageUri: string | null = null;
    try {
      const cacheFiles = await RNFS.readDir(RNFS.CachesDirectoryPath);
      const jpgFiles = cacheFiles.filter(
        f => f.name.includes('ReactNative-snapshot') && f.size > 0,
      );
      if (jpgFiles.length > 0) {
        const latestFile = jpgFiles.sort((a, b) => b.mtime - a.mtime)[0];
        capturedImageUri = `file://${latestFile.path}`;
        console.log('🧪 Found captured calendar image:', capturedImageUri);
      }
    } catch (error) {
      console.log('🧪 Could not check cache for captured images:', error);
    }

    if (capturedImageUri) {
      // Auto-use captured image if available
      console.log(
        '🧪 Using captured calendar image for test:',
        capturedImageUri,
      );
      const success = await setHomeWallpaper(capturedImageUri);

      if (success) {
        console.log(
          '✅ DIAGNOSTIC TEST PASSED: Native module works with captured image!',
        );
        Alert.alert(
          'Test Passed ✅',
          'Used captured calendar image successfully!\n\nThis means:\n• Native module works\n• Permissions are OK\n• Captured image path is correct\n\nYour wallpaper feature should work!',
        );
        return true;
      } else {
        console.log('❌ DIAGNOSTIC TEST FAILED: Even captured image failed');
        Alert.alert(
          'Test Failed ❌',
          'Even the captured calendar image failed to set.\n\nThis means:\n• Native module is broken\n• Device blocks wallpaper changes\n• Missing permissions\n• OEM restrictions\n\nCheck Logcat for native errors.',
        );
        return false;
      }
    }

    // No captured image, ask user to provide test file
    Alert.alert(
      'Test File Missing',
      `Please place a test.jpg file in your Downloads folder.\n\nRecommended path:\n${downloadPath}/test.jpg\n\nYou can:\n1. Save any image from gallery\n2. Rename it to test.jpg\n3. Move it to Downloads folder\n\nOr capture the calendar first, then run test again.`,
    );
    return false;
  }

  // Check file details
  try {
    const fileInfo = await RNFS.stat(testPath);
    console.log('🧪 File size:', fileInfo.size);
    console.log('🧪 File path:', testPath);
    console.log('🧪 File URI:', testUri);

    if (fileInfo.size === 0) {
      Alert.alert('Test Failed', 'Test file is empty');
      return false;
    }
  } catch (error) {
    console.error('🧪 File check error:', error);
    Alert.alert('Test Failed', `Cannot access test file: ${error}`);
    return false;
  }

  // Try to set wallpaper
  console.log('🧪 Attempting to set wallpaper...');
  const success = await setHomeWallpaper(testUri);

  if (success) {
    console.log('✅ DIAGNOSTIC TEST PASSED: Native module works!');
    Alert.alert(
      'Test Passed ✅',
      'Static image wallpaper was set successfully.\n\nThis means:\n• Native module works\n• Permissions are OK\n• Your issue is with the captured image path',
    );
  } else {
    console.log('❌ DIAGNOSTIC TEST FAILED: Native module or device issue');
    Alert.alert(
      'Test Failed ❌',
      'Static image wallpaper failed to set.\n\nThis means:\n• Native module is broken\n• Device blocks wallpaper changes\n• Missing permissions\n• OEM restrictions\n\nCheck Logcat for native errors.',
    );
  }

  return success;
};

/**
 * Set wallpaper from file URI (HOME screen only)
 *
 * @param uri - File URI (file:// path)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const setHomeWallpaper = async (uri: string): Promise<boolean> => {
  return setWallpaper(uri, WallpaperType.HOME);
};

/**
 * Set wallpaper from file URI (LOCK screen only)
 *
 * @param uri - File URI (file:// path)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const setLockWallpaper = async (uri: string): Promise<boolean> => {
  return setWallpaper(uri, WallpaperType.LOCK);
};

/**
 * Set wallpaper from file URI (BOTH home and lock screen)
 *
 * @param uri - File URI (file:// path)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const setBothWallpaper = async (uri: string): Promise<boolean> => {
  return setWallpaper(uri, WallpaperType.BOTH);
};

/**
 * Internal function to set wallpaper with specified type
 *
 * @param uri - File URI (file:// path)
 * @param type - Wallpaper type (HOME, LOCK, or BOTH)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
const setWallpaper = async (uri: string, type: number): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.warn('Wallpaper setting only works on Android');
    return false;
  }

  const typeName =
    type === WallpaperType.HOME
      ? 'HOME'
      : type === WallpaperType.LOCK
      ? 'LOCK'
      : 'BOTH';
  console.log(`📱 setWallpaper called with URI: ${uri}, Type: ${typeName}`);

  if (!ManageWallpaper || typeof ManageWallpaper.setWallpaper !== 'function') {
    console.error('❌ ManageWallpaper module not available');
    Alert.alert(
      'Feature Unavailable',
      'Wallpaper feature is not available. Please restart the app.',
    );
    return false;
  }

  try {
    console.log('📱 Calling ManageWallpaper.setWallpaper...');
    console.log('📱 URI:', uri);
    console.log(`📱 Type: ${typeName}`);

    let callbackFired = false;
    const result = await new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!callbackFired) {
          callbackFired = true;
          console.log(
            "⚠️ Callback timeout - assuming success (some versions don't call callback)",
          );
          resolve(true);
        }
      }, 3000);

      try {
        ManageWallpaper.setWallpaper(
          {uri},
          (result: any) => {
            if (callbackFired) return;
            callbackFired = true;
            clearTimeout(timeout);

            console.log('📱 Callback fired with result:', result);
            console.log('📱 Result type:', typeof result);
            console.log('📱 Result value:', JSON.stringify(result));

            // Some versions don't call callback, some do
            if (result && typeof result === 'object') {
              if (result.error || result.status === 'error') {
                const errorMsg =
                  result.message || result.error || 'Failed to set wallpaper';
                console.error('❌ Callback reported error:', errorMsg);
                reject(new Error(errorMsg));
                return;
              }
            }

            console.log('✅ Callback indicates success');
            resolve(true);
          },
          type,
        );
        console.log(
          '📱 setWallpaper call completed (waiting for callback or timeout)',
        );
      } catch (syncError: any) {
        if (!callbackFired) {
          callbackFired = true;
          clearTimeout(timeout);
          console.error('❌ Synchronous error:', syncError);
          reject(syncError);
        }
      }
    });

    console.log(`✅ setWallpaper completed for ${typeName}:`, result);
    return result;
  } catch (error: any) {
    console.error('❌ Failed to set wallpaper:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);

    // Provide helpful error message based on type
    const errorMsg = error?.message || 'Unknown error';
    const isLockScreen = type === WallpaperType.LOCK;
    const isBoth = type === WallpaperType.BOTH;

    if (errorMsg.includes('permission') || errorMsg.includes('Permission')) {
      Alert.alert(
        'Permission Required',
        'Wallpaper permission is required. Please grant it in Settings > Apps > This App > Permissions.',
      );
    } else if (
      isLockScreen ||
      (isBoth && errorMsg.toLowerCase().includes('lock'))
    ) {
      Alert.alert(
        'Lock Screen Not Supported',
        `Unable to set wallpaper on lock screen: ${errorMsg}\n\nMany Android devices block lock screen wallpaper changes due to:\n• OEM restrictions (Samsung, Xiaomi, Huawei, etc.)\n• Security policies\n• Custom launcher limitations\n\n💡 Try setting home screen only instead.`,
      );
    } else {
      Alert.alert(
        'Wallpaper Not Set',
        `Unable to set wallpaper: ${errorMsg}\n\n🔍 DIAGNOSTIC:\n• Check Logcat for native errors\n• Test with static image using testWithStaticImage()\n• Try on Pixel emulator\n• Device may block wallpaper changes\n\nIf static image also fails → native module issue or OEM restriction.`,
      );
    }

    return false;
  }
};

/**
 * Check if wallpaper setting is supported
 */
export const isWallpaperSupported = (): boolean => {
  const supported =
    Platform.OS === 'android' &&
    ManageWallpaper !== null &&
    typeof ManageWallpaper?.setWallpaper === 'function';

  console.log('📱 isWallpaperSupported check:', {
    platform: Platform.OS,
    hasManageWallpaper: !!ManageWallpaper,
    hasSetWallpaper: typeof ManageWallpaper?.setWallpaper === 'function',
    supported,
  });

  return supported;
};

/** Fixed filename for iOS Shortcuts automation (visible in Files app) */
export const YEAR_WALLPAPER_SHORTCUTS_FILENAME = 'YearProgressWallpaper.jpg';

/**
 * Save the year calendar image to app Documents so iOS Shortcuts can use it
 * (e.g. "At 12:00 AM → Get File → Set Lock Screen Wallpaper").
 * Only has effect on iOS when Documents are file-shared (UIFileSharingEnabled).
 *
 * @param sourceUri - File URI of the captured image (e.g. from ViewShot)
 * @returns Path to the saved file, or null if failed / not iOS
 */
export const saveYearWallpaperForShortcuts = async (
  sourceUri: string,
): Promise<string | null> => {
  if (Platform.OS !== 'ios') {
    return null;
  }
  try {
    const destPath = `${RNFS.DocumentDirectoryPath}/${YEAR_WALLPAPER_SHORTCUTS_FILENAME}`;
    const sourcePath = sourceUri.replace(/^file:\/\//, '');
    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      console.warn('saveYearWallpaperForShortcuts: source file not found', sourcePath);
      return null;
    }
    await RNFS.copyFile(sourcePath, destPath);
    console.log('Year wallpaper saved for Shortcuts:', destPath);
    return destPath;
  } catch (error) {
    console.error('saveYearWallpaperForShortcuts error:', error);
    return null;
  }
};
