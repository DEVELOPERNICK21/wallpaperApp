import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  Platform,
  AppState,
  View,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import Routes from './src/Routes';
import {SplashScreen} from './src/screens';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/redux/store';
import Orientation from 'react-native-orientation-locker';
import {height} from './src/assets/string';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PasswordScreen} from './src/screens';
import {presenceTracker} from './src/utils/presenceTracker';
import {initializeNotifications} from './src/services/DisguisedNotificationService';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [screenLockEnabled, setScreenLockEnabled] = useState(false);
  const [lockTimeout, setLockTimeout] = useState(60000); // Default 1 minute

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appState = useRef(AppState.currentState);

  // Initialize disguised notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Load screen lock settings
  useEffect(() => {
    const loadLockSettings = async () => {
      try {
        const screenLock = await AsyncStorage.getItem('screenLock');
        const lockTimer = await AsyncStorage.getItem('screenLockTimer');

        setScreenLockEnabled(screenLock === 'true');

        // Convert timer to milliseconds
        let timeout = 60000; // Default 1 minute
        switch (lockTimer) {
          case 'immediate':
            timeout = 0;
            break;
          case '1min':
            timeout = 60000; // 1 minute
            break;
          case '5min':
            timeout = 300000; // 5 minutes
            break;
          case '30min':
            timeout = 1800000; // 30 minutes
            break;
          default:
            timeout = 60000; // Default 1 minute
        }

        setLockTimeout(timeout);
        console.log('🔒 Screen lock settings loaded:', {
          enabled: screenLock === 'true',
          timer: lockTimer,
          timeout: timeout / 1000 + 's',
          timeoutMs: timeout,
          raw: {screenLock, lockTimer},
        });
      } catch (error) {
        console.error('Error loading lock settings:', error);
      }
    };

    loadLockSettings();
  }, []);

  // Start/Reset inactivity timer with useCallback to prevent stale closures
  const startInactivityTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // Don't start timer if screen lock is disabled or timeout is 0 (immediate)
    if (!screenLockEnabled || lockTimeout === 0) {
      console.log('⏱️ Timer not started (disabled or immediate mode)');
      return;
    }

    const startTime = Date.now();
    console.log(
      '⏱️ Starting inactivity timer:',
      lockTimeout / 1000 + 's',
      '(' + lockTimeout + 'ms)',
      'Lock enabled:',
      screenLockEnabled,
      'Start time:',
      new Date(startTime).toLocaleTimeString(),
    );

    // Start new timer
    inactivityTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const actualWaitTime = now - startTime;
      const inactiveDuration = now - lastActivityRef.current;

      console.log(
        '⏰ Inactivity timer fired!',
        '\n   Expected timeout:',
        lockTimeout / 1000 + 's (' + lockTimeout + 'ms)',
        '\n   Actual wait time:',
        actualWaitTime / 1000 + 's (' + actualWaitTime + 'ms)',
        '\n   Inactive duration:',
        inactiveDuration / 1000 + 's (' + inactiveDuration + 'ms)',
        '\n   Fire time:',
        new Date(now).toLocaleTimeString(),
      );

      if (inactiveDuration >= lockTimeout && screenLockEnabled) {
        console.log('🔒 Locking app due to inactivity');
        setIsLocked(true);
      } else {
        console.log('⚠️ Not locking - conditions not met:', {
          inactiveDuration: inactiveDuration / 1000 + 's',
          lockTimeout: lockTimeout / 1000 + 's',
          screenLockEnabled,
        });
      }
    }, lockTimeout);
  }, [screenLockEnabled, lockTimeout]);

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    console.log(
      '👆 User activity detected, resetting timer',
      '(was inactive for',
      timeSinceLastActivity / 1000 + 's)',
    );
    lastActivityRef.current = now;
    startInactivityTimer();
  }, [startInactivityTimer]);

  // Handle AppState changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('📱 AppState changed:', appState.current, '->', nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        const inactiveDuration = Date.now() - lastActivityRef.current;
        console.log(
          '📱 App came to foreground. Was inactive for:',
          inactiveDuration / 1000 + 's',
        );

        if (screenLockEnabled && inactiveDuration >= lockTimeout) {
          console.log('🔒 Locking app due to background inactivity');
          setIsLocked(true);
        } else {
          // Reset timer when app comes to foreground
          resetActivityTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        console.log('📱 App went to background');
        lastActivityRef.current = Date.now();

        // Clear timer when app goes to background
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [screenLockEnabled, lockTimeout]);

  // Start inactivity timer when settings change or app is ready
  useEffect(() => {
    console.log('🔄 Timer effect triggered:', {
      screenLockEnabled,
      isLoading,
      isLocked,
      lockTimeout: lockTimeout / 1000 + 's',
    });

    if (screenLockEnabled && !isLoading && !isLocked) {
      console.log('✅ Starting inactivity timer now');
      startInactivityTimer();
    } else {
      console.log('❌ Not starting timer:', {
        screenLockEnabled,
        isLoading,
        isLocked,
      });
    }

    return () => {
      if (inactivityTimerRef.current) {
        console.log('🧹 Cleaning up timer');
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [
    screenLockEnabled,
    lockTimeout,
    isLoading,
    isLocked,
    startInactivityTimer,
  ]);

  // Notification setup is now handled by DisguisedNotificationService
  // All foreground, background, and notification opened handlers are managed there

  useEffect(() => {
    // Navigate to the main screen after 1 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);

      Orientation.lockToPortrait();

      return () => {
        Orientation.unlockAllOrientations();
      };
    }, 1000);

    // Clear the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  // Initialize presence tracking when app is ready
  useEffect(() => {
    if (!isLoading) {
      console.log('🚀 App ready, initializing presence tracking');
      presenceTracker.initialize();
    }

    return () => {
      // Cleanup presence tracking when app unmounts
      presenceTracker.cleanup();
    };
  }, [isLoading]);

  // Handle unlock
  const handleUnlock = () => {
    console.log('🔓 App unlocked');
    setIsLocked(false);
    resetActivityTimer();
  };

  // Create PanResponder to capture all touches
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetActivityTimer();
        return false; // Don't capture the touch, let it pass through
      },
      onMoveShouldSetPanResponder: () => {
        resetActivityTimer();
        return false; // Don't capture the touch, let it pass through
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
    }),
  ).current;

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  // Show lock screen if locked
  if (isLocked) {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <PasswordScreen onUnlock={handleUnlock} isLockScreen={true} />
        </PersistGate>
      </Provider>
    );
  }

  // Main app with inactivity tracking
  return (
    <View style={{flex: 1}} {...panResponder.panHandlers}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <Routes />
          <FlashMessage
            animated
            position={'top'}
            statusBarHeight={
              Platform?.OS === 'android' ? height / 16 : height / 20
            }
          />
        </PersistGate>
      </Provider>
    </View>
  );
};

export default App;
