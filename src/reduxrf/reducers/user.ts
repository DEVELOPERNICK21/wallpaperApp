import { AnyAction } from 'redux';
import { STORE_USER_DETAILS, LOGOUT_USER, STORE_USER_TOKEN } from '../constants';
import { UserDetails, userToken } from '../types';

interface UserState {
  user: UserDetails | null;
  token: userToken | null;
}

const initialState: UserState = {
  user: null,
  token: null,
};

const userReducer = (state = initialState, action: AnyAction): UserState => {
  switch (action.type) {
    case STORE_USER_DETAILS:
      return { ...state, user: action.payload };
    case STORE_USER_TOKEN:
      return { ...state, token: action.payload };
    case LOGOUT_USER:
      return { ...state, user: null, token: null };
    default:
      return state;
  }
};

export default userReducer;
