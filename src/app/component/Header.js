"use client";
import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Nav, Navbar, NavDropdown, Modal, Button, Form } from "react-bootstrap";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";

export default function Header({ toggleSidebar, onLogout }) {
  const [isDarkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const response = await fetch("https://erp-backend-fy3n.onrender.com/api/all-session");
        const data = await response.json();

        if (data.success && data.data) {
          // Handle both possible response formats
          let allSessions = [];

          // Check if data is already an array of sessions
          if (Array.isArray(data.data)) {
            allSessions = data.data.map(session => ({
              ...session,
              className: session.class_name || "N/A"
            }));
          }
          // Check if data is grouped by class (from your SessionMasterPage component)
          else if (typeof data.data === 'object' && !Array.isArray(data.data)) {
            allSessions = Object.values(data.data).flatMap(group =>
              group.sessions.map(session => ({
                ...session,
                className: group.class_name || "N/A"
              }))
            );
          }

          setSessions(allSessions);

          // Set the first session as default if available
          if (allSessions.length > 0) {
            setSelectedSession(allSessions[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await fetch("https://erp-backend-fy3n.onrender.com/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();
      setMessage(result.message);
      if (result.success) {
        setTimeout(() => {
          setShowModal(false);
          setFormData({ email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage("Something went wrong. Try again.");
    }
  };

  const handleSessionChange = (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      setSelectedSession(session);
      // You can add additional logic here to handle session changes
      // For example, update the application state or refresh data
    }
  };

  return (
    <>
      <section className="header">
        <Container>
          <Row className='align-items-center'>
            <Col className="col-md-6">
              <div style={{ display: "flex", alignItems: "center" }}>
                <button className="hamburger" onClick={toggleSidebar}>
                  <GiHamburgerMenu size={24} />
                </button>
                <h3>ERP DASHBOARD</h3>
              </div>
            </Col>
            <Col className="col-md-6">
              <Navbar expand="lg" className="rightNavbar justify-content-end">
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                  {/* Session Dropdown */}
                  <NavDropdown
                    title={
                      <span className="d-flex align-items-center">
                        {loadingSessions ? (
                          <span className="text-muted">Loading sessions...</span>
                        ) : (
                          <>
                            <span className="me-1">Select Session</span>
                            {/* <strong>{selectedSession?.sessionName || "Select"}</strong> */}
                          </>
                        )}
                      </span>
                    }
                    id="session-dropdown"
                    className="me-2"
                  >
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <NavDropdown.Item
                          key={session._id}
                          active={selectedSession?._id === session._id}
                          onClick={() => handleSessionChange(session._id)}
                        >
                          <div className="d-flex">
                            <span>{session.sessionName}</span>
                            {/* <small className="text-muted">{session.className}</small> */}
                          </div>
                        </NavDropdown.Item>
                      ))
                    ) : (
                      <NavDropdown.Item disabled>No sessions available</NavDropdown.Item>
                    )}
                  </NavDropdown>


                  <Nav>
                    <Nav.Link href="#link">
                      <DarkModeSwitch
                        style={{ marginBottom: '0rem' }}
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        size={20}
                      />
                    </Nav.Link>

                    <NavDropdown
                      title={
                        <span>
                          <Image
                            src="/user.png"
                            alt="dropdown icon"
                            style={{ marginRight: "8px" }}
                            width={25}
                            height={25}
                          />
                        </span>
                      }
                      id="basic-nav-dropdown"
                    >
                      <NavDropdown.Item onClick={() => setShowModal(true)}>Change Password</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={onLogout}>Log out</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Change Password Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Form.Group>
            {message && <p style={{ color: "red" }}>{message}</p>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}