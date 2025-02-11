import dispatchType from '../constants';

export const storeUserDetails = data => dispatch => {
    dispatch({
        type: dispatchType.STORE_USER_DETAILS,
        payload: data
    })
}

export const setLogOut = () => dispatch => {
    dispatch({
        type: dispatchType.LOGOUT_USER,
        payload: null,
    })
}



