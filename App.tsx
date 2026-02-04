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
        // Screen lock settings loaded
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
      // Timer disabled or immediate mode
      return;
    }

    const startTime = Date.now();
    // Starting inactivity timer

    // Start new timer
    inactivityTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const actualWaitTime = now - startTime;
      const inactiveDuration = now - lastActivityRef.current;

      if (inactiveDuration >= lockTimeout && screenLockEnabled) {
        setIsLocked(true);
      }
    }, lockTimeout);
  }, [screenLockEnabled, lockTimeout]);

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    // User activity detected, resetting timer
    lastActivityRef.current = now;
    startInactivityTimer();
  }, [startInactivityTimer]);

  // Handle AppState changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        const inactiveDuration = Date.now() - lastActivityRef.current;

        if (screenLockEnabled && inactiveDuration >= lockTimeout) {
          setIsLocked(true);
        } else {
          // Reset timer when app comes to foreground
          resetActivityTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
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
    if (screenLockEnabled && !isLoading && !isLocked) {
      startInactivityTimer();
    }

    return () => {
      if (inactivityTimerRef.current) {
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
      presenceTracker.initialize();
    }

    return () => {
      // Cleanup presence tracking when app unmounts
      presenceTracker.cleanup();
    };
  }, [isLoading]);

  // Handle unlock
  const handleUnlock = () => {
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
