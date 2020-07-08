import React, {useState} from "react";
import "./header.scss";
import { Container, Row, Col } from "react-bootstrap";
import logo from "../../assets/img/logo.png";
import HeaderNav from "../headernav/headernav";
import SidebarNav from "../sidebarnav/sidebarnav";

function Header(props) {

  const initialState = {
    barClicked: false
  }

  const [header, setHeader] = useState(initialState);

  const openNav = () => {
    setHeader({
      ...header,
      barClicked: !header.barClicked
    })
  }
  return (
    <header className="main-header">
      <Container fluid={true}>
        <Row className="align-items-center">
          <Col xs={9}>
            <figure className="logo">
              <img src={logo} alt="logo" className="img-fluid" />
              <figcaption>Roadside Assistance</figcaption>
            </figure>
          </Col>
          <Col xs={3}>
            <div className="header-bars">
              <i className={ header.barClicked ? "fa fa-times" : "fa fa-bars"} aria-hidden="true" onClick={openNav} />
              <div className={ header.barClicked ? "drop-nav open" : "drop-nav"}>
                <HeaderNav />
                <SidebarNav/>
              </div>
            </div>
            <nav className="top-right">
              <HeaderNav loading={props.loading} />
            </nav>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default Header;
