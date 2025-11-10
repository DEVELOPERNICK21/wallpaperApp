import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {AppState, AppStateStatus} from 'react-native';

class PresenceTracker {
  private appStateSubscription: any = null;
  private currentUser: any = null;

  /**
   * Initialize presence tracking
   */
  initialize() {
    this.currentUser = auth().currentUser;

    if (!this.currentUser) {
      console.log('⚠️ No user logged in, presence tracking disabled');
      return;
    }

    console.log(
      '👁️ Initializing presence tracking for user:',
      this.currentUser.uid,
    );

    // Set user as online when initializing
    this.setUserOnline();

    // Listen to app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (!this.currentUser) return;

    console.log('📱 App state changed:', nextAppState);

    if (nextAppState === 'active') {
      // App came to foreground - set user online
      console.log('✅ User came online');
      this.setUserOnline();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background - set user offline
      console.log('❌ User went offline');
      this.setUserOffline();
    }
  };

  /**
   * Set user status to online
   */
  async setUserOnline() {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await firestore().collection('Users').doc(currentUser.uid).update({
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ User status set to ONLINE');
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  }

  /**
   * Set user status to offline
   */
  async setUserOffline() {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await firestore().collection('Users').doc(currentUser.uid).update({
        isOnline: false,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });

      console.log('❌ User status set to OFFLINE');
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  /**
   * Get user's online status
   */
  async getUserOnlineStatus(userId: string): Promise<{
    isOnline: boolean;
    lastSeen: any;
  }> {
    try {
      const userDoc = await firestore().collection('Users').doc(userId).get();
      const userData = userDoc.data();

      return {
        isOnline: userData?.isOnline || false,
        lastSeen: userData?.lastSeen || null,
      };
    } catch (error) {
      console.error('Error getting user online status:', error);
      return {isOnline: false, lastSeen: null};
    }
  }

  /**
   * Listen to user's online status in real-time
   */
  listenToUserStatus(
    userId: string,
    callback: (isOnline: boolean, lastSeen: any) => void,
  ) {
    if (!userId) {
      console.warn('⚠️ No userId provided for status listener');
      return () => {};
    }

    console.log('👂 Listening to user status:', userId);

    const unsubscribe = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot(
        doc => {
          const data = doc.data();
          const isOnline = data?.isOnline || false;
          const lastSeen = data?.lastSeen || null;

          console.log(
            '📡 User status update:',
            userId,
            isOnline ? 'ONLINE' : 'OFFLINE',
          );
          callback(isOnline, lastSeen);
        },
        error => {
          console.error('Error listening to user status:', error);
        },
      );

    return unsubscribe;
  }

  /**
   * Cleanup presence tracking
   */
  cleanup() {
    console.log('🧹 Cleaning up presence tracking');

    // Set user offline before cleanup
    this.setUserOffline();

    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Export singleton instance
export const presenceTracker = new PresenceTracker();

// Helper function to format last seen time
export const formatLastSeen = (lastSeen: any): string => {
  if (!lastSeen) return 'last seen recently';

  try {
    const lastSeenDate = lastSeen.toDate
      ? lastSeen.toDate()
      : new Date(lastSeen);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return 'last seen just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `last seen ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `last seen ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `last seen ${days} day${days !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'last seen recently';
  }
};
