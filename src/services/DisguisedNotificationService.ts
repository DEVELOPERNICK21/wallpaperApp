import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Disguised Notification Service
 * Shows wallpaper-themed notifications instead of revealing message content
 * Maintains the app's disguise as a wallpaper application
 */

// Disguised notification messages (wallpaper-themed)
const DISGUISED_MESSAGES = [
  'Wallpaper update available',
  'New wallpaper collection ready',
  'Wallpaper is being updated',
  'Checking for new wallpapers',
  'Wallpaper sync in progress',
  'New wallpapers added',
  'Wallpaper refresh complete',
  'HD wallpapers available',
];

// Get a random disguised message
const getDisguisedMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * DISGUISED_MESSAGES.length);
  return DISGUISED_MESSAGES[randomIndex];
};

// Channel ID for notifications
const CHANNEL_ID = 'wallpaper_updates';

/**
 * Create notification channel (Android)
 */
export const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Wallpaper Updates',
      description: 'Notifications for wallpaper updates',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ iOS notification permission granted');
      }
      return enabled;
    } else {
      // Android
      const settings = await notifee.requestPermission();
      const enabled =
        settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

      if (enabled) {
        console.log('✅ Android notification permission granted');
        await createNotificationChannel();
      }
      return enabled;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if notifications are enabled in privacy settings
 */
const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem('notificationsEnabled');
    return enabled !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return true;
  }
};

/**
 * Display a disguised notification (foreground)
 */
export const displayDisguisedNotification = async (
  remoteMessage?: any,
): Promise<void> => {
  try {
    // Check if notifications are enabled in settings
    const notificationsEnabled = await areNotificationsEnabled();
    if (!notificationsEnabled) {
      console.log('🔕 Notifications disabled in settings');
      return;
    }

    const disguisedMessage = getDisguisedMessage();

    console.log('📱 Displaying disguised notification:', disguisedMessage);

    // Display notification using Notifee
    await notifee.displayNotification({
      title: 'Wallpaper',
      body: disguisedMessage,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification', // Make sure you have this icon
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        // Hide notification content when locked (optional)
        visibility: 1, // VISIBILITY_PRIVATE
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
      data: {
        // Store actual message data here (encrypted/hidden)
        actualMessage: remoteMessage?.notification?.body || '',
        senderId: remoteMessage?.data?.senderId || '',
        chatId: remoteMessage?.data?.chatId || '',
      },
    });
  } catch (error) {
    console.error('❌ Error displaying disguised notification:', error);
  }
};

/**
 * Handle foreground messages (when app is open)
 */
export const setupForegroundNotifications = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('📬 Foreground message received:', remoteMessage);

    // Display disguised notification
    await displayDisguisedNotification(remoteMessage);
  });
};

/**
 * Handle background messages (when app is in background)
 * This should be called in index.js
 */
export const handleBackgroundMessage = async (remoteMessage: any) => {
  console.log('📬 Background message received:', remoteMessage);

  // Check if notifications are enabled
  const notificationsEnabled = await areNotificationsEnabled();
  if (!notificationsEnabled) {
    console.log('🔕 Notifications disabled in settings');
    return;
  }

  // Display disguised notification
  await displayDisguisedNotification(remoteMessage);
};

/**
 * Handle notification when app is opened from background
 */
export const setupNotificationOpenedApp = () => {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📱 App opened from notification:', remoteMessage);

    // You can navigate to the chat screen here
    // For now, just log it
    const chatId = remoteMessage?.data?.chatId;
    if (chatId) {
      console.log('Navigate to chat:', chatId);
      // TODO: Navigate to specific chat
      // navigationRef.navigate('ChatScreen', { chatId });
    }
  });
};

/**
 * Handle notification when app is opened from quit state
 */
