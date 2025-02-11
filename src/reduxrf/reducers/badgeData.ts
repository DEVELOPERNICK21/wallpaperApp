import { AnyAction } from 'redux';
import { LOGOUT_USER, STORE_BADGE_DETAILS, STORE_BADGE_DETAILS_OFFLINE, TOTAL_SCAN_COUNT, UNSYNC_SCAN_COUNT } from '../constants';
import { BadgeData  } from '../types';

interface badgeState {
  badgeInformation: BadgeData[];
  badgeInformationOffline: BadgeData[];
  totalCount: number;
  unsyncCount: number;
}

const initialState: badgeState = {
  badgeInformation: [],
  badgeInformationOffline: [],
  totalCount: 0,
  unsyncCount: 0,
};

const badgeReducer = (state = initialState, action: AnyAction): badgeState => {
  switch (action.type) {
    case STORE_BADGE_DETAILS:
      // return {
      //   ...state,
      //   badgeInformation: [...state.badgeInformation, action.payload], // Append new badge data to the existing array
      // };
      return { ...state, badgeInformation:  action.payload };
      case STORE_BADGE_DETAILS_OFFLINE:
        // return {
        //   ...state,
        //   badgeInformationOffline: [...state.badgeInformationOffline, action.payload], // Append new badge data to the existing for offline array
        // };
        return { ...state, badgeInformationOffline:  action.payload };
      case TOTAL_SCAN_COUNT:
        return { ...state, totalCount: typeof action.payload === 'number' ? action.payload : state.totalCount };
      
      case UNSYNC_SCAN_COUNT:
        return { ...state, unsyncCount: typeof action.payload === 'number' ? action.payload : state.unsyncCount };
      
      case LOGOUT_USER:
        return initialState;
    default:
      return state;
  }
};

export default badgeReducer;
