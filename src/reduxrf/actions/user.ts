import {Dispatch} from 'redux';
import {UserDetails, userToken} from '../types';
import {STORE_USER_DETAILS, LOGOUT_USER, STORE_USER_TOKEN} from '../constants';

export const storeUserDetails = (data: UserDetails) => (dispatch: Dispatch) => {
  dispatch({
    type: STORE_USER_DETAILS,
    payload: data,
  });
};

export const storeUserToken = (data: userToken) => (dispatch: Dispatch) => {
  dispatch({
    type: STORE_USER_TOKEN,
    payload: data,
  });
};

export const logoutUser = () => (dispatch: Dispatch) => {
  dispatch({
    type: LOGOUT_USER,
  });
};
