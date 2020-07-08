import { useState } from "react";
import SimpleReactValidator from "simple-react-validator";

const useForm = (initialData, callback, changeCallback) => {
  const makeInitialTouched = obj => {
    for (let key in obj) {
      obj[key] = false;
    }
    return obj;
  };

  const makeSubmitTouched = obj => {
    for (let key in obj) {
      obj[key] = true;
    }
    return obj;
  };

  let initialTouched = { ...initialData };
  let submitTouched = {...initialData};

  const [values, setValues] = useState(initialData);
  const [touched, setTouched] = useState(makeInitialTouched(initialTouched));
  const [validator] = useState(new SimpleReactValidator());

  const handleChange = e => {
    setTouched({
      ...touched,
      [e.target.name]: true
    });
    
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });

    changeCallback(e);
  };

  const handleBlur = e => {
    setTouched({
      ...touched,
      [e.target.name]: true
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setTouched(makeSubmitTouched(submitTouched));

    if (validator.allValid()) {
      callback();
      setValues({...initialData});
      setTouched(makeInitialTouched(initialTouched));
    }
  };

  return {
    handleChange,
    values,
    touched,
    handleBlur,
    validator,
    handleSubmit
  };
};

export default useForm;
