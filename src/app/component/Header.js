import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
export default function Header() {
  const [isDarkMode, setDarkMode] = React.useState(false);
  const toggleDarkMode = (checked, boolean) => {
    setDarkMode(checked);
  };
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);
  return (
    <>
      <section className="header">
        <Container>
          <Row className='align-items-center'>
            <Col className="col-md-6"><h3>ERP DASHBOARD</h3></Col>
            <Col className="col-md-6">
              <Navbar expand="lg" className="rightNavbar justify-content-end">
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                  <Nav className="">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#link">
                      <DarkModeSwitch
                        style={{ marginBottom: '0rem' }}
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        size={20} />
                    </Nav.Link>
                    <NavDropdown title={<span><img src="/user.png" alt="dropdown icon" style={{ marginRight: "8px" }} />  User Name </span>} id="basic-nav-dropdown">
                      <NavDropdown.Item href="#">Action</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#">
                        Another action
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#">Something</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#">
                        Separated link
                      </NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

