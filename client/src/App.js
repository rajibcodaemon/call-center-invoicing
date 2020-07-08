import React from "react";
import { Beforeunload } from 'react-beforeunload';
import "./App.scss";

import AuthState from './context/auth/AuthState';
import UserState from './context/user/UserState';
import InvoiceState from './context/invoice/InvoiceState';

import Main from './Main';

// /**
// @Name App
// <p>Bootstrap function</p>
// @author: Aninda
// @params: None
// @return: JSX
// @since
// @createdDate: 20-08-2019
// @modifiedBy: Aninda
// <p>Moved the router to different component </p>
// @modifiedDate: 15-09-2019
// @link
// **/

const App = () => {  
  return (
    <Beforeunload onBeforeunload={ () => console.log('Browser closed or refreshed') }>
      <AuthState>
        <UserState>
          <InvoiceState>          
            <Main />
          </InvoiceState>
        </UserState>
      </AuthState>
    </Beforeunload>
  );
}

export default App;
