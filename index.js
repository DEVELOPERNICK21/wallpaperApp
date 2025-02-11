/**
 * @format
 */

import {AppRegistry, LogBox, Text} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);
