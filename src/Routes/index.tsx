import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  AppState,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import AuthNavigation from './AuthNavigation';
import AppRoutes from './AppRoutes';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WallpaperStack from './WallpaperStack';
import {PasswordScreen, SplashScreen} from '../screens';
import {resetChatAccessRequest} from '../redux/actions/appState';

const LOCK_TIMEOUT = 3 * 60 * 1000; // 2 minutes

const Index = () => {
  const dispatch = useDispatch();
  const requestChatAccessFromRedux = useSelector(
    (state: {appStateInfo: {requestChatAccess?: boolean}}) =>
      state.appStateInfo?.requestChatAccess ?? false,
  );
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordScreen, setShowPasswordScreen] = useState(true);
  const [screenToShow, setScreenToShow] = useState<string | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);

  const lockTimerRef = useRef(null);
  const unlockForChatOnly =
    screenToShow === 'wallpaper' && requestChatAccessFromRedux;

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
    // Check if we should skip password for wallpaper mode
    const skipPasswordForWallpaper = await AsyncStorage.getItem(
      'skipPasswordForWallpaper',
    );
    if (skipPasswordForWallpaper === 'true') {
      // Skip password screen and go directly to wallpaper
      setShowPasswordScreen(false);
      setScreenToShow('wallpaper');
    } else {
      setShowPasswordScreen(true);
      setScreenToShow(null);
    }
  };

  const handleUnlock = async (screen: string | null) => {
    setShowPasswordScreen(false);
    dispatch(resetChatAccessRequest());

    // When requesting chat from wallpaper: second password or cancel = stay on wallpaper
    if (unlockForChatOnly && screen === 'wallpaper') {
      return;
    }

    if (screen !== null) {
      setScreenToShow(screen);
    }

    // If unlocking to wallpaper mode, set flag to skip password in future
    if (screen === 'wallpaper') {
      await AsyncStorage.setItem('skipPasswordForWallpaper', 'true');
    } else {
      // Remove flag if going to chat mode
      await AsyncStorage.removeItem('skipPasswordForWallpaper');
    }

    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
    resetLockTimer();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // If app goes to background, store last active time
        // Only show password screen if not in wallpaper mode
        if (screenToShow !== 'wallpaper') {
          setShowPasswordScreen(true);
        }
      } else if (appState === 'background' && nextAppState === 'active') {
        // On returning, check inactivity
        // Skip password check if in wallpaper mode
        if (screenToShow !== 'wallpaper') {
          checkInactivity();
        }
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
      clearTimeout(lockTimerRef.current);
    };
  }, [appState, screenToShow]);

  // Check if inactive for more than 2 minutes
  const checkInactivity = async () => {
    // Skip password check if in wallpaper mode
    if (screenToShow === 'wallpaper') {
      return;
    }
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
    // Don't set lock timer if in wallpaper mode
    if (screenToShow !== 'wallpaper') {
      lockTimerRef.current = setTimeout(() => {
        setShowPasswordScreen(true);
      }, LOCK_TIMEOUT);
    }
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

  // Wallpaper: show password only on long-press (hidden chat). Chat/null: show password when locked.
  const showPassword =
    (screenToShow === 'wallpaper' && requestChatAccessFromRedux) ||
    (screenToShow !== 'wallpaper' && showPasswordScreen);

  return (
    <TouchableWithoutFeedback onPress={handleUserActivity}>
      <View style={{flex: 1}} onLayout={handleUserActivity}>
        <NavigationContainer>
          {showPassword ? (
            <PasswordScreen
              onUnlock={handleUnlock}
              unlockMode={unlockForChatOnly ? 'chatOnly' : undefined}
            />
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
