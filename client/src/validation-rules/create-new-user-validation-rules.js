function validate(values) {
  let errors = {};

  if (!values.email) {
    errors.email = "Email address is required";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
      values.email.toLowerCase()
    )
  ) {
    errors.email = "Invalid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be 6 or more characters";
  }

  if (!values.confirmpassword) {
    errors.confirmpassword = "Confirm password is required";
  } else if (values.confirmpassword.length < 6) {
    errors.confirmpassword = "Confirm password must be 6 or more characters";
  } else if (values.password !== values.confirmpassword) {
    errors.confirmpassword = "Password did not match";
  }

  if (!values.fname) {
    errors.fname = "First name is required";
  } else if (!/^[a-zA-Z]+$/.test(values.fname.toLowerCase())) {
    errors.fname = "Only letters allowed";
  }

  if (!values.lname) {
    errors.lname = "Last name is required";
  } else if (!/^[a-zA-Z]+$/.test(values.lname.toLowerCase())) {
    errors.lname = "Only letters allowed";
  }

  if (values.phone) {
    if (!/^\+(?:[0-9] ?){6,14}[0-9]$/.test(values.phone)) {
      errors.phone = "Invalid phone number";
    }
  }

  return errors;
}

export default validate;
