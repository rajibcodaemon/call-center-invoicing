import React, { useEffect } from "react";
import "./select-option.scss";

function SelectOption(props) {
  useEffect(() => {
    let selectField = document.getElementById(props.name);
    let selectFieldValue = selectField.value.trim();

    // checking the default value and add filled attribute to the select field
    selectFieldValue.indexOf("*") === -1 ? selectField.setAttribute("filled", "true") : selectField.setAttribute("filled", "false");
  });

  const toProperCase = str => {
    return str.replace(/\w\S*/g, txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <div className="form-group">
      <select
        className="custom-select"
        name={props.name}
        id={props.name}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
      >
        <option value={toProperCase(props.label)} hidden>{props.label}</option>
        {props.options.map((option, index) => {
          return (
            <option key={index} value={toProperCase(option)}>
              {toProperCase(option)}
            </option>
          );
        })}
      </select>
      <label className="select-label">{props.label}</label>
    </div>
  );
}

export default SelectOption;
