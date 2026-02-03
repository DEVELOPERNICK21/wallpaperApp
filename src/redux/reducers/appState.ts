import {AnyAction} from 'redux';
import dispatchTypes from '../constants';
import {appStateType} from '../types';

interface AppState {
  isFirstLaunch: appStateType | null;
  /** When true, show password screen for hidden chat access (from wallpaper) */
  requestChatAccess: boolean;
}

const initialState: AppState = {
  isFirstLaunch: null,
  requestChatAccess: false,
};

const appStateReducer = (state = initialState, action: AnyAction): AppState => {
  switch (action.type) {
    case dispatchTypes.IS_FIRST_LAUNCH:
      return {...state, isFirstLaunch: action.payload};
    case 'REQUEST_CHAT_ACCESS':
      return {...state, requestChatAccess: true};
    case 'RESET_CHAT_ACCESS_REQUEST':
      return {...state, requestChatAccess: false};
    default:
      return state;
  }
};

export default appStateReducer;
