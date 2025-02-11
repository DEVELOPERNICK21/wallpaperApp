import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import AuthNavigation from './AuthNavigation';
import AppRoutes from './AppRoutes'; // Or MemberNavigator, as in your previous examples
import {useSelector} from 'react-redux';
import {RootState} from '../redux/reducers';
import {SplashScreen} from '../screens';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';

const Index = () => {
  const [initializing, setInitializing] = useState(false);
  const [user, setUser] = useState(null);

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

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppRoutes /> : <AuthNavigation />}
    </NavigationContainer>
  );
};

export default Index;
