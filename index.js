/**
 * @format
 */

import {AppRegistry, LogBox, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
LogBox.ignoreAllLogs();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification received:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
