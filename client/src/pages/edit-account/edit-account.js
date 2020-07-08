import React, { useState, useContext } from "react";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Button, Container } from "react-bootstrap";
import Input from "../../components/input/input";

import EditAccountForm from './edit-account-form';

import AuthContext from '../../context/auth/authContext';

function EditAccount() {
  const authContext = useContext(AuthContext);
  const { error, user } = authContext;

  const showForm = () => {
    return (<EditAccountForm />);
  }

  return (
    <React.Fragment>
      {/* <Header />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part"> */}
            { user && showForm() }
          {/* </Col>
        </Row>
      </Container> */}
    </React.Fragment>
  );
}

export default EditAccount;
