/**
 * @format
 */

import {AppRegistry, LogBox, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {handleBackgroundMessage} from './src/services/DisguisedNotificationService';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
LogBox.ignoreAllLogs();

// Set up background message handler with disguised notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification received:', remoteMessage);

  // Use disguised notification service
  await handleBackgroundMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
