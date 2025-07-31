"use client";
import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Nav, Navbar, NavDropdown, Modal, Button, Form } from "react-bootstrap";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";
import { useDispatch } from 'react-redux';
import { setSessionId } from '@/Redux/Slices/sessionSlice';
import { BASE_URL, getSessions } from '@/Services';
import axios from 'axios';
import useSessionId from '@/hooks/useSessionId';
import { useRouter } from 'next/navigation';

export default function Header({ toggleSidebar, onLogout }) {
  const router = useRouter()
  const selectedSessionId = useSessionId()
  const dispatch = useDispatch()
  const [isDarkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        if (data.success && data.data) {
          let allSessions = [];

          if (Array.isArray(data.data)) {
            allSessions = data.data.map(session => ({
              ...session,
              className: session.class_name || "N/A"
            }));
          } else if (typeof data.data === 'object') {
            allSessions = Object.values(data.data).flatMap(group =>
              group.sessions.map(session => ({
                ...session,
                className: group.class_name || "N/A"
              }))
            );
          }

          setSessions(allSessions);

          const currentSession = allSessions.find(s => s._id === selectedSessionId);
          if (currentSession) {
            setSelectedSession(currentSession);
          } else if (allSessions.length > 0) {
            setSelectedSession(allSessions[0]);
            dispatch(setSessionId(allSessions[0]._id));
          }
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [dispatch, selectedSessionId]);


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
      const response = await axios.post(`${BASE_URL}/api/change-password`, {
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      const result = response.data;
      setMessage(result.message);

      if (result.success) {
        setTimeout(() => {
          setShowModal(false);
          setFormData({
            email: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setMessage("");
        }, 1500);
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Something went wrong. Try again."
      );
    }

  };

  const handleSessionChange = (sessionId) => {
    const session = sessions.find((s) => s._id === sessionId);
    if (session) {
      setSelectedSession(session);
      dispatch(setSessionId(session._id));
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
                      <span className="d-flex align-items-center text-white">
                        {selectedSession ? (
                          <strong>{selectedSession.sessionName}</strong>
                        ) : (
                          <span className="sess">Select Session</span>
                        )}
                      </span>
                    }
                    id="session-dropdown"
                    className="me-2 "
                  >
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <NavDropdown.Item
                          key={session._id}
                          active={selectedSession?._id === session._id}
                          onClick={() => handleSessionChange(session._id)}
                        >
                          {session.sessionName}
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
                      <NavDropdown.Item onClick={() => router.push('/userprofile')}>See Profile</NavDropdown.Item>
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
