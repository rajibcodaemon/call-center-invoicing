function validate(values) {
  let errors = {};
  if (!values.email) {
    errors.email = "Email address is required";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
      values.email.toLowerCase()
    )
  ) {
    errors.email = "Email address is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 5) {
    errors.password = "Password must be 6 or more characters";
  }

  return errors;
}

export default validate;
