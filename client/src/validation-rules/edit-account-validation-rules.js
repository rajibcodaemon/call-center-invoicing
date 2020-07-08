function validate(values) {
  let errors = {};

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be 6 or more characters";
  }

  if (!values.confirmpassword) {
    errors.confirmpassword = "Confirm Password is required";
  } else if (values.password.length < 6) {
    errors.confirmpassword = "Confirm Password must be 6 or more characters";
  } else if (values.password > 5 && values.confirmpassword > 5 && values.password !== values.confirmpassword) {
    errors.confirmpassword = "Password not matched";
  }

  return errors;
}

export default validate;