export const checkInitialNotification = async () => {
  const remoteMessage = await messaging().getInitialNotification();

  if (remoteMessage) {
    console.log(
      '📱 App opened from quit state by notification:',
      remoteMessage,
    );

    const chatId = remoteMessage?.data?.chatId;
    if (chatId) {
      console.log('Navigate to chat:', chatId);
      // TODO: Navigate to specific chat
      // navigationRef.navigate('ChatScreen', { chatId });
    }
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      console.log('🔑 FCM Token:', fcmToken);

      // Save token to AsyncStorage
      await AsyncStorage.setItem('fcmToken', fcmToken);

      // TODO: Send this token to your backend
      // await sendTokenToBackend(fcmToken);

      return fcmToken;
    }

    console.log('⚠️ No FCM Token available');
    return null;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for FCM token refresh
 */
export const setupTokenRefreshListener = () => {
  return messaging().onTokenRefresh(async fcmToken => {
    console.log('🔄 FCM Token refreshed:', fcmToken);

    // Save new token
    await AsyncStorage.setItem('fcmToken', fcmToken);

    // TODO: Send updated token to your backend
    // await sendTokenToBackend(fcmToken);
  });
};

/**
 * Badge count management
 */
export const setBadgeCount = async (count: number) => {
  try {
    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(count);
    }
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

export const incrementBadgeCount = async () => {
  try {
    if (Platform.OS === 'ios') {
      await notifee.incrementBadgeCount();
    }
  } catch (error) {
    console.error('Error incrementing badge count:', error);
  }
};

export const decrementBadgeCount = async () => {
  try {
    if (Platform.OS === 'ios') {
      await notifee.decrementBadgeCount();
    }
  } catch (error) {
    console.error('Error decrementing badge count:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await notifee.cancelAllNotifications();
    await setBadgeCount(0);
    console.log('🧹 All notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Save FCM token to Firestore for the current user
 */
export const saveFCMTokenToFirestore = async () => {
  try {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      console.log('⚠️ No user logged in, cannot save FCM token');
      return;
    }

    const fcmToken = await AsyncStorage.getItem('fcmToken');

    if (!fcmToken) {
      console.log('⚠️ No FCM token to save');
      return;
    }

    await firestore().collection('users').doc(currentUser.uid).set(
      {
        fcmToken: fcmToken,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
        lastActive: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );

    console.log('✅ FCM token saved to Firestore for user:', currentUser.uid);
  } catch (error) {
    console.error('❌ Error saving FCM token to Firestore:', error);
  }
};

/**
 * Debug function to print notification status
 */
export const debugNotificationStatus = async () => {
  console.log('\n========================================');
  console.log('🔍 NOTIFICATION DEBUG STATUS');
  console.log('========================================');

  try {
    // 1. Check FCM permission
    const authStatus = await messaging().hasPermission();
    console.log('1. FCM Permission Status:', authStatus);
    console.log(
      '   - AUTHORIZED:',
      authStatus === messaging.AuthorizationStatus.AUTHORIZED,
    );
    console.log(
      '   - PROVISIONAL:',
      authStatus === messaging.AuthorizationStatus.PROVISIONAL,
    );

    // 2. Check FCM token
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log('2. FCM Token Status:', fcmToken ? 'EXISTS ✅' : 'MISSING ❌');
    if (fcmToken) {
      console.log('   Token (first 50 chars):', fcmToken.substring(0, 50));
    }

    // 3. Check Notifee permission
    const settings = await notifee.getNotificationSettings();
    console.log('3. Notifee Permission:', settings.authorizationStatus);
    console.log(
      '   - Authorized:',
      settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED,
    );

    // 4. Check app notification settings
    const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');
    console.log(
      '4. Notifications Enabled in App:',
      notifEnabled !== 'false' ? 'YES ✅' : 'NO ❌',
    );

    // 5. Check current user
    const currentUser = auth().currentUser;
    console.log(
      '5. Current User:',
      currentUser ? currentUser.uid : 'NOT LOGGED IN ❌',
    );

    // 6. Platform info
    console.log('6. Platform:', Platform.OS);
    console.log('   Version:', Platform.Version);

    console.log('========================================\n');

    return {
      fcmPermission: authStatus,
      fcmToken: fcmToken,
      notifeePermission: settings.authorizationStatus,
      appNotificationsEnabled: notifEnabled !== 'false',
      userId: currentUser?.uid,
      platform: Platform.OS,
    };
  } catch (error) {
    console.error('❌ Error in debug status:', error);
    console.log('========================================\n');
    return null;
  }
};

/**
 * Initialize notification service
 */
export const initializeNotifications = async () => {
  try {
    console.log('🚀 Initializing disguised notification service...');

    // Request permissions
    const permissionGranted = await requestNotificationPermission();

    if (!permissionGranted) {
      console.log('⚠️ Notification permission not granted');
      return;
    }

    // Create channel (Android)
    await createNotificationChannel();

    // Get FCM token
    const token = await getFCMToken();

    // Save token to Firestore if user is logged in
    if (token) {
      await saveFCMTokenToFirestore();
    }

    // Setup foreground handler
    setupForegroundNotifications();

    // Setup notification opened app handler
    setupNotificationOpenedApp();

    // Setup token refresh listener
    setupTokenRefreshListener();

    // Check if app was opened from notification (quit state)
    await checkInitialNotification();

    console.log('✅ Disguised notification service initialized');

    // Print debug status
    await debugNotificationStatus();
  } catch (error) {
    console.error('❌ Error initializing notification service:', error);
  }
};

export default {
  initializeNotifications,
  displayDisguisedNotification,
  requestNotificationPermission,
  getFCMToken,
  setBadgeCount,
  incrementBadgeCount,
  decrementBadgeCount,
  clearAllNotifications,
  setupForegroundNotifications,
  setupNotificationOpenedApp,
  handleBackgroundMessage,
  saveFCMTokenToFirestore,
  debugNotificationStatus,
};
