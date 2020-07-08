import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const AutoCompletePlaces = ({label, onSelect}) => {
  const handlechange = (e) => {
    console.log('Input change');
    console.log(e);
  }

  return (
    <React.Fragment>
      <GooglePlacesAutocomplete
        onSelect = {onSelect}
        onChange={handlechange}      
        renderInput={props => (
          <div className="form-group">
            <input className="float-input" {...props} filled="true" autoComplete="off" />
            <label>{label}</label>
          </div>
        )}
      />
    </React.Fragment>
  );
};

export default AutoCompletePlaces;
