import React, { useEffect } from "react";
import "./input.scss";

function Input(props) {
  useEffect(() => {
    let inputField = document.getElementById(props.name);
    let inputValue = inputField.value.trim();
    inputValue
      ? inputField.setAttribute("filled", "true")
      : inputField.setAttribute("filled", "false");
  });
  return (
    <div className="form-group">
      <input
        type={props.type}
        name={props.name}
        id={props.name}
        className="float-input"
        value={props.value}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        onKeyPress={props.onKeyPress}
        onBlur={props.onBlur}
        readOnly={props.readOnly}
        required={props.required}
        disabled={props.disabled}
      />
      <label htmlFor={props.name}>{props.label}</label>
    </div>
  );
}

export default Input;
