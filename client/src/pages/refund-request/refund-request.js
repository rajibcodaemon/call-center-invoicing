import React from "react";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import { Row, Col, Container } from "react-bootstrap";

function RefundRequest() {
  return (
    <React.Fragment>
      <Header />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part">
            <h1>Refund Request</h1>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}

export default RefundRequest;
