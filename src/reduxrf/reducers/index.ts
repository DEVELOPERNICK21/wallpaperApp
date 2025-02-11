import {combineReducers} from 'redux';
import userReducer from './user';
import themeReducer from './theme';
import badgeReducer from './badgeData';
import appStateReducer from './appState';

const rootReducer = combineReducers({
  userDetails: userReducer,
  theme: themeReducer,
  badgeInfo: badgeReducer,
  appStateInfo: appStateReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
