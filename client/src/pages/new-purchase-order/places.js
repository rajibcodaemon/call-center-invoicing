import React, {useState} from 'react';

import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';

const Locationsearch = (props) => {
  console.log('props places', props.value.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, ''));
	const [address, setAddress] = useState(props.value.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, ''));

	const handleChange = async (address) => {		
    setAddress(address);
    
    try {
  		const geocode = await geocodeByAddress(address);  		  		
  		const latLang = await getLatLng(geocode[0]);  		      
      geocode[0].address_components.forEach(element => {
        if (element.types[0] === "postal_code") {          
          props.onSelect({ description: address, latlng: latLang, zip_code: element.long_name, place: props.place });
        }
      });      
  	} catch (error) {
  		console.log('Geocoding error');
      console.log(error);
      props.onSelect({ description: address, latlng: {}, zip_code: '', place: props.place });
      // setAddress('');
  	}

  };

  const handleSelect = async (address) => {	
  	setAddress(address);
  	try {
  		const geocode = await geocodeByAddress(address);  		
  		const latLang = await getLatLng(geocode[0]);  		
      geocode[0].address_components.forEach(element => {
        if (element.types[0] === "postal_code") {          
          props.onSelect({ description: address, latlng: latLang, zip_code: element.long_name, place: props.place });
        }
      });
  	} catch (error) {
  		console.log('Geocoding error');
      console.log(error);
      props.onSelect({ description: address, latlng: {}, zip_code: '', place: props.place });
      // setAddress('');
  	}
  };

  const renderFunc = ({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="form-group">
            <input
              {...getInputProps({
                placeholder: 'Search locations',
                className: 'location-search-input float-input',
              })}
            />
            <label>{props.label}</label>
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

  return (
  		<PlacesAutocomplete
        value={address}
        onChange={handleChange}
        onSelect={handleSelect}
        debounce={500}
        shouldFetchSuggestions={address.length > 3}
      >
      	{ renderFunc }
      </PlacesAutocomplete>
  	);

}

export default Locationsearch;