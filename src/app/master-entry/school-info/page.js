"use client";

import { useState } from "react";
import axios from "axios";
import { Form, Row, Col, Button } from "react-bootstrap";

const SchoolInfo = ({ onClose, setData }) => {
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: "",
    address: "",
    contact_number: "",
    principal_name: "",
    email: "",
  });

  const [schoolError, setSchoolError] = useState({});
  const [error, setError] = useState("");

  // Validation function
  const validateForm = () => {
    const errors = {};
    Object.entries(schoolInfo).forEach(([key, value]) => {
      if (!value.trim()) {
        errors[`${key}_error`] = `${key.replace(/_/g, " ")} is required`;
      }
    });
    setSchoolError(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const endpoint = schoolInfo._id
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/school/${schoolInfo._id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/school`;
    const method = schoolInfo._id ? "put" : "post";

    try {
      const response = await axios({
        method,
        url: endpoint,
        data: schoolInfo,
      });
      setData((prev) =>
        schoolInfo._id
          ? prev.map((item) =>
              item._id === schoolInfo._id
                ? { ...item, ...schoolInfo }
                : item
            )
          : [...prev, response.data]
      );
      setSchoolInfo({
        school_name: "",
        address: "",
        contact_number: "",
        principal_name: "",
        email: "",
      });
      onClose(); // Close the form if provided
    } catch (err) {
      console.error("Error submitting form:", err.response || err.message);
      setError("Failed to submit data. Please check the API endpoint.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchoolInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSchoolError((prev) => ({
      ...prev,
      [`${name}_error`]: value ? "" : prev[`${name}_error`],
    }));
  };

  return (
    <div className="container mt-4">
      <h2>School Information Form</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>School Name</Form.Label>
              <Form.Control
                type="text"
                name="school_name"
                value={schoolInfo.school_name}
                onChange={handleChange}
              />
              {schoolError.school_name_error && (
                <div className="text-danger">{schoolError.school_name_error}</div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={schoolInfo.address}
                onChange={handleChange}
              />
              {schoolError.address_error && (
                <div className="text-danger">{schoolError.address_error}</div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contact_number"
                value={schoolInfo.contact_number}
                onChange={handleChange}
              />
              {schoolError.contact_number_error && (
                <div className="text-danger">
                  {schoolError.contact_number_error}
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Principal Name</Form.Label>
              <Form.Control
                type="text"
                name="principal_name"
                value={schoolInfo.principal_name}
                onChange={handleChange}
              />
              {schoolError.principal_name_error && (
                <div className="text-danger">
                  {schoolError.principal_name_error}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={schoolInfo.email}
                onChange={handleChange}
              />
              {schoolError.email_error && (
                <div className="text-danger">{schoolError.email_error}</div>
              )}
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="mt-3">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default SchoolInfo;
