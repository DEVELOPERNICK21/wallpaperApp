/**
 * @format
 */

// IMPORTANT: Must import this FIRST to provide PRNG (Pseudo-Random Number Generator) for crypto libraries
// This is required for tweetnacl and other crypto libraries to work in React Native
import 'react-native-get-random-values';

// Suppress React Native Firebase v22 migration deprecation warnings
// These warnings are informational - the namespaced API still works in v21
// Will migrate to v22 modular API in a future update
if (typeof globalThis !== 'undefined') {
  globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
} else if (typeof global !== 'undefined') {
  global.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
}

import {AppRegistry, LogBox, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {handleBackgroundMessage} from './src/services/DisguisedNotificationService';

// Import headless task for background wallpaper updates
import './src/services/HeadlessTask';

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
