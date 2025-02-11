import dispatchTypes from '../constants';
let initialState = {
  user: null,
};
export default (state = initialState, action) => {
  switch (action.type) {
    case dispatchTypes.STORE_USER_DETAILS:
      return {...state, user: action.payload};
    case dispatchTypes.LOGOUT_USER:
      return {...state, user: null};
    default:
      return state;
  }
};
