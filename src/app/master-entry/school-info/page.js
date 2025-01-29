"use client";

import { useState } from "react";
import axios from "axios";
import styles from "../school-info/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";

const SchoolInfo = () => {
  const [school, setSchool] = useState({
    school_name: "",
    phone_no: "",
    email_name: "",
    web_address: "",
    address_name: "",
    account_no: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    logo_name: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(""); // Define the state for response message


  const validateForm = () => {
    const validationErrors = {};
    Object.entries(school).forEach(([key, value]) => {
      if (
        key === "school_name" ||
        key === "phone_no" ||
        key === "email_name" ||
        key === "web_address" ||
        key === "address_name" ||
        key === "account_no" ||
        key === "ifsc_code" ||
        key === "bank_name" ||
        key === "branch_name"
      ) {
        if (!value || (typeof value === "object" && !Object.values(value).some(Boolean))) {
          const formattedKey = key
            .replace(/_/g, " ")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          validationErrors[`${key}_error`] = `${formattedKey} is required`;
        }
      }
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`${name}_error`]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSchool((prev) => ({ ...prev, logo_name: file }));
    setErrors((prev) => ({ ...prev, logo_name_error: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!validateForm()) return;

    const endpoint = school._id
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/schools/${school._id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/schools`;
    const method = school._id ? "put" : "post";

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(school).forEach(([key, value]) => {
        if (key === "logo_name" && value) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      });

      const response = await axios[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.status) {
        setData((prev) =>
          school._id
            ? prev.map((row) => (row._id === school._id ? { ...row, ...school } : row))
            : [...prev, response.data]
        );

        setSchool({
          school_name: "",
          phone_no: "",
          email_name: "",
          web_address: "",
          address_name: "",
          account_no: "",
          ifsc_code: "",
          bank_name: "",
          branch_name: "",
          logo_name: null,
        });
        setErrors({});
        setResponseMessage("Form submitted successfully!");
      } else {
        setResponseMessage(response.data.message || "Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting data:", error.response || error?.data?.message);
      setResponseMessage("Failed to submit data. Please check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
            <Breadcrumb.Item active>School Info</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>School Info</h2>
        </div>
        <Form onSubmit={handleSubmit} className={styles.formSheet}>
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">School Name:</FormLabel>
              <FormControl
                type="text"
                name="school_name"
                value={school.school_name}
                onChange={handleChange}
              />
              <p className="error">{errors.school_name_error}</p>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Phone No:</FormLabel>
              <FormControl
                type="tel"
                name="phone_no"
                value={school.phone_no}
                onChange={handleChange}
              />
              <p className="error">{errors.phone_no_error}</p>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">Email:</FormLabel>
              <FormControl
                type="email"
                name="email_name"
                value={school.email_name}
                onChange={handleChange}
              />
              <p className="error">{errors.email_name_error}</p>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Web Address:</FormLabel>
              <FormControl
                type="text"
                name="web_address"
                value={school.web_address}
                onChange={handleChange}
              />
              <p className="error">{errors.web_address_error}</p>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">Address:</FormLabel>
              <FormControl
                type="text"
                name="address_name"
                value={school.address_name}
                onChange={handleChange}
              />
              <p className="error">{errors.address_name_error}</p>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Account No:</FormLabel>
              <FormControl
                type="text"
                name="account_no"
                value={school.account_no}
                onChange={handleChange}
              />
              <p className="error">{errors.account_no_error}</p>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">IFSC Code:</FormLabel>
              <FormControl
                type="text"
                name="ifsc_code"
                value={school.ifsc_code}
                onChange={handleChange}
              />
              <p className="error">{errors.ifsc_code_error}</p>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Bank Name:</FormLabel>
              <FormControl
                type="text"
                name="bank_name"
                value={school.bank_name}
                onChange={handleChange}
              />
              <p className="error">{errors.bank_name_error}</p>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">Branch Name:</FormLabel>
              <FormControl
                type="text"
                name="branch_name"
                value={school.branch_name}
                onChange={handleChange}
              />
              <p className="error">{errors.branch_name_error}</p>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Logo:</FormLabel>
              <FormControl type="file" name="logo_name" onChange={handleFileChange} />
              {/* {/ <p className="error">{errors.logo_name_error}</p> /} */}
            </Col>
          </Row>
          <Button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default SchoolInfo;
