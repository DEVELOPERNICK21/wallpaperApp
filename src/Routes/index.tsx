import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import AuthNavigation from './AuthNavigation';
import AppRoutes from './AppRoutes'; // Or MemberNavigator, as in your previous examples
import {useSelector} from 'react-redux';
import {RootState} from '../redux/reducers';
import {PasswordScreen, SplashScreen} from '../screens';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WallpaperStack from './WallpaperStack';

const Index = () => {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordScreen, setShowPasswordScreen] = useState(true);
  const [screenToShow, setScreenToShow] = useState(null); // Determines which screen to show

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
    await AsyncStorage.removeItem('lastActiveTime'); // Clear previous session data
    setShowPasswordScreen(true);
    setScreenToShow(null);
  };

  const handleUnlock = async screen => {
    setShowPasswordScreen(false);
    setScreenToShow(screen);
    await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
  };

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
