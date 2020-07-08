import React, { useReducer, useContext } from 'react';
import axios from 'axios';

import {
  USER_LIST,
  USERS_CLEAR,
  USER_CLEAR,
  USER_ERROR,
  SERVER_URL,
  USER_PERPAGE,
  USER_FETCHPAGE,
  USER_SEARCHTERM,
  USER_SORTORDER,
  USER_SAVE,
  CLEAR_SUCCESS,
  CLEAR_ERROR,
  USER_INFO,
  USER_UPDATE,
  USER_STATUS,
  USER_PASSWORD,
  USER_LOADING
} from '../Types';
import UserContext from './userContext';
import UserReducer from './userReducer';

const UserState = (props) => {
  const initialState = {
    users: [],
    csv_data: null,
    user: {
      first_name: '',
      last_name: '',
      email_id: '',
      contact_no: '',
      password: '',
      confirmpassword: ''
    },
    sort_by: 'first_name',
    sort_order: 'ASC',
    search_term: '',
    fetch_page: 1,
    per_page: 10,
    total_page: 0,
    error: null,
    success: null,
    loading: false
  };

  const [state, dispatch] = useReducer(UserReducer, initialState);

  const get_users = async (fetch_page, per_page, sort_by, sort_order, search_term) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      sort_by,
      sort_order,
      search_term,
      fetch_page,
      per_page
    };

    try {
      const response = await axios.post(`${SERVER_URL}/api/users`, formData, config);
      console.log('User list response');
      console.log(response);
      dispatch({
        type: USER_LIST,
        payload: response.data
      });
    } catch (error) {
      console.log('User list error');
      console.log(error);
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const save_user = async (values) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      first_name: values.fname,
      last_name: values.lname,
      email: values.email,
      phone: values.phone,
      user_role: 2,
      password: values.password,
    };

    try {
      const response = await axios.post(`${SERVER_URL}/api/users/create`, formData, config);
      console.log('User save response');
      console.log(response);
      dispatch({
        type: USER_SAVE,
        payload: response.data
      });
    } catch (error) {
      console.log('User save error');
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const update_user = async (values) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      first_name: values.fname,
      last_name: values.lname,
      email: values.email,
      phone: values.phone,
      user_role: values.user_role
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/users/update-user/${values.id}`, formData, config);
      console.log('User save response');
      console.log(response);
      dispatch({
        type: USER_UPDATE,
        payload: response.data
      });
    } catch (error) {
      console.log('User save error');
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const update_status = async (values) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      id: values.id,
      status: values.status
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/users/${values.id}`, formData, config);
      console.log('User status response');
      console.log(response);
      dispatch({
        type: USER_STATUS,
        payload: response.data
      });
    } catch (error) {
      console.log('User status error');
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const info_user = async (user_id) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {};

    try {
      const response = await axios.get(`${SERVER_URL}/api/users/profile/${user_id}`, formData, config);
      console.log('User info response');
      console.log(response);
      dispatch({
        type: USER_INFO,
        payload: response.data
      });
    } catch (error) {
      console.log('User info error');
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  // Update user password
  const update_password = async (values) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { id, password } = values;
    const formData = {
      id,
      password
    }

    try {
      const response = await axios.put(`${SERVER_URL}/api/users/${id}`, formData, config);
      console.log('User password response');
      console.log(response);
      dispatch({
        type: USER_PASSWORD,
        payload: response.data
      });      
    } catch (error) {
      console.log('User password error');
      dispatch({
        type: USER_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const clear_user_list = () => {
    dispatch({
      type: USERS_CLEAR
    });
  }

  const clear_user = () => {
    dispatch({
      type: USER_CLEAR
    });
  }

  const update_per_page = (value) => {
    dispatch({
      type: USER_PERPAGE,
      payload: value
    });
  }

  const update_fetch_page = (value) => {
    dispatch({
      type: USER_FETCHPAGE,
      payload: value
    });
  }

  const update_search_terms = (value) => {
    dispatch({
      type: USER_SEARCHTERM,
      payload: value
    });
  }

  const update_sort_order = (value) => {
    dispatch({
      type: USER_SORTORDER,
      payload: value
    });
  }

  const clear_success = () => dispatch({ type: CLEAR_SUCCESS });

  const clear_error = () => dispatch({ type: CLEAR_ERROR });

  const toggle_loader = (value) => {
    dispatch({
      type: USER_LOADING,
      payload: value
    });
  }

  return <UserContext.Provider
    value={{
      users: state.users,
      csv_data: state.csv_data,
      user: state.user,
      sort_by: state.sort_by,
      sort_order: state.sort_order,
      search_term: state.search_term,
      fetch_page: state.fetch_page,
      per_page: state.per_page,
      total_page: state.total_page,
      error: state.error,
      success: state.success,
      loading: state.loading,
      get_users,
      clear_user_list,
      clear_user,
      update_per_page,
      update_fetch_page,
      update_search_terms,
      update_sort_order,
      save_user,
      clear_success,
      clear_error,
      info_user,
      update_user,
      update_status,
      update_password,
      toggle_loader
    }}
  >
    { props.children }
  </UserContext.Provider>
};

export default UserState;