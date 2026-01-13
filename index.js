/**
 * @format
 */

import 'react-native-url-polyfill/auto';
import {AppRegistry, LogBox} from 'react-native';
import App from './App';

// Disable yellow warning boxes in production
LogBox.ignoreAllLogs(true);

// EAS development builds usan "main" como nombre de registro
AppRegistry.registerComponent('main', () => App);
