import React, {useState, useContext, useEffect} from "react";
import { NavLink } from 'react-router-dom';
import "./create-new-user.scss";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Button, Container, Spinner } from "react-bootstrap";
import Input from "../../components/input/input";
// import validate from "../../validation-rules/create-new-user-validation-rules";
// import useForm from "../../custom-hooks/form-validation";
import useForm from "../form-logic/user-form-logic";

import AuthContext from '../../context/auth/authContext';
import UserContext from '../../context/user/userContext';

function CreateNewUser(props) {
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);

  const { error, success, loading } = userContext;

  const initialValues = {
    fname: '',
    lname: '',
    email: '',
    phone: '',
    password: '',
    confirmpassword: ''
  };
  
  const [newData, setData] = useState(initialValues);
  
  const handleChangeInput = (e) => {
    setData({
      ...newData,
      [e.target.name]: e.target.value
    });
  }

  const createNewUser = async () => {
    console.log("No errors, submit callback called!");
    console.log(values);
    authContext.refreshSpinnerLoading(true);
    setData(values);
    // userContext.toggle_loader(true);
    const user_save = await userContext.save_user(values);
    authContext.refreshSpinnerLoading(false);
  }

  const showError = () => {
    if (error) {
      return error.map((err, index) => <p className="error-text" key={index}>{err.msg}</p>)
    }
  }

  const showSuccess = () => {
    if (success) {
      window.setTimeout(() => (props.history.push('/users')), 3000);
      return success.map((err, index) => <p className="error-text" key={index}>{err.msg}</p>)
    }
  }

  const { handleChange, values, touched, handleBlur, validator, handleSubmit } = useForm(
    newData,
    createNewUser,
    handleChangeInput
  );
  
  return (
    <React.Fragment>
      {/* <Header loading={loading} />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part"> */}
            <section className="invoice-wrap">
              <Row>
                <Col md={12}>
                  <div style={{ marginBottom: '20px', float: 'right' }}>
                    <NavLink activeClassName="active" to="/users" style={{ }}>
                      <i className="fa fa-plus-square-o" aria-hidden="true" />
                      <span>Back to users</span>
                    </NavLink>
                  </div>
                </Col>
              </Row>
              {showError()}
              {showSuccess()}
              <form onSubmit={handleSubmit} noValidate>
                <Row>
                  <Col md={6}>
                    <Input
                      type="text"
                      name="fname"
                      value={newData.fname || ''}
                      onChange={handleChange}
                      required={true}
                      label="First Name *"
                    />
                    {validator.message("fname", values.fname, "required|alpha", {messages: {required: 'First name field is required'}})}
                    {touched.fname && validator.errorMessages.fname && (
                      <p className="error-text">{validator.errorMessages.fname}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <Input
                      type="text"
                      name="lname"
                      value={newData.lname || ''}
                      onChange={handleChange}
                      required={true}
                      label="Last Name *"
                    />
                    {validator.message("lname", values.lname, "required|alpha", {messages: {required: 'Last name field is required'}} )}
                    {touched.lname && validator.errorMessages.lname && (
                      <p className="error-text">{validator.errorMessages.lname}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <Input
                      type="email"
                      name="email"
                      value={newData.email || ''}
                      onChange={handleChange}
                      required={true}
                      label="Email *"
                    />
                    {validator.message("email", values.email, "required|email")}
                    {touched.email && validator.errorMessages.email && (
                      <p className="error-text">{validator.errorMessages.email}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <Input
                      type="tel"
                      name="phone"
                      value={newData.phone || ''}
                      onChange={handleChange}
                      label="Phone"
                    />                    
                  </Col>
                  <Col md={6}>
                    <Input
                      type="password"
                      name="password"
                      value={newData.password || ''}
                      onChange={handleChange}
                      required={true}
                      label="Password *"
                    />
                    {validator.message("password", values.password, "required|min:6")}
                    {touched.password && validator.errorMessages.password && (
                      <p className="error-text">{validator.errorMessages.password}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <Input
                      type="password"
                      name="confirmpassword"
                      value={newData.confirmpassword || ''}
                      onChange={handleChange}
                      required={true}
                      label="Confirm Password *"
                    />
                    { validator.message("confirmpassword", values.confirmpassword, `required|min:6|in:${values.password}`, {messages: {required: 'The confirm password field is required', in: 'Passwords need to match!'}} )}
                    {touched.confirmpassword && validator.errorMessages.confirmpassword && (
                      <p className="error-text">{validator.errorMessages.confirmpassword}</p>
                    )}
                  </Col>
                </Row>
                <div className="submit-button-area">
                {
                  !loading ? (
                    <Button variant="danger" type="submit">
                      SUBMIT
                    </Button>
                  ) : (
                    <Button variant="danger" disabled>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Loading...</span>
                    </Button>
                  )
                }
                </div>
              </form>
            </section>
          {/* </Col>
        </Row>
      </Container> */}
    </React.Fragment>
  );
}

export default CreateNewUser;
