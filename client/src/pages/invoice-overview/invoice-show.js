import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import ContentLoader, { Code, Facebook } from 'react-content-loader';

import "./invoice-overview.scss";
import { Row, Col, Button, Spinner } from "react-bootstrap";
import Input from "../../components/input/input";
import SelectOption from "../../components/select-option/select-option";
import {
  vehicle_make,
  vehicle_color,
  service_type,
  problem_type,
  pickup_location
} from "../../assets/data/staticdata";

import AuthContext from '../../context/auth/authContext';
import InvoiceContext from '../../context/invoice/invoiceContext';

const Invoiceform = (props) => {
  const authContext = useContext(AuthContext);
  const invoiceContext = useContext(InvoiceContext);
  const { invoice, loading, linkloading, success, error } = invoiceContext;

  const [invoiceData, setInvoiceData] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(loading);
  const [submitLinkLoading, setSubmitLinkLoading] = useState(linkloading);  

  const handleChange = (e) => {
    setInvoiceData({...invoiceData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit Form');
    authContext.refreshSpinnerLoading(true);
    // invoiceContext.toggle_loader(true);
    const invoice_submit = await invoiceContext.update_invoice(invoiceData);
    authContext.refreshSpinnerLoading(false);
    alert('Invoice has been updated!');
  };

  const handleResendLink = async (e) => {
    e.preventDefault();
    console.log('Re send payment link');
    authContext.refreshSpinnerLoading(true);
    invoiceContext.toggle_link_loader(true);
    const invoice_resend = await invoiceContext.resend_invoice({ 
      send_payment_to: invoiceData.send_payment_to, 
      invoice_id: invoiceData.invoice_id,
      payment_email: invoiceData.payment_email,
      phone_number: invoiceData.phone_number
    });
    authContext.refreshSpinnerLoading(false);
    invoiceContext.toggle_link_loader(false);
  }

  const handleResendReceipt = async (e) => {
    e.preventDefault();
    console.log('Re send payment link');
    if (invoice.status === 'Paid' || invoice.status === 'Dispatched') {
      authContext.refreshSpinnerLoading(true);
      // invoiceContext.toggle_link_loader(true);
      const invoice_resend = await invoiceContext.resend_receipt({ 
        send_payment_to: invoiceData.send_payment_to, 
        invoice_id: invoiceData.invoice_id,
        payment_email: invoiceData.payment_email,
        phone_number: invoiceData.phone_number
      });
      authContext.refreshSpinnerLoading(false);
      alert('Invoice receipt has been sent!');
    } else {
      alert('The customer has not paid for the service!');
    }   
  }

  // For first time after update
  useEffect(() => {
    setInvoiceData({ ...invoice });
  }, []);

  // For checking if invoice data is updated or not
  useEffect(() => {
    console.log('Check for changes in invoice in context...');
    setInvoiceData({ ...invoice });
  }, [invoice]);

  // For checking loading value updates
  useEffect(() => {
    console.log('Loading updates');
    setSubmitLoading(loading);
  }, [loading]);

  // For checking link loading value updates
  useEffect(() => {
    console.log('Link loading updates');
    setSubmitLinkLoading(linkloading);
  }, [linkloading]);
  
  // For unmount
  useEffect( () => () => {
    setInvoiceData(null);
    console.log("unmount invoice show");
  }, []);

  const showOverview = () => {
    if (invoiceData !== null) {
      return (
        <section className="invoice-wrap">          
          
          <div className="alert-area">
            Submit this purchase order into DISPATCHING {invoiceData.msa_system || `SYSTEM 1`}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="info-area">
              <h2>Invoice Overview</h2>
              <Row>
                <Col md={12}>
                  <div style={{ marginBottom: '20px', float: 'right' }}>
                    <NavLink activeClassName="active" to="/all-purchase-orders" style={{ }}>
                      <i className="fa fa-file-text-o" aria-hidden="true" />
                      <span>&nbsp;Back to all purchase orders</span>
                    </NavLink>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm={6} lg={4}>
                  <Input
                    type="text"
                    name="invoice_id"
                    value={invoiceData.invoice_id}
                    onChange={handleChange}
                    label="Invoice"
                    disabled
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <SelectOption
                    label="Status"
                    name="status"
                    value={invoiceData.status}
                    onChange={handleChange}
                    options={[
                      "YET_TO_PAY",
                      "VISITED",
                      "PAID",
                      "DISPATCHED"
                    ]}
                  />
                </Col>
                <Col sm={6} lg={4}>
                  <Input
                    type="text"
                    name="amount"
                    value={`${invoiceData.amount || 0}`}
                    onChange={handleChange}
                    label="Amount($)"
                  />
                </Col>
              </Row>
            </div>
            <div className="info-area">
              <h2>Contact Information</h2>
              <Row>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="first_name"
                    value={invoiceData.first_name}
                    onChange={handleChange}
                    label="First Name"
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="last_name"
                    value={invoiceData.last_name}
                    onChange={handleChange}
                    label="Last Name"
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="tel"
                    name="phone_number"
                    value={invoiceData.phone_number}
                    onChange={handleChange}
                    label="Phone Number"
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="email"
                    name="payment_email"
                    value={invoiceData.payment_email}
                    onChange={handleChange}
                    label="Email"
                  />
                </Col>
              </Row>
              <div className="send-payment-link invoice">
                <Row>
                  <Col>
                    <div className="custom-control custom-radio">
                      <input
                        type="radio"
                        className="custom-control-input"
                        id="paymenttophone"
                        name="send_payment_to"
                        onChange={handleChange}
                        value="Phone"
                        checked={invoiceData.send_payment_to === "Phone"}
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
                        name="send_payment_to"
                        onChange={handleChange}
                        value="Email"
                        checked={invoiceData.send_payment_to === "Email"}
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
              <div className="resend-buttons-area">
                <Button
                  variant="info" 
                  type="button" 
                  onClick={handleResendReceipt}
                >
                  resend receipt
                </Button>
                  
                {
                  !submitLinkLoading ? (
                    <Button variant="danger" type="button" onClick={handleResendLink}>
                      resend pay link
                    </Button>
                  ) : (
                    <Button variant="danger" disabled>
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
              </div>
            </div>
            <div className="info-area">
              <h2>Vehicle Info</h2>
              <Row>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="year"
                    value={invoiceData.year}
                    onChange={handleChange}
                    label="Year"
                  />
                </Col>
                <Col sm={6}>
                  <SelectOption
                    label="Make"
                    name="make"
                    value={invoiceData.make}
                    onChange={handleChange}
                    options={vehicle_make}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="model"
                    value={invoiceData.model}
                    onChange={handleChange}
                    label="Model"
                  />
                </Col>
                <Col sm={6}>
                  <SelectOption
                    label="Color"
                    name="color"
                    value={invoiceData.color}
                    onChange={handleChange}
                    options={vehicle_color}
                  />
                </Col>
              </Row>
            </div>
            <div className="info-area">
              <h2>Service Info</h2>
              <Row>
                <Col sm={6}>
                  <SelectOption
                    label="Service Type"
                    name="servicetype"
                    value={invoiceData.service_type}
                    onChange={handleChange}
                    options={service_type}
                    disabled={true}
                  />
                </Col>            
                <Col sm={6}>
                  <SelectOption
                    label="Will anyone be with the vehicle?"
                    name="anyonewithvehicle"
                    value={invoiceData.anyone_with_vehicle}
                    onChange={handleChange}
                    options={["Yes", "No"]}
                    disabled={true}
                  />
                </Col>            
                <Col sm={6}>
                  <SelectOption
                    label="Do you have keys for the vehicle?"
                    name="keysforvehicle"
                    value={invoiceData.keys_for_vehicle}
                    onChange={handleChange}
                    options={["Yes", "No"]}
                    disabled={true}
                  />
                </Col>
                
                {/* Service type towing */}
                { invoiceData.service_type === 'Towing' && (
                  <React.Fragment>
                  <Col sm={6}>
                    <SelectOption
                      label="Will the vehicle go in neutral?"
                      name="neutral"
                      value={invoiceData.is_neutral}
                      onChange={handleChange}
                      options={["Yes", "No"]}
                      disabled={true}
                    />
                  </Col>
                  <Col sm={6}>
                    <SelectOption
                      label="Problem Type"
                      name="problemtype"
                      value={invoiceData.problem_type}
                      onChange={handleChange}
                      options={problem_type}
                      disabled={true}
                    />
                  </Col>            
                  <Col sm={6}>
                    <SelectOption
                      label="Do all four wheels on the vehicle turn?"
                      name="fourwheelsturn"
                      value={invoiceData.four_wheels_turn}
                      onChange={handleChange}
                      options={["Yes", "No"]}
                      disabled={true}
                    />
                  </Col>

                    { invoiceData.four_wheels_turn === 'No' && (
                      <React.Fragment>
                        <Col xl={6}>
                        <SelectOption
                          label="Will both front wheels turn?"
                          name="frontwheelsturn"
                          value={invoiceData.front_wheels_turn}
                          onChange={handleChange}
                          options={["Yes", "No"]}
                          disabled={true}
                        />
                      </Col>
                      <Col xl={6}>
                        <SelectOption
                          label="Will both back wheels turn?"
                          name="backwheelsturn"
                          value={invoiceData.back_wheels_turn}
                          onChange={handleChange}
                          options={["Yes", "No"]}
                          disabled={true}
                        />
                      </Col>
                    </React.Fragment>
                    )}              
                  </React.Fragment>)
                }
                {/* Service type towing */}

              </Row>
            </div>
            <div className="info-area">
              <h2>Location Information</h2>
              <Row>
                <Col sm={6}>
                  <SelectOption
                    label="Pickup Location"
                    name="pickup_location"
                    value={invoiceData.pickup_location || "House"}
                    onChange={handleChange}
                    options={pickup_location}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="pickup_notes"
                    value={invoiceData.pickup_notes}
                    onChange={handleChange}
                    label="Pickup Note"
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="start_address"
                    value={invoiceData.start_address}
                    onChange={handleChange}
                    label="Origin"
                    readOnly={true}
                  />
                </Col>
                { invoiceData.service_type === 'Towing' && (
                <Col sm={6}>
                  <Input
                    type="text"
                    name="end_address"
                    value={invoiceData.end_address}
                    onChange={handleChange}
                    label="Destination"
                    readOnly={true}
                  />
                </Col> )}
              </Row>
              <div className="form-group notes">
                <label>Notes</label>
                <textarea
                  rows="4"
                  name="notes"
                  className="textarea"
                  value={invoiceData.notes}
                  placeholder="Notes"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="info-area">
              <h2>Time Stamps</h2>
              <Row>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="date_opened"
                    value={invoiceData.date_opened}
                    onChange={handleChange}
                    label="Date Opened"
                    disabled={true}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="data_payment_done"
                    value={invoiceData.data_payment_done}
                    onChange={handleChange}
                    label="Time of Payment"
                    disabled={true}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="date_first_link_send"
                    value={invoiceData.date_first_link_send}
                    onChange={handleChange}
                    label="First time payment link was sent"
                    disabled={true}
                  />
                </Col>
                <Col sm={6}>
                  <Input
                    type="text"
                    name="data_last_link_send"
                    value={invoiceData.data_last_link_send}
                    onChange={handleChange}
                    label="Last time payment link was sent"
                    disabled={true}
                  />
                </Col>
              </Row>
              <div className="resend-buttons-area">
                {
                  !submitLoading ? (
                    <Button variant="info" type="submit">
                      Save
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
              </div>
            </div>
          </form>
        </section>
      );
    } else {
      return (<div style={{ marginTop: '20px' }}><Code /></div>);
    }
  }

  return showOverview();
}

export default Invoiceform;