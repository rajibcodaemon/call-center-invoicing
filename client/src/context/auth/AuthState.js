import React, { useReducer } from 'react';
import axios from 'axios';

import setAuthToken from '../../utils/setAuthToken';

import {
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  USER_LOADED,
  USER_PASSWORD,
  SERVER_URL,
  USER_ERROR,
  FORGET_PASSWORD,
  SIDEBAR_COLS,
  SPINNER_LOADING
} from '../Types';

import AuthContext from './authContext';
import AuthReducer from './authReducer';

const AuthState = (props) => {
  const initialState = {
    token: localStorage.getItem('xtoken'),
    isAuthenticated: (localStorage.getItem('xtoken') ? true : false),
    keepLoggedIn: (sessionStorage.getItem('keepLoggedIn') ? true : false),
    user: null,
    error: null,
    success: null,
    sidebarLeftCol: 1,
    sidebarRightCol: 11,
    topSpinner: false
  };

  const SERVER = SERVER_URL;

  const [state, dispatch] = useReducer(AuthReducer, initialState);

  // Load user
  const loadUser = async () => {
    // @todo load token into global header
    if (localStorage.getItem('xtoken')) {      
      setAuthToken(localStorage.getItem('xtoken'));
      try {
        const res = await axios.get(`${SERVER}/api/auth`);
        dispatch({
          type: USER_LOADED,
          payload: res.data
        });
      } catch (error) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response.data.errors
        });
      }
    } else {
      console.log('Token not found!');
      dispatch({
        type: AUTH_ERROR,
        payload: null
      });
    }    
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    try {
      const response = await axios.post(`${SERVER}/api/auth`, formData, config);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: response.data
      });
      loadUser();
    } catch (error) {
      console.log('Login state error');
      dispatch({
        type: LOGIN_FAIL,
        payload: error.response.data.errors
      });
    }
  }

  // Forget password
  const forget_password = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
        
    try {
      const response = await axios.post(`${SERVER}/api/auth/forget-password`, formData, config);
      dispatch({
        type: FORGET_PASSWORD,
        payload: response.data
      });
    } catch (error) {
      console.log('Login state error');
      dispatch({
        type: LOGIN_FAIL,
        payload: error.response.data.errors
      });
    }
  }
  
  // Toggle collapse menu
  const collapseMenuCol = (collapse_status) => {
    let newCols = {};

    if (collapse_status) {
      newCols = {
        left: 1,
        right: 11
      };
    } else {
      newCols = {
        left: 3,
        right: 9
      };
    }

    dispatch({
      type: SIDEBAR_COLS,
      payload: newCols
    });
  }

  // Refresh spinner loading
  const refreshSpinnerLoading = (spinner_status) => {
    dispatch({
      type: SPINNER_LOADING,
      payload: spinner_status
    });
  }
  
  // Logout user
  const logout = () => dispatch({ type: LOGOUT });

  return <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        keepLoggedIn: state.keepLoggedIn,
        user: state.user,
        error: state.error,
        success: state.success,
        sidebarLeftCol: state.sidebarLeftCol,
        sidebarRightCol: state.sidebarRightCol,
        topSpinner: state.topSpinner,
        login,
        logout,
        loadUser,
        forget_password,
        collapseMenuCol,
        refreshSpinnerLoading
      }}
    >
      {props.children}
    </AuthContext.Provider>
};

export default AuthState;