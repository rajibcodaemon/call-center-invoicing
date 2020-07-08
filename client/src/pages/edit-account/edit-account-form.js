import React, {useState, useContext, useEffect} from "react";
import "../create-new-user/create-new-user.scss";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Button, Container } from "react-bootstrap";
import Input from "../../components/input/input";
// import validate from "../../validation-rules/create-new-user-validation-rules";
// import useForm from "../../custom-hooks/form-validation";
import useForm from "../form-logic/user-form-logic";

import UserContext from '../../context/user/userContext';
import AuthContext from '../../context/auth/authContext';

function EditAccountForm(props) {
  const userContext = useContext(UserContext);
  const authContext = useContext(AuthContext);

  const { error, success } = userContext;
  const { user } = authContext;

  let initialValues = {
      fname: user.first_name,
      lname: user.last_name,
      email: user.email_id,
      phone: user.contact_no,
      id: user.id,
      user_role: user.role_id,
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

  const createNewUser = () => {
    console.log("No errors, submit callback called!");
    console.log(values);
    setData(values);
    userContext.update_password(values);
  }

  const showError = () => {
    if (error) {
      return error.map((err, index) => <p className="error-text" key={index}>{err.msg}</p>)
    }
  }

  const showSuccess = () => {
    if (success) {      
      return success.map((err, index) => <p className="error-text" key={index}>{err.msg}</p>)
    }
  }

  const { handleChange, values, touched, handleBlur, validator, handleSubmit } = useForm(
    newData,
    createNewUser,
    handleChangeInput
  );

  const showForm = () => {
      return (
        <section className="invoice-wrap">
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
                  disabled={true}
                  label="First Name *"
                />
                {validator.message("fname", newData.fname, "required|alpha", {messages: {required: 'First name field is required'}})}
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
                  disabled={true}
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
                  disabled={true}
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
                  disabled={true}
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
                {validator.message("confirmpassword", values.confirmpassword, `required|min:6|in:${values.password}`, {messages: {required: 'The confirm password field is required', in: 'Passwords need to match!'}} )}
                {touched.confirmpassword && validator.errorMessages.confirmpassword && (
                  <p className="error-text">{validator.errorMessages.confirmpassword}</p>
                )}
              </Col>
            </Row>
            <div className="submit-button-area">
              <Button variant="danger" type="submit">
                SUBMIT
              </Button>
            </div>
          </form>
        </section>
      );   
  }

  useEffect(() => {
    console.log('Edit account use effect');
  }, []);  
  
  return (
    <React.Fragment>
      { showForm() }          
    </React.Fragment>
  );
}

export default EditAccountForm;
