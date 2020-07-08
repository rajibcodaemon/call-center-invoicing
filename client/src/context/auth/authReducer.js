import {
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  USER_LOADED,
  FORGET_PASSWORD,
  SIDEBAR_COLS,
  SPINNER_LOADING
} from '../Types';

export default (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: true,
        user: action.payload.data.user
      };
    case LOGIN_SUCCESS:
      localStorage.setItem('xtoken', action.payload.data.user.token);
      sessionStorage.setItem('keepLoggedIn', true);
      return {
        ...state,
        token: action.payload.data.user.token,
        isAuthenticated: true,
        keepLoggedIn: true,
        error: null
      };
    case LOGOUT:
    case LOGIN_FAIL:
    case AUTH_ERROR:
      localStorage.removeItem('xtoken');
      sessionStorage.removeItem('keepLoggedIn', true);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        keepLoggedIn: false,
        loading: true,
        user: null,
        error: 'Invalid login credentials'
      };
    // case AUTH_ERROR:
    //   return {
    //     ...state,
    //     token: null,
    //     isAuthenticated: false,
    //     loading: true,
    //     user: null,
    //     error: action.payload
    //   };
    case FORGET_PASSWORD:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: true,
        user: null,
        error: [{ msg: action.payload.data.msg }]
      }
    case SIDEBAR_COLS:
      return {
        ...state,
        sidebarLeftCol: action.payload.left,
        sidebarRightCol: action.payload.right
      }
    case SPINNER_LOADING:
      return {
        ...state,
        topSpinner: action.payload
      };
  }
}