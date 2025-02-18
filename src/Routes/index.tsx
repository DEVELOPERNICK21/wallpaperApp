import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {AppState} from 'react-native';
import AuthNavigation from './AuthNavigation';
import AppRoutes from './AppRoutes';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/reducers';
import {PasswordScreen, SplashScreen} from '../screens';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WallpaperStack from './WallpaperStack';

const LOCK_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

const Index = () => {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordScreen, setShowPasswordScreen] = useState(true);
  const [screenToShow, setScreenToShow] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  let lockTimer = null;

  useEffect(() => {
    resetPasswordScreenOnLaunch();
  }, []);

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(authInstance, user => {
      setUser(user);
      console.log(user, 'USER');
      if (initializing) {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  // Ensures password screen always appears after relaunching the app
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

  // Start tracking app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // Lock the app immediately when moved to background
        setShowPasswordScreen(true);
      } else if (appState === 'background' && nextAppState === 'active') {
        // If returning from background, check inactivity
        checkInactivity();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [appState]);

  // Check if the app was inactive for more than 2 minutes
  const checkInactivity = async () => {
    const lastActiveTime = await AsyncStorage.getItem('lastActiveTime');
    if (lastActiveTime) {
      const elapsedTime = Date.now() - parseInt(lastActiveTime, 10);
      if (elapsedTime >= LOCK_TIMEOUT) {
        setShowPasswordScreen(true);
      }
    }
  };

  // Restart the inactivity timer when user is active
  const resetLockTimer = () => {
    if (lockTimer) clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {
      setShowPasswordScreen(true);
    }, LOCK_TIMEOUT);
  };

  // Reset the lock timer whenever the user interacts with the app
  useEffect(() => {
    resetLockTimer();
    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
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
  );
};

export default Index;
