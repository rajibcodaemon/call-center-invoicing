import React, {useContext, useEffect} from 'react';
import {Route, Redirect} from 'react-router-dom';

import setAuthToken from '../utils/setAuthToken';
import AuthContext from '../context/auth/authContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const authContext = useContext(AuthContext);
  const {isAuthenticated, keepLoggedIn, loading, loadUser} = authContext;
  const token = localStorage.getItem('xtoken');

  useEffect(() => {
    console.log('Private route useEffect()');    
    // setAuthToken(token);
    loadUser();
  }, []);
  
  return (
    <Route 
      { ...rest } 
      render={props => !keepLoggedIn /*|| !isAuthenticated || (token === undefined || token === null)*/ ? (
        <Redirect to={{
          pathname: '/',
          state: { from: props.location }
        }} />
      ) : (
        <Component {...props} />
      )}
    />
  );
};

export default PrivateRoute;