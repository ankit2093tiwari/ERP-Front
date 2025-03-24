"use client";

import { useState } from "react";
import axios from "axios";
import styles from "../school-info/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

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
  const [responseMessage, setResponseMessage] = useState("");

  const validateForm = () => {
    const validationErrors = {};
    Object.entries(school).forEach(([key, value]) => {
      if (["school_name", "phone_no", "email_name", "web_address", "address_name", "account_no", "ifsc_code", "bank_name", "branch_name"].includes(key)) {
        if (!value || (typeof value === "object" && !Object.values(value).some(Boolean))) {
          const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
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
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setResponseMessage("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SITE_URL}/api/schools`, school);
      setResponseMessage(response.data.message || "School information saved successfully.");
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
    } catch (err) {
      console.error("Error submitting data:", err.response || err.message);
      setResponseMessage("Failed to submit data. Please check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [{ label: "Master Entry", link: "/master-entry/all-module" }, { label: "School-info", link: "null" }]

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <Row>
            <Col>
              <div className="cover-sheet">
                <div className="studentHeading">
                  <h2>School Info</h2>
                </div>
                <Form className="formSheet" onSubmit={handleSubmit}>
                  <Row className="">
                    <Form.Group as={Col} md="6">
                      <FormLabel>School Name</FormLabel>
                      <FormControl
                        type="text"
                        name="school_name"
                        value={school.school_name}
                        onChange={handleChange}
                        placeholder="Enter school name" />
                      <p className="error">{errors.school_name_error}</p>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                      <FormLabel>Account No:</FormLabel>
                      <FormControl
                        type="text"
                        name="account_no"
                        value={school.account_no}
                        onChange={handleChange}
                        placeholder="Enter account number" />
                      <p className="error">{errors.account_no_error}</p>
                    </Form.Group>
                  </Row>
                  <Row className="">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Phone No:</FormLabel>
                      <FormControl
                        type="tel"
                        name="phone_no"
                        value={school.phone_no}
                        onChange={handleChange}
                        placeholder="Enter phone number" />
                      <p className="error">{errors.phone_no_error}</p>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                      <FormLabel>IFSC Code:</FormLabel>
                      <FormControl
                        type="text"
                        name="ifsc_code"
                        value={school.ifsc_code}
                        onChange={handleChange}
                        placeholder="Enter IFSC code" />
                      <p className="error">{errors.ifsc_code_error}</p>
                    </Form.Group>
                  </Row>

                  <Row className="">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Email Address:</FormLabel>
                      <FormControl
                        type="email"
                        name="email_name"
                        value={school.email_name}
                        onChange={handleChange}
                        placeholder="Enter email address" />
                      <p className="error">{errors.email_name_error}</p>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                      <FormLabel>Bank Name:</FormLabel>
                      <FormControl
                        type="text"
                        name="bank_name"
                        value={school.bank_name}
                        onChange={handleChange}
                        placeholder="Enter bank name" />
                      <p className="error">{errors.bank_name_error}</p>
                    </Form.Group>
                  </Row>

                  <Row className="">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Web Address:</FormLabel>
                      <FormControl
                        type="text"
                        name="web_address"
                        value={school.web_address}
                        onChange={handleChange}
                        placeholder="Enter web address" />
                      <p className="error">{errors.web_address_error}</p>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                      <FormLabel>Branch Name:</FormLabel>
                      <FormControl
                        type="text"
                        name="branch_name"
                        value={school.branch_name}
                        onChange={handleChange}
                        placeholder="Enter branch name" />
                      <p className="error">{errors.branch_name_error}</p>
                    </Form.Group>
                  </Row>

                  <Row className="">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Address:</FormLabel>
                      <FormControl
                        type="text"
                        name="address_name"
                        value={school.address_name}
                        onChange={handleChange}
                        placeholder="Enter address" />
                      <p className="error">{errors.address_name_error}</p>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                      <FormLabel>Logo:</FormLabel>
                      <FormControl
                        type="file"
                        name="logo_name"
                        onChange={handleFileChange}
                      />
                    </Form.Group>
                  </Row>
                  <Button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                  {responseMessage && <p className="mt-3">{responseMessage}</p>}
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default SchoolInfo;
