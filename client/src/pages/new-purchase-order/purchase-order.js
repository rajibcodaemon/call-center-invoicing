import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Spinner } from 'react-bootstrap';
import Iframe from 'react-iframe';

import Header from '../../components/header/header';
import Sidebar from '../../components/sidebar/sidebar';
import InnerBanner from "../../components/inner-banner/inner-banner";
import Input from "../../components/input/input";
import SelectOption from "../../components/select-option/select-option";

import "./new-purchase-order.scss";

import Locationsearch from './places';

import useForm from "../form-logic/user-form-logic";

import {
  vehicle_make,
  vehicle_color,
  service_type,
  problem_type,
  pickup_location
} from "../../assets/data/staticdata";

import AuthContext from '../../context/auth/authContext';
import InvoiceContext from '../../context/invoice/invoiceContext';

const Purchaseorder = (props) => {
  const authContext = useContext(AuthContext);
  const invoiceContext = useContext(InvoiceContext);
  const { invoice_number, loading, success, error } = invoiceContext;

  const initialData = {
    invoicenumber: '',
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
    sendpaymentto: "Phone",
    draft: 0,
    msa_system: 'SYSTEM 1'
  };

  // Form state
  const [newData, setNewData] = useState(initialData);

  // Show origin map
  const [showOriginMap, setShowOriginMap] = useState(false);

  // Handle locations data
  const handleLocation = ({ description, latlng, place, zip_code }) => {
    console.log('Location Object');
    console.log(description, latlng, place, zip_code);

    if (place === 'origin') {
      setNewData({
        ...newData,
        originaddress: description.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, ''),
        origin: latlng,
        ozip: zip_code
      });

      if (description !== '') {
        setShowOriginMap(true);        
      } else {
        setShowOriginMap(false);
      }
      setShowMap(false);
      setCalculateCostDisable(true);     
    } else {
      setNewData({
        ...newData,
        destinationaddress: description.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, ''),
        destination: latlng,
        dzip: zip_code
      });
      // setShowOriginMap(false);
      setShowMap(false);
      setCalculateCostDisable(true);
    }    
  }

  // Calculate cost button enable/disable toggle
  const [calculateCostDisable, setCalculateCostDisable] = useState(true);

  // Flag to display google map
  const [showMap, setShowMap] = useState(false);

  // Check conditions to check if calculate cost button should be enabled or disabled
  const checkCalculateCostBtnStatus = () => {
    console.log('Check btn status');
    if (newData.servicetype !== '' && newData.originaddress !== ''  && newData.pickuplocation !== '') {
      if (newData.anyonewithvehicle === 'Yes' && newData.keysforvehicle !== '') {
        if (newData.servicetype === 'Towing') {
          if (newData.problemtype !== '' && newData.neutral !== '' && newData.destinationaddress !== '' && newData.fourwheelsturn === 'Yes') {
            setCalculateCostDisable(false);
          } else if (newData.problemtype !== '' && newData.neutral !== '' && newData.destinationaddress !== '' && newData.fourwheelsturn === 'No') {
            if (newData.frontwheelsturn !== '' && newData.backwheelsturn !== '') {
              setCalculateCostDisable(false);
            } else {
              setCalculateCostDisable(true);
            }
          } else {
            setCalculateCostDisable(true);
          }
        } else if (newData.servicetype === 'Fuel / Fluids' && newData.fueltype !== 'Regular Gas') {
          setCalculateCostDisable(true);
        } else {
          setCalculateCostDisable(false);
        }
      } else {
        setCalculateCostDisable(true);
      }            
    } else {
      setCalculateCostDisable(true);
    }
  }

  // Clear the amount and total amount if calculate cost button is enabled or disabled
  const resetAmount = () => {    
    setNewData({ ...newData, paymentamount: '', paymenttotalamount: '' });
    setShowMap(false);
  }

  const handleChangeInput = (e) => {
    setNewData({ ...newData, [e.target.name]: e.target.value });
    
    switch(e.target.name) {
      case 'anyonewithvehicle':
        if (e.target.value === 'No') {
          handleShow(
            "Service will not be performed on unattended vehicles",
            "noOne"
          );
        } else {
          handleClose();
        }
        break;
      case 'fueltype':
        if (e.target.value !== 'Regular Gas') {
          handleShow(
            "Service will not be performed, we cannot service diesel engines",
            "fuel"
          );
        }
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
            setNewData({
              ...newData,
              paymenttotalamount: total_payment,
              paymentamount: e.target.value
            });          
          } else {
            setNewData({
              ...newData,
              paymenttotalamount: '',
              paymentamount: e.target.value
            });
          }
          break;
    }
  }

  // Service notes based on user selection
  const [servicenotes, setServiceNotes] = useState([]);

  // Refresh the additional cost
  const refreshAdditionalCost = () => {
    const data_set = newData;
    let total_cost = 0.00;    
    const service_notes = [];
    console.log('Refresh additional cost: ' + data_set.servicetype);

    if (data_set.pickuplocation === 'Highway') {
      // setCost({ ...cost, highway: 18 });
      total_cost += 18;
    } else { 
      // setCost({ ...cost, highway: 0 }); 
    }

    if (data_set.keysforvehicle === 'No') { 
      // setCost({ ...cost, nokeys: 23 });
      total_cost += 23;
      service_notes.push('The customer does not have keys for the vehicle.');
    } else { 
      // setCost({ ...cost, nokeys: 0 });
    }

    // Check service type
    if (data_set.servicetype === 'Towing') {
      if (data_set.neutral === 'No') { 
        // setCost({ ...cost, noneutral: 17 });
        total_cost += 17;
        service_notes.push('The vehicle does not go in neutral.');
      } else { 
        // setCost({ ...cost, noneutral: 0 }); 
      }
      
      if (data_set.fourwheelsturn === 'No') {
        if (data_set.frontwheelsturn === 'No' && data_set.backwheelsturn === 'No') {
          total_cost += 39;
          service_notes.push('The front wheels of the vehicle does not turn.');
          service_notes.push('The back wheels of the vehicle does not turn.');
        }else {
          if (data_set.frontwheelsturn === 'No') {
            // setCost({ ...cost, nofrontwheelsturn: 26 });
            total_cost += 26;
            service_notes.push('The front wheels of the vehicle does not turn.');
          } else { 
            // setCost({ ...cost, nofrontwheelsturn: 0 }); 
          }
  
          if (data_set.backwheelsturn === 'No') { 
            // setCost({ ...cost, nobackwheelsturn: 29 });
            total_cost += 29;
            service_notes.push('The back wheels of the vehicle does not turn.');
          } else { 
            // setCost({ ...cost, nobackwheelsturn: 0 }); 
          }
        }
      }      
    } else {      
      // setCost({ ...cost, noneutral: 0 });
      // setCost({ ...cost, nofrontwheelsturn: 0 });
      // setCost({ ...cost, nobackwheelsturn: 0 });
    }

    // bothWheelsNotTurn();
    console.log('Total additional cost: ' + total_cost);
    data_set.additionalprice = total_cost;
    console.log(service_notes);
    setServiceNotes(service_notes);
    data_set.paymentnotes = service_notes.join('\n');
    setNewData({ ...newData, additionalprice: total_cost, paymentnotes: service_notes.join('\n') });
    return total_cost;
  }

  // Calculate cost button click
  const calculateDistance = async () => {
    const additional_cost = refreshAdditionalCost();
    try {
      authContext.refreshSpinnerLoading(true);
      const price = await invoiceContext.get_invoice_price(newData);
      authContext.refreshSpinnerLoading(false);
      console.log('Price calculation API');
      console.log(price);
      if (price.data.errors.length > 0) {
        handleShow(
          price.data.errors.join('\n'),
          "noOne"
        );
        setShowMap(false);
        return false;
      } else {
        const { total_miles, base_price, total_price, net_price, system } = price.data.data;
        setNewData({
          ...newData,
          tmiles: total_miles,
          baseprice: base_price,
          calculatedcost: net_price,
          paymentamount: net_price,
          paymenttotalamount: total_price,
          msa_system: system
        });
        setShowMap(true);
      }
      setShowOriginMap(false); 
    } catch (error) {
      console.log('Price error');
      console.log(error);      
    }    
  }

  const generateMapUrl = () => {
    console.log(newData.destinationaddress);
    console.log(newData.originaddress);
    console.log(newData.servicetype); // === "Towing"
    const origin_address = newData.originaddress;
    const destination_address = newData.destinationaddress;
    let render_url = "";

    if (newData.servicetype === "Towing") {
      render_url = `https://www.google.com/maps/embed/v1/directions?origin=${encodeURI(origin_address)}&destination=${encodeURI(destination_address)}&key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M`;
    } else {
      render_url = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M&q=${encodeURI(origin_address)}`;
    }
    console.log('Render url: ', render_url);

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

  const generateOriginMapUrl = () => {
    console.log(newData.originaddress);    
    console.log(newData.servicetype); // === "Towing"
    const origin_address = newData.originaddress;    
    let render_url = "";
    render_url = `https://www.google.com/maps/embed/v1/place?q=${encodeURI(origin_address)}&key=AIzaSyCcZyvEkGx4i1cQlbiFvQBM8kM_x53__5M`;
    console.log('Render url: ', render_url);

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

  const createInvoice = async () => {
    console.log("No errors, submit callback called!");
    if (showMap) {
      console.log(newData);
      const currentData = newData;
      // invoiceContext.toggle_loader(true);
      authContext.refreshSpinnerLoading(true);
      const invoice_save = await invoiceContext.save_invoice(currentData);
      authContext.refreshSpinnerLoading(false);

      // Reset current form if it is draft
      if (newData.draft === 1) {
        resetForm();
      }
    } else {
      handleShow(
        "You have not calculated the cost for the service!",
        "noOne"
      );
      return false;
    }
  }

  const saveDraft = (e) => {
    setNewData({ ...newData, draft: 1});
    console.log('Save as draft');
    handleSubmit(e);
  }

  const resetForm = async () => {
    authContext.refreshSpinnerLoading(true);
    if (newData.draft !== 1) {
      setNewData(initialData);
      setNewData({
        ...newData,
        invoicenumber: invoice_number
      });
    } else {
      setNewData(initialData);
      invoiceContext.get_invoice_number();
    }
    authContext.refreshSpinnerLoading(false);
    console.log('Reset form');
  }
  
  const { handleChange, values, touched, handleBlur, validator, handleSubmit } = useForm(
    newData,
    createInvoice,
    handleChangeInput
  );

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

  const handleShow = (text, id) => setModal({ ...modal, isShown: true, text, id });

  // Modal for convert to towing
  const [towingModal, setTowingModal] = useState(false);
  const towingModalClose = () => setTowingModal(false);
  const towingModalShow = () => setTowingModal(true);
  const covertToTowing = () => {
    towingModalClose();
    setNewData({ ...newData, servicetype: 'Towing' });
    // towingToggle(true);
  };

  // Successful modal
  const [successModal, setSuccessModal] = useState(false);

  const towingSuccessModalShow = () => setSuccessModal(true);

  const towingSuccessModalClose = () => {
    setSuccessModal(false);
    props.history.push(`/invoice-overview/${newData.invoicenumber}`);
  }
  
  // const towingToggle = value => {
  //   setServiceInfo({ ...serviceInfo, towing: value, fuelfluids: false });
  // };

  // serviceinfo state
  // const initialServiceData = {
  //   fuelfluids: false,
  //   towing: false,
  //   fourwheelsturn: false
  // };

  // const [serviceInfo, setServiceInfo] = useState(initialServiceData);

  // const fuelfluidsToggle = value => {
  //   const fuelData = serviceInfo;
  //   fuelData.fuelfluids = value;
  //   setServiceInfo(fuelData);
  // };

  const showSuccess = () => {
    if (success !== null) {
      setSuccessModal(true);
    }    
  }

  const showError = () => {
    if (error !== null) {
      const msg = error.map(err => {
        return err.msg;
      });
      handleShow(
        msg.join('<br/>'),
        "noOne"
      );
    }    
  }
  
  useEffect(() => {
    setSuccessModal(false);
    invoiceContext.toggle_loader(true);
    invoiceContext.get_invoice_number();
  }, []);

  useEffect(() => {
    console.log('Use effect track newData changes');
    // Check if the newData changes
    checkCalculateCostBtnStatus();
  }, [newData]);

  useEffect(() => {
    resetAmount();
  }, [calculateCostDisable, newData.servicetype]);

  useEffect(() => {
    if (success != null) {
      showSuccess();
    } else if (error != null) {
      showError();
    }
  }, [success, error]);

  useEffect(() => {
    console.log('Invoice number change', invoice_number);
    if (invoice_number !== null) {
      setNewData({
        ...newData,
        invoicenumber: invoice_number
      });
    }    
  }, [invoice_number]);

  // For unmount
  useEffect( () => () => {
    setNewData(initialData);
    setSuccessModal(false);
    invoiceContext.clear_invoice_list();
    invoiceContext.clear_success();
    invoiceContext.clear_error(); 
    console.log("unmount invoice save");
  }, [] );

  return (
    <React.Fragment>
      {/* <Header loading={loading} />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part"> */}
            {/* <InnerBanner /> */}
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
                        onChange={handleChangeInput}
                        // required={true}
                        label="First Name *"
                      />
                      {validator.message("fname", newData.fname, "required", {messages: {required: 'First name field is required'}})}
                      {touched.fname && validator.errorMessages.fname && (
                        <p className="error-text">{validator.errorMessages.fname}</p>
                      )}                     
                    </Col>
                    <Col sm={6} lg={4}>
                      <Input
                        type="text"
                        name="lname"
                        value={newData.lname}
                        onChange={handleChangeInput}
                        // required={true}
                        label="Last Name *"
                      />
                      {validator.message("lname", newData.lname, "required", {messages: {required: 'Last name field is required'}} )}
                      {touched.lname && validator.errorMessages.lname && (
                        <p className="error-text">{validator.errorMessages.lname}</p>
                      )}
                    </Col>
                    <Col sm={6} lg={4}>
                      <Input
                        type="tel"
                        name="phone"
                        value={newData.phone}
                        onChange={handleChangeInput}
                        // required={true}
                        label="Phone Number *"
                      />
                      {validator.message("phone", newData.phone, "required|max:10", {messages: {required: 'Phone number field is required'}} )}
                      {touched.phone && validator.errorMessages.phone && (
                        <p className="error-text">{validator.errorMessages.phone}</p>
                      )}
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
                        onChange={handleChangeInput}
                        // required={true}
                        label="Year *"
                      />
                      {validator.message("year", newData.year, "required|max:4", {messages: {required: 'Vehicle year field is required'}} )}
                      {touched.year && validator.errorMessages.year && (
                        <p className="error-text">{validator.errorMessages.year}</p>
                      )}                     
                    </Col>
                    <Col sm={6}>
                      <SelectOption
                        label="Make *"
                        name="make"
                        value={newData.make}
                        onChange={handleChangeInput}
                        options={vehicle_make}
                      />
                      {validator.message("make", newData.make, "required", {messages: {required: 'Vehicle make field is required'}} )}
                      {touched.make && validator.errorMessages.make && (
                        <p className="error-text">{validator.errorMessages.make}</p>
                      )}                     
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="model"
                        value={newData.model}
                        onChange={handleChangeInput}
                        // required={true}
                        label="Model *"
                      />
                      {validator.message("model", newData.model, "required", {messages: {required: 'Vehicle model field is required'}} )}
                      {touched.model && validator.errorMessages.model && (
                        <p className="error-text">{validator.errorMessages.model}</p>
                      )}                      
                    </Col>
                    <Col sm={6}>
                      <SelectOption
                        label="Color *"
                        name="color"
                        value={newData.color}
                        onChange={handleChangeInput}
                        options={vehicle_color}
                      />
                      {validator.message("color", newData.color, "required", {messages: {required: 'Vehicle color field is required'}} )}
                      {touched.color && validator.errorMessages.color && (
                        <p className="error-text">{validator.errorMessages.color}</p>
                      )}                     
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
                        onChange={handleChangeInput}
                        options={service_type}
                      />
                      {validator.message("servicetype", newData.servicetype, "required", {messages: {required: 'Service type field is required'}} )}
                      {touched.servicetype && validator.errorMessages.servicetype && (
                        <p className="error-text">{validator.errorMessages.servicetype}</p>
                      )}                      
                    </Col>
                    
                    <Col xl={6}>
                      <SelectOption
                        label="Will anyone be with the vehicle? *"
                        name="anyonewithvehicle"
                        value={newData.anyonewithvehicle}
                        onChange={handleChangeInput}
                        options={["Yes", "No"]}
                      />
                    </Col>
                    
                    <Col xl={6}>
                      <SelectOption
                        label="Do you have keys for the vehicle? *"
                        name="keysforvehicle"
                        value={newData.keysforvehicle}
                        onChange={handleChangeInput}
                        options={["Yes", "No"]}
                      />
                    </Col>

                    {
                      newData.servicetype === 'Fuel / Fluids' && (
                        <Col xl={6}>
                          <SelectOption
                            label="Do you need regular gas or diesel? *"
                            name="fueltype"
                            value={newData.fueltype}
                            onChange={handleChangeInput}
                            options={["regular gas", "diesel gas"]}
                          />
                        </Col>
                      )
                    }                    

                    {newData.servicetype === 'Towing' && (
                        <React.Fragment>
                          <Col xl={6}>
                            <SelectOption
                              label="Problem Type *"
                              name="problemtype"
                              value={newData.problemtype}
                              onChange={handleChangeInput}
                              options={problem_type}
                            />
                          </Col>

                          <Col xl={6}>
                            <SelectOption
                              label="Will the vehicle go in neutral? *"
                              name="neutral"
                              value={newData.neutral}
                              onChange={handleChangeInput}
                              options={["Yes", "No"]}
                            />
                          </Col>

                          <Col xl={6}>
                            <SelectOption
                              label="Do all four wheels on the vehicle turn? *"
                              name="fourwheelsturn"
                              value={newData.fourwheelsturn}
                              onChange={handleChangeInput}
                              options={["Yes", "No"]}
                            />
                          </Col>

                          {
                            newData.fourwheelsturn === 'No' && (
                              <React.Fragment>
                                <Col xl={6}>
                                  <SelectOption
                                    label="Will both front wheels turn? *"
                                    name="frontwheelsturn"
                                    value={newData.frontwheelsturn}
                                    onChange={handleChangeInput}
                                    options={["Yes", "No"]}
                                  />
                                </Col>

                                <Col xl={6}>
                                  <SelectOption
                                    label="Will both back wheels turn? *"
                                    name="backwheelsturn"
                                    value={newData.backwheelsturn}
                                    onChange={handleChangeInput}
                                    options={["Yes", "No"]}
                                  />
                                </Col>
                              </React.Fragment>
                            )
                          }                          
                        </React.Fragment>
                      )
                    }                    
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
                        onChange={handleChangeInput}
                        options={pickup_location}
                      />
                    </Col>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="pickupnotes"
                        value={newData.pickupnotes}
                        onChange={handleChangeInput}
                        label="Pickup Note"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={6}>
                      <Locationsearch value={newData.originaddress} place={'origin'} label="Origin" onSelect={handleLocation} />
                    </Col>
                    <Col sm={6}>
                      { 
                        newData.servicetype === 'Towing' &&                    
                        (<Locationsearch value={newData.destinationaddress} place={'destination'} label="Destination" onSelect={handleLocation}/>)
                      }
                    </Col>
                  </Row>

                  <div className="calculate-cost">
                    {
                      calculateCostDisable ? (
                        <Button
                          variant="info"
                          type="button"
                          disabled={true}              
                        >
                          Calculate Cost
                        </Button>
                      ) : (
                        <Button
                          variant="info"
                          type="button"
                          onClick={calculateDistance}                         
                        >
                          Calculate Cost
                        </Button>
                      )
                    }                      
                  </div>
                    {
                      showOriginMap && (
                        <React.Fragment>                          
                          <div className="map-container">                      
                            { showOriginMap && generateOriginMapUrl() }
                          </div>
                        </React.Fragment>
                      )
                    }
                    {
                      showMap && (
                        <React.Fragment>
                          <div className="cost-details">                        
                            {
                              newData.servicetype === 'Towing' && (
                              <h3>
                                Distance: <strong>{newData.tmiles} miles</strong>
                              </h3>)
                            }
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
                          <div className="map-container">                      
                            { showMap && generateMapUrl() }
                          </div>             
                        </React.Fragment>
                      )
                    }                                                          
                </div>

                <div className="info-area">
                  <h2>Payment Info</h2>
                  <Input
                    type="email"
                    name="paymentemail"
                    value={newData.paymentemail}
                    onChange={handleChangeInput}
                    label="Email *"
                  />
                  {validator.message("paymentemail", newData.paymentemail, "required|email", {messages: {required: 'Email field is required'}} )}
                  {touched.paymentemail && validator.errorMessages.paymentemail && (
                    <p className="error-text">{validator.errorMessages.paymentemail}</p>
                  )}
                  <Row>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="paymentamount"
                        value={newData.paymentamount}
                        onChange={handleChangeInput}                        
                        label="Amount($) *"
                      />
                      {validator.message("paymentamount", newData.paymentamount, "required", {messages: {required: 'Amount field is required'}} )}
                      {touched.paymentamount && validator.errorMessages.paymentamount && (
                        <p className="error-text">{validator.errorMessages.paymentamount}</p>
                      )}                      
                    </Col>
                    <Col sm={6}>
                      <Input
                        type="text"
                        name="paymenttotalamount"
                        value={newData.paymenttotalamount}
                        label="Total Amount($) *"
                        readOnly="readOnly"
                      />
                      {validator.message("paymenttotalamount", newData.paymenttotalamount, "required", {messages: {required: 'Total amount field is required'}} )}
                      {touched.paymenttotalamount && validator.errorMessages.paymenttotalamount && (
                        <p className="error-text">{validator.errorMessages.paymenttotalamount}</p>
                      )}                    
                    </Col>
                  </Row>
                  <div className="form-group">
                    <textarea
                      rows="4"
                      name="paymentnotes"
                      className="textarea"
                      value={newData.paymentnotes}
                      placeholder="Notes"
                      onChange={handleChangeInput}
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
                            onChange={handleChangeInput}
                            value="Phone"
                            checked={newData.sendpaymentto === "Phone"}
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
                            onChange={handleChangeInput}
                            value="Email"
                            checked={newData.sendpaymentto === "Email"}
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
                      <Button
                        className="draft-btn" 
                        variant="warning" 
                        type="button"
                        onClick={saveDraft}
                      >
                        save for later
                      </Button>
                    </Col>
                    <Col lg={4}>
                      {
                        !loading ? (
                          <Button variant="info" type="submit">
                            send payment link
                          </Button>
                        ) : (
                          <Button variant="info" disabled>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Loading...</span>
                          </Button>
                        )
                      }
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
          {/* </Col>
        </Row>
      </Container> */}

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

      {/* alert for showing success message after invoice is created */}

      <Modal show={successModal} onHide={towingSuccessModalClose} className="error-bg">
        {/* <i
          className="fa fa-times-circle close-icon"
          aria-hidden="true"
          onClick={handleClose}
        ></i> */}
        <Modal.Body className="text-center">
          <p><strong>Done!</strong></p>
          <p>Payment link has been sent to the entered phone/email. Your customer can pay for the Tow using that.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={towingSuccessModalClose}>
            Close
          </Button>
          {/* <Button variant="primary" size="sm" onClick={covertToTowing}>
            Ok
          </Button> */}
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default Purchaseorder;