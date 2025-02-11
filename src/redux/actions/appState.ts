import {Dispatch} from 'redux';
import {appStateType} from '../types';
import {IS_FIRST_LAUNCH} from '../constants';

export const storeAppLaunchState =
  (data: appStateType) => (dispatch: Dispatch) => {
    dispatch({
      type: IS_FIRST_LAUNCH,
      payload: data,
    });
    console.log(data, 'COMES STATE DATA FOR APP');
  };
