"use client";
import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";

export default function Header({ toggleSidebar }) {
  const [isDarkMode, setDarkMode] = useState(false);

  const toggleDarkMode = (checked) => {
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
            <Col className="col-md-6">
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Toggle Sidebar Icon */}
                <button className="hamburger" onClick={toggleSidebar}>
                  <GiHamburgerMenu size={24} />
                </button>
                <h3>ERP DASHBOARD</h3>
              </div>
            </Col>
            <Col className="col-md-6">
              <Navbar expand="lg" className="rightNavbar justify-content-end">
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                  <Nav className="">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#link">
                      <DarkModeSwitch style={{ marginBottom: '0rem' }} checked={isDarkMode} onChange={toggleDarkMode} size={20} />
                    </Nav.Link>
                    <NavDropdown title={<span><Image src="/user.png" alt="dropdown icon" style={{ marginRight: "8px" }} width={25} height={25} />  User Name </span>} id="basic-nav-dropdown">
                      <NavDropdown.Item href="#">Change Password</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#">Log out</NavDropdown.Item>
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