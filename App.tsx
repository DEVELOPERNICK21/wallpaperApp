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

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

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
