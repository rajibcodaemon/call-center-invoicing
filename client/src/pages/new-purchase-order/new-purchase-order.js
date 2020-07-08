import React, { useState, useEffect } from "react";
import axios from 'axios';
import Iframe from 'react-iframe';
import "./new-purchase-order.scss";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Button, Container, Modal } from "react-bootstrap";
import InnerBanner from "../../components/inner-banner/inner-banner";
import Input from "../../components/input/input";
import SelectOption from "../../components/select-option/select-option";
import AutoCompletePlaces from "./autocompleteplaces";
import useForm from "../form-logic/user-form-logic";

import Locationsearch from './places';

import { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";
import {
  vehicle_make,
  vehicle_color,
  service_type,
  problem_type,
  pickup_location
} from "../../assets/data/staticdata";

//map import
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
  Marker
} from "react-google-maps";

import { compose, withProps, lifecycle } from "recompose";
import Axios from "../../custom-hooks/use-axios";
import { valiedEmail, isAlpha, isPhone, isEmpty } from '../../validation-rules/form-validation';

function NewPurchaseOrder() {
  const initialData = {
    invoicenumber: '1011290101',
    fname: "",
    lname: "",
    phone: "",
    year: "",
    make: "",
    model: "",
    color: "",
    servicetype: "",
    problemtype: "",
    anyonewithvehicle: "",
    keysforvehicle: "",
    fourwheelsturn: "",
    frontwheelsturn: "",
    backwheelsturn: "",
    neutral: "",
    fueltype: "",
    pickuplocation: "",
    pickupnotes: "",
    origin: {},
    originaddress: "",
    destination: {},
    destinationaddress: "",
    ozip: 0,
    dzip: 0,
    tmiles: 0,
    calculatedcost: 0,
    baseprice: 0,
    additionalprice: 0,
    paymentemail: "",
    paymentamount: '',
    paymenttotalamount: '',
    sendpaymentto: "Phone"
  };

  // form state
  const [newData, setNewData] = useState(initialData);

  // error state
  const initialError = {
    fname: false,
    lname: false,
    phone: false,
    year: false,
    make: false,
    model: false,
    color: false,
    servicetype: false,
    paymentemail: false,
    paymentamount: false,
    paymenttotalamount: false
  }
  const [errors, setErrors] = useState(initialError);

  const validateForm = () => {
    const errorData = errors;
    errorData.fname = isEmpty(newData.fname);
    errorData.lname = isEmpty(newData.lname);
    errorData.phone = isEmpty(newData.phone);
    errorData.year = isEmpty(newData.year);
    errorData.make = isEmpty(newData.make);
    errorData.model = isEmpty(newData.model);
    errorData.color = isEmpty(newData.color);
    errorData.servicetype = isEmpty(newData.servicetype);
    errorData.paymentemail = isEmpty(newData.paymentemail);
    errorData.paymentamount = (newData.paymentamount === '' ? true : false);
    errorData.paymenttotalamount = (newData.paymenttotalamount === '' ? true : false);
    setErrors(errorData);
    if (
      !errorData.fname && !errorData.lname && !errorData.phone && !errorData.year && !errorData.make && 
      !errorData.modal && !errorData.color && !errorData.servicetype && !errorData.paymentemail && 
      !errorData.paymentamount && !errorData.paymenttotalamount) {
      return true;
    } else {
      return false;
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    console.log(newData);
    // setNewData({ ...initialData });

    if (validateForm()) {
      if (toggleCostCalculation) {
        alert('Form validated');
        console.log('Form Submitted');
        console.log(newData);
      } else {
        handleShow(
          "You need to calculate the cost for the service to proceed further!",
          "noOne"
        );  
      }
    } else {
      handleShow(
        "This form has errors. Please enter values for all the required fields!",
        "noOne"
      );
    }
    return false;
  };

  //cost calculation
  const [isCalculated, setIscalculated] = useState(false);

  //Places Auto complete Handler
  const latZipFinder = async (description, place) => {
    console.log('latZipFinder');
    console.log(place);
    let currentData = newData;
    try {

      if (description !== '') {
        const allData = await geocodeByAddress(description);
        const latLng = await getLatLng(allData[0]);
        console.log(allData);
        console.log(latLng);
        
        if (place === "origin") {
          currentData.originaddress = description;
          currentData.origin = latLng;
        } else {
          currentData.destinationaddress = description;
          currentData.destination = latLng;
        }
        
        //postcode
        allData[0].address_components.forEach(element => {
          if (element.types[0] === "postal_code") {
            place === "origin"
              ? (currentData.ozip = element.long_name)
              : (currentData.dzip = element.long_name);
            setNewData(currentData);
          }
        });
      } else {
        if (place === "origin") {
          currentData.originaddress = '';
          currentData.origin = {};
          currentData.ozip = '';
        } else {
          currentData.destinationaddress = '';
          currentData.destination = {};
          currentData.dzip = '';
        }
        setNewData(currentData);
      }
      toggleCalculationHandle();    
    } catch (error) {
      console.log(error);
      toggleCalculationHandle();
    }
  };
  
  //onselect origin
  const onSelectPlaceOrigin = ({ description }) => {
    latZipFinder(description, "origin");
  };

  // On change origin
  const onChangePlaceOrigin = ({ description }) => {
    alert('Origin change');
    console.log(description);
  }

  //onselect destination
  const onSelectPlaceDestination = ({ description }) => {
    latZipFinder(description, "destination");
  };

  //For empty object check
  const isEmpty = obj => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  };

  const { google } = window;

  //Map...

  const MapWithADirectionsRenderer = compose(
    withProps({
      googleMapURL:
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M&v=3.exp&libraries=geometry,drawing,places",
      loadingElement: (
        <div
          style={{
            height: `100%`
          }}
        />
      ),
      containerElement: (
        <div
          style={{
            height: `400px`
          }}
        />
      ),
      mapElement: (
        <div
          style={{
            height: `100%`
          }}
        />
      )
    }),
    withScriptjs,
    withGoogleMap,

    lifecycle({
      componentDidMount() {
        if (!isEmpty(newData.origin) && !isEmpty(newData.destination)) {
          const DirectionsService = new google.maps.DirectionsService();

          DirectionsService.route(
            {
              origin: newData.origin,
              destination: newData.destination,
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                this.setState({
                  directions: result
                });
              } else {
                console.error(`error fetching directions ${result}`);
              }
            }
          );
        }
      }
    })
  )(props => (
    <GoogleMap
      defaultZoom={10}
      defaultCenter={
        new google.maps.LatLng(newData.origin.lat, newData.origin.lng)
      }
    >
      <Marker position={{ ...newData.origin }} />
      {props.directions && <DirectionsRenderer directions={props.directions} />}
    </GoogleMap>
  ));

  const generateMapUrl = () => {
    console.log(newData.destinationaddress);
    console.log(newData.originaddress);
    console.log(newData.servicetype); // === "Towing"
    const origin_address = newData.originaddress;
    const destination_address = newData.destinationaddress;
    let render_url = "";

    if (newData.servicetype === "Towing") {
      render_url = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M&origin=${encodeURI(origin_address)}&destination=${encodeURI(destination_address)}`;
    } else {
      render_url = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M&q=${encodeURI(origin_address)}`;
    }

    return (
      <Iframe
        width="100%"
        height="600"
        id="route_map"
        className="map-container"
        display="initial"
        frameBorder="0"
        url={render_url}
        />
    );
  }

  // Toggle calculate cost button
  const [toggleCostCalculation, setToggleCostCalculation] = useState(false);
  const toggleCalculationHandle = () => {
    const currentData = newData;
    if (currentData.servicetype === 'Towing') {
      if (currentData.originaddress !== '' && currentData.destinationaddress !== '' && currentData.anyonewithvehicle.toLowerCase() === 'yes') {
        setToggleCostCalculation(true);
      } else {
        setToggleCostCalculation(false);
      }
    } else if (currentData.servicetype === 'Fuel / Fluids') {
      // Get the fuel info
      if (currentData.originaddress !== '' && serviceInfo.fuelfluids === true && currentData.anyonewithvehicle.toLowerCase() === 'yes') {
        setToggleCostCalculation(true);
      } else {
        setToggleCostCalculation(false);
      }
    } else {
      console.log('Pickup location');
      console.log(currentData.pickuplocation);
      if (currentData.originaddress !== '' && currentData.anyonewithvehicle.toLowerCase() === 'yes' && currentData.pickuplocation !== '') {
        setToggleCostCalculation(true);
      } else {
        setToggleCostCalculation(false);        
      }      
    }    
    console.log('Toggle cost calculation: ', toggleCostCalculation);
  }

  const [servicenotes, setServiceNotes] = useState([]);

  // form handler
  const handleChange = e => {
    const currentData = newData;
    switch (e.target.name) {
      case "anyonewithvehicle":        
        if (e.target.value === "No") {
          currentData.anyonewithvehicle = 'No';
          handleShow(
            "Service will not be performed on unattended vehicles",
            "noOne"
          );          
        } else {
          currentData.anyonewithvehicle = 'Yes';
          handleClose();
        }
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        toggleCalculationHandle();
        break;
      case "servicetype":        
        if (e.target.value === "Fuel / Fluids") {
          fuelfluidsToggle(false);
        } else if (e.target.value === "Towing") {
          towingToggle(true);
        } else {
          setServiceInfo(initialServiceData);
        }
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        currentData.servicetype = e.target.value;
        setNewData(currentData);
        console.log(newData.servicetype);
        setIscalculated(false);
        toggleCalculationHandle();        
        break;

      case "fueltype":
        if (e.target.value === "Diesel Gas") {
          handleShow(
            "Service will not be performed, we cannot service diesel engines",
            "fuel"
          );
          fuelfluidsToggle(false);
        } else {
          fuelfluidsToggle(true);
          handleClose();
        }
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        console.log(serviceInfo);
        toggleCalculationHandle();
        break;

      case "fourwheelsturn":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "No"
          ? fourwheelsToggle(true)
          : fourwheelsToggle(false);
        break;

      case "pickuplocation":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "Highway"
          ? setCost({ ...cost, highway: 18 })
          : setCost({ ...cost, highway: 0 });
        break;

      case "keysforvehicle":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "No"
          ? setCost({ ...cost, nokeys: 23 })
          : setCost({ ...cost, nokeys: 0 });
        break;

      case "neutral":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "No"
          ? setCost({ ...cost, noneutral: 17 })
          : setCost({ ...cost, noneutral: 0 });
        break;

      case "frontwheelsturn":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "No"
          ? setCost({ ...cost, nofrontwheelsturn: 26 })
          : setCost({ ...cost, nofrontwheelsturn: 0 });
        break;

      case "backwheelsturn":
        currentData.paymentamount = '';
        currentData.paymenttotalamount = '';
        setNewData(currentData);
        e.target.value === "No"
          ? setCost({ ...cost, nobackwheelsturn: 29 })
          : setCost({ ...cost, nobackwheelsturn: 0 });
        break;

      case "paymentamount":
        // const valid = /^(\d+|\d{1,3},\d{3}|\d{1,3},\d{3},\d{3}|\d{1,3}(,\d{3})*|\d{1,3}(,\d{3})*\.\d+)$/;
        // const charCode = (e.which) ? e.which : e.keyCode
        // console.log(charCode);
        const service_fee = 0.035;
        const amount = parseFloat(e.target.value);
        if (amount) {
          console.log(amount);
          const total_payment = (amount + (amount * service_fee)).toFixed(2);
          currentData.paymenttotalamount = total_payment;          
        } else {
          // e.target.value = '';
          currentData.paymenttotalamount = '';
          setNewData(currentData);
        }
        break;

      default:
    }

    setNewData({
      ...newData,
      [e.target.name]: e.target.value
    });
  };
  
  // modal state
  const initModalData = {
    isShown: false,
    text: "",
    id: ""
  };

  const [modal, setModal] = useState(initModalData);

  // modal handler
  const handleClose = () => {
    if (modal.id === "fuel") {
      setModal(initModalData);
      towingModalShow();
    } else {
      setModal(initModalData);
    }
  };
  const handleShow = (text, id) =>
    setModal({ ...modal, isShown: true, text, id });

  //modal for convert to towing
  const [towingModal, setTowingModal] = useState(false);
  const towingModalClose = () => setTowingModal(false);
  const towingModalShow = () => setTowingModal(true);
  const covertToTowing = () => {
    towingModalClose();
    setNewData({ ...newData, servicetype: "Towing" });
    towingToggle(true);
  };

  // serviceinfo state
  const initialServiceData = {
    fuelfluids: false,
    towing: false,
    fourwheelsturn: false
  };

  const [serviceInfo, setServiceInfo] = useState(initialServiceData);

  const fuelfluidsToggle = value => {
    const fuelData = serviceInfo;
    fuelData.fuelfluids = value;
    setServiceInfo(fuelData);
  };

  const towingToggle = value => {
    setServiceInfo({ ...serviceInfo, towing: value, fuelfluids: false });
  };

  const fourwheelsToggle = value => {
    setServiceInfo({ ...serviceInfo, fourwheelsturn: value });
  };

  //reset form data to initial state
  const resetForm = () => {
    setNewData({ ...initialData });
  };

  //cost calculation
  const initialCost = {
    highway: 0,
    nokeys: 0,
    noneutral: 0,
    nofrontwheelsturn: 0,
    nobackwheelsturn: 0,
    nobothwheelsturn: 0
  };

  const [cost, setCost] = useState(initialCost);

  const totalCost = obj => {
    let total = 0;
    for (let key in obj) {
      total += parseFloat(obj[key]);
    }
    // console.log(total);
    setNewData({ ...newData, additionalprice: total });
    return total;
  };

  const bothWheelsNotTurn = () => {
    if (cost.nofrontwheelsturn > 0 && cost.nobackwheelsturn > 0) {
      setCost({
        ...cost,
        nofrontwheelsturn: 0,
        nobackwheelsturn: 0,
        nobothwheelsturn: 39
      });
      totalCost(cost);
    } else {
      totalCost(cost);
    }
  };

  //post data creator
  const createPostData = (
    ozip,
    dzip,
    tmiles,
    servicetype,
    addlcharges,
    timestamp,
    lat,
    lng,
    oaddress,
    daddress=''
  ) => {
    return {
      ozip,
      dzip,
      tmiles,
      servicetype: servicetype.toLowerCase(),
      addlcharges,
      timestamp,
      lat,
      lng,
      oaddress,
      daddress
    };
  };

  // Refresh the additional cost
  const refreshAdditionalCost = () => {
    const data_set = newData;
    let total_cost = 0.00;    
    const service_notes = [];
    console.log('Refresh additional cost: ' + data_set.servicetype);

    if (data_set.pickuplocation === 'Highway') { 
      setCost({ ...cost, highway: 18 });
      total_cost += 18;
    } else { 
      setCost({ ...cost, highway: 0 }); 
    }

    if (data_set.keysforvehicle === 'No') { 
      setCost({ ...cost, nokeys: 23 });
      total_cost += 23;
      service_notes.push('The customer does not have keys for the vehicle.');
    } else { 
      setCost({ ...cost, nokeys: 0 });
    }

    // Check service type
    if (data_set.servicetype === 'Towing') {
      if (data_set.neutral === 'No') { 
        setCost({ ...cost, noneutral: 17 });
        total_cost += 17;
        service_notes.push('The vehicle does not go in neutral.');
      } else { 
        setCost({ ...cost, noneutral: 0 }); 
      }
      
      if (data_set.fourwheelsturn === 'No') {
        if (data_set.frontwheelsturn === 'No' && data_set.backwheelsturn === 'No') {
          total_cost += 39;
          service_notes.push('The front wheels of the vehicle does not turn.');
          service_notes.push('The back wheels of the vehicle does not turn.');
        }else {
          if (data_set.frontwheelsturn === 'No') {
            setCost({ ...cost, nofrontwheelsturn: 26 });
            total_cost += 26;
            service_notes.push('The front wheels of the vehicle does not turn.');
          } else { 
            setCost({ ...cost, nofrontwheelsturn: 0 }); 
          }
  
          if (data_set.backwheelsturn === 'No') { 
            setCost({ ...cost, nobackwheelsturn: 29 });
            total_cost += 29;
            service_notes.push('The back wheels of the vehicle does not turn.');
          } else { 
            setCost({ ...cost, nobackwheelsturn: 0 }); 
          }
        }
      }      
    } else {      
      setCost({ ...cost, noneutral: 0 });
      setCost({ ...cost, nofrontwheelsturn: 0 });
      setCost({ ...cost, nobackwheelsturn: 0 });
    }

    bothWheelsNotTurn();
    console.log('Total additional cost: ' + total_cost);
    data_set.additionalprice = total_cost;
    console.log(service_notes);
    setServiceNotes(service_notes);
    data_set.paymentnotes = service_notes.join('\n');
    setNewData(data_set);
    return total_cost;
  }
  
  //fetch data common method
  const commonFetchData = () => {
    const additional_cost = refreshAdditionalCost();
    console.log('Common fetch additional data: ', additional_cost); 
    let postData = createPostData(
      newData.ozip,
      newData.dzip,
      newData.tmiles,
      newData.servicetype,
      additional_cost,
      "",
      newData.origin.lat,
      newData.origin.lng,
      newData.originaddress,
      newData.destinationaddress
    );

    const fetchData = async () => {
      try {
        let response = await Axios("api/order/pricing", postData, "post");
        console.log(response);
        let { data } = response.data;
        let currentData = { ...newData };
        if (data) {
          currentData.baseprice = data.base_price;
          currentData.calculatedcost = data.net_price;
          currentData.paymenttotalamount = data.total_price;
          currentData.paymentamount = data.net_price;
          setNewData({ ...currentData });
          setIscalculated(true);
          console.log('Service notes');
          console.log(servicenotes);
          const mileage_charges = (parseFloat(newData.tmiles) > 10) ? (parseFloat(newData.tmiles) - 10).toFixed(2) : 0.00;

          // const alert_html = `
          //   Base price: ${data.base_price} \n
          //   Total distance: ${newData.tmiles} \n
          //   Mileage: ${mileage_charges} \n
          //   Mileage Charges(per mile): ${data.mileage_charges} \n
          //   Extra Mileage(Mileage * Mileage Charges): ${(mileage_charges * data.mileage_charges).toFixed(2)} \n
          //   Additional Charges: ${newData.additionalprice} \n
          //   Total Cost(Base + Additional + Extra Mileage): ${data.net_price} 
          // `;
          // alert(alert_html);
        }
      } catch (error) {
        console.log('cost error');
        console.log(error);
        handleShow(
          "This location is not servicable by our system",
          "noOne"
        );
        return false;
      }      
    };

    return fetchData();
  };

  //Calculate Cost
  const calculateCost = async () => {
    console.log('Calculate Cost');    
    console.log(newData);    
    //calculate cost if only origin is present
    // if (
    //   !isEmpty(newData.origin) &&
    //   isEmpty(newData.destination) &&
    //   newData.servicetype !== "Towing" &&
    //   newData.servicetype !== ""
    // )

    console.log('Calculate Cost');    
    console.log(cost);

    if (newData.servicetype === 'Towing') {
      if (newData.originaddress === '' && newData.destinationaddress === '') {
        handleShow(
          "Please select both origin & destination address",
          "noOne"
        );
        return false;
      } else if (newData.originaddress === '') {
        handleShow(
          "Please select origin address",
          "noOne"
        );
        return false;
      } else if (newData.destinationaddress === '') {
        handleShow(
          "Please select destination address",
          "noOne"
        );
        return false;
      } else {
        //calculate Distance if service type is towing
        if (newData.servicetype === "Towing" && newData.originaddress !== '' && newData.destinationaddress !== '') {
          console.log('Calculate distance');
          const DistanceService = new google.maps.DistanceMatrixService();      
          DistanceService.getDistanceMatrix(
            {
              origins: [newData.origin],
              destinations: [newData.destination],
              travelMode: "DRIVING",
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false
            },
            (response, status) => {
              if (status === "OK") {
                if (response.rows[0].elements[0].status === "OK") {
                  let distanceMeter = response.rows[0].elements[0].distance.value;
                  let miles = (distanceMeter / 1600).toFixed(2);                  
                  const currentData = newData;
                  currentData.tmiles = miles;
                  setNewData(currentData);
                  console.log(newData);
                  console.log('Additional cost breakup:');
                  console.log(cost);                  
                  commonFetchData();
                }
              } else {
                alert("Error was: " + status);
              }
            }
          );          
        }        
      }          
    } else if (newData.servicetype !== 'Towing') {
      if (newData.originaddress === '') {
        handleShow(
          "Please select all the required parameters",
          "noOne"
        );
        return false;
      } else {
        console.log('Additional cost breakup:');
        console.log(cost);        
        commonFetchData();
      }       
    }    
  };

  //cost calculation API call if service type is towing
  // useEffect(() => {
  //   if (newData.tmiles) {
  //     commonFetchData();
  //   }
  // }, [newData.tmiles]);

  useEffect(() => {
    bothWheelsNotTurn();
  }, [cost]);

  return (
    <React.Fragment>
      <Header />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part">
            <InnerBanner />
            <section className="invoice-wrap">
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="invoice-title">
                  <Input
                    type="text"
                    name="invoicenumber"
                    value={newData.invoicenumber}
                    readOnly="readOnly"
                    label="Invoice #"
                  />
                </div>
                <div className="info-area">
                  <h2>Caller Info</h2>
                  <Row>
                    <Col sm={6} lg={4}>
                      <Input
                        type="text"
                        name="fname"
                        value={newData.fname}
                        onChange={handleChange}
                        // required={true}
                        label="First Name *"
                      />
                      {errors.fname && <p className="error-text">Please enter a valid first name</p>}
                    </Col>
                    <Col sm={6} lg={4}>
                      <Input
                        type="text"
                        name="lname"
                        value={newData.lname}
                        onChange={handleChange}
                        // required={true}
                        label="Last Name *"
                      />
                      {errors.lname && <p className="error-text">Please enter a valid last name</p>}
                    </Col>
                    <Col sm={6} lg={4}>
                      <Input
                        type="tel"
                        name="phone"
                        value={newData.phone}
                        onChange={handleChange}
                        // required={true}
                        label="Phone Number *"
                      />
                      {errors.phone && <p className="error-text">Please enter a valid phone number</p>}
                    </Col>
                  </Row>
                </div>
                <div className="info-area">
                  <h2>Vehicle Info</h2>
                  <Row>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="year"
                        value={newData.year}
                        onChange={handleChange}
                        // required={true}
                        label="Year *"
                      />
                      {errors.year && <p className="error-text">Please enter the vehicle year</p>}
                    </Col>
                    <Col sm={6}>
                      <SelectOption
                        label="Make *"
                        name="make"
                        value={newData.make}
                        onChange={handleChange}
                        options={vehicle_make}
                      />
                      {errors.make && <p className="error-text">Please select the vehicle make</p>}
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="model"
                        value={newData.model}
                        onChange={handleChange}
                        // required={true}
                        label="Model *"
                      />
                      {errors.model && <p className="error-text">Please enter the vehicle model</p>}
                    </Col>
                    <Col sm={6}>
                      <SelectOption
                        label="Color *"
                        name="color"
                        value={newData.color}
                        onChange={handleChange}
                        options={vehicle_color}
                      />
                      {errors.color && <p className="error-text">Please select the vehicle color</p>}
                    </Col>
                  </Row>
                </div>
                <div className="info-area">
                  <h2>Service Info</h2>
                  <h4>
                    Pricing may increase due to additional equipment needs
                  </h4>
                  <Row>
                    <Col xl={6}>
                      <SelectOption
                        label="Service Type *"
                        name="servicetype"
                        value={newData.servicetype}
                        onChange={handleChange}
                        options={service_type}
                      />
                      {errors.servicetype && <p className="error-text">Please select the service type</p>}
                    </Col>

                    {newData.servicetype === 'Towing' && (
                      <Col xl={6}>
                        <SelectOption
                          label="Problem Type *"
                          name="problemtype"
                          value={newData.problemtype}
                          onChange={handleChange}
                          options={problem_type}
                        />
                      </Col>
                    )}

                    <Col xl={6}>
                      <SelectOption
                        label="Will anyone be with the vehicle? *"
                        name="anyonewithvehicle"
                        value={newData.anyonewithvehicle}
                        onChange={handleChange}
                        options={["yes", "No"]}
                      />
                    </Col>

                    <Col xl={6}>
                      <SelectOption
                        label="Do you have keys for the vehicle? *"
                        name="keysforvehicle"
                        value={newData.keysforvehicle}
                        onChange={handleChange}
                        options={["yes", "No"]}
                      />
                    </Col>

                    {newData.servicetype === 'Towing' && (
                      <Col xl={6}>
                        <SelectOption
                          label="Will the vehicle go in neutral? *"
                          name="neutral"
                          value={newData.neutral}
                          onChange={handleChange}
                          options={["yes", "No"]}
                        />
                      </Col>
                    )}

                    {newData.servicetype === 'Towing' && (
                      <Col xl={6}>
                        <SelectOption
                          label="Do all four wheels on the vehicle turn? *"
                          name="fourwheelsturn"
                          value={newData.fourwheelsturn}
                          onChange={handleChange}
                          options={["yes", "No"]}
                        />
                      </Col>
                    )}

                    {serviceInfo.fourwheelsturn && (
                      <Col xl={6}>
                        <SelectOption
                          label="Will both front wheels turn? *"
                          name="frontwheelsturn"
                          value={newData.frontwheelsturn}
                          onChange={handleChange}
                          options={["yes", "No"]}
                        />
                      </Col>
                    )}

                    {serviceInfo.fourwheelsturn && (
                      <Col xl={6}>
                        <SelectOption
                          label="Will both back wheels turn? *"
                          name="backwheelsturn"
                          value={newData.backwheelsturn}
                          onChange={handleChange}
                          options={["yes", "No"]}
                        />
                      </Col>
                    )}

                    {newData.servicetype === 'Fuel / Fluids' && (
                      <Col xl={6}>
                        <SelectOption
                          label="Do you need regular gas or diesel? *"
                          name="fueltype"
                          value={newData.fueltype}
                          onChange={handleChange}
                          options={["regular gas", "diesel gas"]}
                        />
                      </Col>
                    )}
                  </Row>
                </div>
                <div className="info-area">
                  <h2>Pickup-Drop Location</h2>
                  <Row>
                    <Col sm={6}>
                      <SelectOption
                        label="Pickup Location *"
                        name="pickuplocation"
                        value={newData.pickuplocation}
                        onChange={handleChange}
                        options={pickup_location}
                      />
                    </Col>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="pickupnotes"
                        value={newData.pickupnotes}
                        onChange={handleChange}
                        label="Pickup Note"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      {/* <AutoCompletePlaces
                        label="Origin"
                        onSelect={onSelectPlaceOrigin}
                      /> */}
                      <Locationsearch label="Origin" onSelect={onSelectPlaceOrigin} />
                    </Col>
                    <Col sm={6}>
                      {newData.servicetype === "Towing" && (
                        // <AutoCompletePlaces
                        //   label="Destination"
                        //   onSelect={onSelectPlaceDestination}
                        // />
                        <Locationsearch label="Destination" onSelect={onSelectPlaceDestination} />
                      )}
                    </Col>
                  </Row>

                  <div className="calculate-cost">
                    { toggleCostCalculation === false ? (
                      <Button
                        variant="info"
                        type="button"
                        onClick={calculateCost}
                        disabled
                      >
                        Calculate Cost
                      </Button>) : (
                        <Button
                        variant="info"
                        type="button"
                        onClick={calculateCost}                      
                      >
                        Calculate Cost
                      </Button>
                      )
                    }
                  </div>
                  {isCalculated && (
                    <React.Fragment>
                      <div className="cost-details">
                        {newData.tmiles > 0 && (
                          <h3>
                            Distance: <strong>{newData.tmiles} miles</strong>
                          </h3>
                        )}

                        <h3>
                          Cost: <strong>$ {newData.calculatedcost}</strong>
                        </h3>
                        <p>
                          Base Price: <strong>$ {newData.baseprice}</strong>
                        </p>
                        <p>
                          Additional Price:
                          <strong>$ {newData.additionalprice}</strong>
                        </p>
                      </div>
                      {/* <div>
                        <h5>Price Breakup:</h5>
                        <p>Base Price: <span id="base_price"></span></p>
                        <p>Total Distance: <span id="total_distance"></span></p>
                        <p>Mileage: <span id="mileage"></span></p>
                        <p>Mileage charges(per mile): <span id="mileage_charges"></span></p>
                        <p>Extra Mileage(Mileage * Mileage Charges): <span id="extra_mieage"></span></p>
                        <p>Additional Charges: <span id="additional_charges"></span></p>
                        <p><hr/></p>
                        <p>Total Cost(Base Price + Additional Charges + Extra Mileage): <span id="net_price"></span></p>
                      </div> */}
                    </React.Fragment>          
                  )}
                  {isCalculated && (
                    <div className="map-container">
                      {/* <MapWithADirectionsRenderer /> */}
                      { generateMapUrl() }
                    </div>
                  )}
                </div>

                <div className="info-area">
                  <h2>Payment Info</h2>
                  <Input
                    type="email"
                    name="paymentemail"
                    value={newData.paymentemail}
                    onChange={handleChange}
                    label="Email *"
                  />
                  {errors.paymentemail && <p className="error-text">Please enter a valid email</p>}
                  <Row>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="paymentamount"
                        value={newData.paymentamount}
                        onChange={handleChange}                        
                        label="Amount *"
                      />
                      {errors.paymentamount && <p className="error-text">Please enter the amount</p>}
                    </Col>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="paymenttotalamount"
                        value={newData.paymenttotalamount}
                        label="Total Amount *"
                        readOnly="readOnly"
                      />
                      {errors.paymenttotalamount && <p className="error-text">Please enter the total amount</p>}
                    </Col>
                  </Row>
                  <div className="form-group">
                    <textarea
                      rows="4"
                      name="paymentnotes"
                      className="textarea"
                      value={newData.paymentnotes}
                      placeholder="Notes"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="send-payment-link">
                    <p>Send payment link to</p>
                    <Row>
                      <Col>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            id="paymenttophone"
                            name="sendpaymentto"
                            onChange={handleChange}
                            value="Phone"
                            checked={newData.sendpaymentto === "phone"}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="paymenttophone"
                          >
                            Phone
                          </label>
                        </div>
                      </Col>
                      <Col>
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            id="paymenttoemail"
                            name="sendpaymentto"
                            onChange={handleChange}
                            value="Email"
                            checked={newData.sendpaymentto === "email"}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="paymenttoemail"
                          >
                            Email
                          </label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className="buttons-area">
                  <Row>
                    <Col lg={4}>
                      <Button variant="warning" type="button">
                        save for later
                      </Button>
                    </Col>
                    <Col lg={4}>
                      <Button variant="info" type="submit">
                        send payment link
                      </Button>
                    </Col>
                    <Col lg={4}>
                      <Button
                        variant="danger"
                        type="button"
                        onClick={resetForm}
                      >
                        reset
                      </Button>
                    </Col>
                  </Row>
                </div>
              </form>
            </section>
          </Col>
        </Row>
      </Container>

      {/* alert for no one with the vehicle and diesel gas */}

      <Modal show={modal.isShown} onHide={handleClose} className="error-bg">
        <i
          className="fa fa-times-circle close-icon"
          aria-hidden="true"
          onClick={handleClose}
        ></i>
        <Modal.Body className="text-center">{modal.text}</Modal.Body>
      </Modal>

      {/* alert for convert the service type into Towing */}

      <Modal show={towingModal} onHide={handleClose} className="error-bg">
        <i
          className="fa fa-times-circle close-icon"
          aria-hidden="true"
          onClick={handleClose}
        ></i>
        <Modal.Body className="text-center">
          Press OK button to convert the service type into Towing!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={towingModalClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={covertToTowing}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default NewPurchaseOrder;
