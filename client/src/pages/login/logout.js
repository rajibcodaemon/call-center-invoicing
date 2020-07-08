import React, { useContext, useEffect } from 'react';

import AuthContext from '../../context/auth/authContext';

const Logout = (props) => {
  const authContext = useContext(AuthContext);
  const { logout } = authContext;

  useEffect(() => {
    logout();
  }, []);

  return (
    <div></div>
  );
}

export default Logout;