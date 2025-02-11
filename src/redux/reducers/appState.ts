import {AnyAction} from 'redux';
import {IS_FIRST_LAUNCH} from '../constants';
import {appStateType} from '../types';

interface AppState {
  isFirstLaunch: appStateType | null;
}

const initialState: AppState = {
  isFirstLaunch: null,
};

const appStateReducer = (state = initialState, action: AnyAction): AppState => {
  switch (action.type) {
    case IS_FIRST_LAUNCH:
      return {...state, isFirstLaunch: action.payload};
    default:
      return state;
  }
};

export default appStateReducer;
