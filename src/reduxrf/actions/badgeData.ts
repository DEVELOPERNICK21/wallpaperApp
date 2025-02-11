import { Dispatch } from 'redux';
import { BadgeData,   } from '../types';
import {  LOGOUT_USER, STORE_BADGE_DETAILS, STORE_BADGE_DETAILS_OFFLINE, TOTAL_SCAN_COUNT, UNSYNC_SCAN_COUNT } from '../constants';

export const storeBadgeDetails = (data: BadgeData) => (dispatch: Dispatch) => {
  dispatch({
    type: STORE_BADGE_DETAILS,
    payload: data,
  });
};

export const storeBadgeDetailsOffline = (data: BadgeData) => (dispatch: Dispatch) => {
  dispatch({
    type: STORE_BADGE_DETAILS_OFFLINE,
    payload: data,
  });
};


export const totalCountOfScan = (data: number) => (dispatch: Dispatch) => {
  dispatch({
    type: TOTAL_SCAN_COUNT,
    payload: data,
  });
};

export const unSyncCountOfScan = (data: number) => (dispatch: Dispatch) => {
  dispatch({
    type: UNSYNC_SCAN_COUNT,
    payload: data,
  });
};


export const logoutUser = () => (dispatch: Dispatch) => {
  dispatch({
    type: LOGOUT_USER,
  });
};

