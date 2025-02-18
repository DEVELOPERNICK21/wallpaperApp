import React, {useEffect, useState} from 'react';
import {LogBox, Platform} from 'react-native';
import Routes from './src/Routes';
import {SplashScreen} from './src/screens';
import FlashMessage from 'react-native-flash-message';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/redux/store';
import Orientation from 'react-native-orientation-locker';
import {height} from './src/assets/string';
import {requestUserPermission} from './src/utils/NotificatioRequest';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  // useEffect(() => {
  //   requestUserPermission();
  // }, []);

  async function requestNotificationPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log('User has granted notification permissions!');
      } else if (authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('User has granted provisional notification permissions!');
      } else {
        console.log('User has NOT granted notification permissions!');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  }

  useEffect(() => {
    requestNotificationPermission();
    const getToken = async () => {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Send this token to your server to send targeted notifications.
      } else {
        console.log('No FCM Token yet');
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Message received in foreground:', remoteMessage);
      // Handle the notification here - display alert, update UI, etc.
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background:',
        remoteMessage,
      );
      // Handle the notification, navigate to a specific screen, etc.
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }, []);

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

  return isLoading ? (
    <SplashScreen /> // Showig splash screen while loading
  ) : (
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
  );
};

export default App;
