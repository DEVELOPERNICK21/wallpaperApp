/* eslint-disable prettier/prettier */
import {combineReducers} from 'redux';
import users from './users';
import themeReducer from './theme';
import appStateReducer from './appState';

const rootReducer = combineReducers({
  userDetails: users,
  theme: themeReducer,
  appStateInfo: appStateReducer,
});
export default rootReducer;
