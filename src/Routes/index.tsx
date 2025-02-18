import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  AppState,
  TouchableWithoutFeedback,
  View,
  InteractionManager,
} from 'react-native';
import AuthNavigation from './AuthNavigation';
import AppRoutes from './AppRoutes';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WallpaperStack from './WallpaperStack';
import {PasswordScreen, SplashScreen} from '../screens';

const LOCK_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const Index = () => {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordScreen, setShowPasswordScreen] = useState(true);
  const [screenToShow, setScreenToShow] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  const lockTimerRef = useRef(null);

  useEffect(() => {
    resetPasswordScreenOnLaunch();
  }, []);

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, user => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  // Ensures password screen appears on relaunch
  const resetPasswordScreenOnLaunch = async () => {
    await AsyncStorage.removeItem('lastActiveTime');
    setShowPasswordScreen(true);
    setScreenToShow(null);
  };

  const handleUnlock = async screen => {
    setShowPasswordScreen(false);
    setScreenToShow(screen);
    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
    resetLockTimer();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // If app goes to background, store last active time
        setShowPasswordScreen(true);
      } else if (appState === 'background' && nextAppState === 'active') {
        // On returning, check inactivity
        checkInactivity();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
      clearTimeout(lockTimerRef.current);
    };
  }, [appState]);

  // Check if inactive for more than 2 minutes
  const checkInactivity = async () => {
    const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
    if (lastActiveTime) {
      const elapsedTime = Date.now() - parseInt(lastActiveTime, 10);
      if (elapsedTime >= LOCK_TIMEOUT) {
        setShowPasswordScreen(true);
      }
    }
  };

  // Reset lock timer on activity
  const resetLockTimer = () => {
    clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setShowPasswordScreen(true);
    }, LOCK_TIMEOUT);
  };

  // Detect user activity (touches, scrolling, typing, etc.)
  const handleUserActivity = async () => {
    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
    resetLockTimer();
  };

  useEffect(() => {
    resetLockTimer();
    return () => clearTimeout(lockTimerRef.current);
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <TouchableWithoutFeedback onPress={handleUserActivity}>
      <View style={{flex: 1}} onLayout={handleUserActivity}>
        <NavigationContainer>
          {showPasswordScreen ? (
            <PasswordScreen onUnlock={handleUnlock} />
          ) : screenToShow === 'chat' ? (
            user ? (
              <AppRoutes />
            ) : (
              <AuthNavigation />
            )
          ) : (
            <WallpaperStack />
          )}
        </NavigationContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Index;
