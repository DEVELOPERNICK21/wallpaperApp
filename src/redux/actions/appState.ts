import {Dispatch} from 'redux';
import {appStateType} from '../types';
import dispatchTypes from '../constants';

export const storeAppLaunchState =
  (data: appStateType) => (dispatch: Dispatch) => {
    dispatch({
      type: dispatchTypes.IS_FIRST_LAUNCH,
      payload: data,
    });
    console.log(data, 'COMES STATE DATA FOR APP');
  };

/** Trigger password screen for hidden chat access (call from wallpaper screen via hidden gesture) */
export const requestChatAccess = () => (dispatch: Dispatch) => {
  dispatch({type: 'REQUEST_CHAT_ACCESS'});
};

export const resetChatAccessRequest = () => (dispatch: Dispatch) => {
  dispatch({type: 'RESET_CHAT_ACCESS_REQUEST'});
};
