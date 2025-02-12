import {AnyAction} from 'redux';
import {STORE_USER_DETAILS, LOGOUT_USER, STORE_USER_TOKEN} from '../constants';
import {ThemeState, UserDetails, userToken} from '../types';
import {darkTheme, lightTheme} from '../../utils/theme';

const initialState: ThemeState = lightTheme;

export const TOGGLE_THEME = 'TOGGLE_THEME';

const themeReducer = (state = initialState, action: any): ThemeState => {
  switch (action.type) {
    case TOGGLE_THEME:
      return state.darkMode ? darkTheme : lightTheme;
    default:
      return state;
  }
};

export default themeReducer;
