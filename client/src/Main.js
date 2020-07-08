import React, { useContext } from "react";
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";

import setAuthToken from './utils/setAuthToken';

import AuthContext from './context/auth/authContext';

import Header from './components/header/header';
import Sidebar from './components/sidebar/sidebar';

import Login from "./pages/login/login";
import AllPurchaseOrders from "./pages/all-purchase-orders/all-purchase-orders";
import NewPurchaseOrder from "./pages/new-purchase-order/new-purchase-order";
import PurchaseOrder from './pages/new-purchase-order/purchase-order';
import RefundRequest from "./pages/refund-request/refund-request";
import Users from "./pages/users/users";
import CreateNewUser from "./pages/create-new-user/create-new-user";
import InvoiceOverview from "./pages/invoice-overview/invoice-overview";
import ForgotPassword from "./pages/forgot-password/forgot-password";
import EditAccount from "./pages/edit-account/edit-account";
import EditUser from "./pages/edit-user/edit-user";
import Logout from './pages/login/logout';

import PrivateRoute from './routing/PrivateRoute';

if (localStorage.getItem('xtoken')) {
  setAuthToken(localStorage.getItem('xtoken'));
}

// /**
// @Name Main
// <p>Holds the routing table for the app</p>
// @author: Aninda
// @params: None
// @return: JSX
// @since
// @createdDate: 15-09-2019
// @modifiedBy: Aninda
// <p>None</p>
// @modifiedDate: 15-09-2019
// @link: None
// **/
const Main = (props) => {
  const authContext = useContext(AuthContext);
  const { sidebarLeftCol, sidebarRightCol } = authContext;
  /** Intercept any unauthorized request.
  * dispatch logout action accordingly **/
  const UNAUTHORIZED = 401;

  // declare a response interceptor
  axios.interceptors.response.use((response) => {
    // do something with the response data    
    return response;
  }, error => {
    // handle the response error
    console.log('Interceptor error: ', error.response.status);
    if (error.response.status === UNAUTHORIZED) {
      // Logout user
      localStorage.removeItem('xtoken');
      setAuthToken(null);
      authContext.loadUser();
    }
    return Promise.reject(error);
  });

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path={["/all-purchase-orders", "/new-purchase-order", "/refund-request", "/users", "/edit-user/:id", "/edit-account", "/create-new-user", "/invoice-overview/:invoice_id", "/logout"]}>
          <React.Fragment>
            <Header />
            <Container fluid={true} className="content-area">
              <Row className="main-content">
                <Col md={sidebarLeftCol} className="align-self-stretch">
                  <Sidebar />
                </Col>
                <Col md={sidebarRightCol} className="right-part">                
                  <Switch>                                          
                    <PrivateRoute path="/all-purchase-orders" component={AllPurchaseOrders} />
                    <PrivateRoute path="/new-purchase-order" component={PurchaseOrder} />
                    <PrivateRoute path="/refund-request" component={RefundRequest} />
                    <PrivateRoute path="/users" component={Users} />
                    <PrivateRoute path="/edit-user/:id" component={EditUser} />
                    <PrivateRoute path="/edit-account" component={EditAccount} />
                    <PrivateRoute path="/create-new-user" component={CreateNewUser} />
                    <PrivateRoute path="/invoice-overview/:invoice_id" component={InvoiceOverview} />
                    <PrivateRoute path="/logout" component={Logout} />
                  </Switch>
                </Col>
              </Row>
            </Container>
          </React.Fragment>
        </Route>
      </Switch>
    </Router>
  );
}

export default Main;
