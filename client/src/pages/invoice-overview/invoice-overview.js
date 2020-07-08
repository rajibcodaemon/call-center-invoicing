import React, { useState, useEffect, useContext } from "react";

import "./invoice-overview.scss";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Button, Container } from "react-bootstrap";

import AuthContext from '../../context/auth/authContext';
import InvoiceContext from '../../context/invoice/invoiceContext';
import Invoiceform from './invoice-show';

function InvoiceOverview(props) {
  const authContext = useContext(AuthContext);
  const invoiceContext = useContext(InvoiceContext);
  const invoice_id = props.match.params.invoice_id;

  const { invoice, loading } = invoiceContext;
  let interval;

  const showOverview = () => {
    if (invoice !== null) {
      return <Invoiceform />;
    } else {
      return <div></div>
    }
  }
  
  useEffect(() => {

    const fetchInvoiceData = async () => {
      authContext.refreshSpinnerLoading(true);
      const invoice_data = await invoiceContext.get_invoice_info(invoice_id);
      authContext.refreshSpinnerLoading(false);
    };

    // Checks for status updates every 3 minutes
    interval = window.setInterval(() => {
      console.log('Fetch update from invoice details..');
      fetchInvoiceData();
    }, 180000);

    fetchInvoiceData();
  }, []);

  // For unmount
  useEffect( () => () => {
    invoiceContext.clear_invoice();
    window.clearInterval(interval);
    console.log("unmount invoice overview");
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
            {/* <Alert variant="success" style={{ marginTop: '20px'}}>
              This is a alert—check it out!
            </Alert> */}

            { showOverview() }
          {/* </Col>
        </Row>
      </Container> */}
    </React.Fragment>
  );
}

export default InvoiceOverview;
