"use client";
import React, { useState } from "react";
// import Table from "@/app/component/DataTable";
import styles from "@/app/master-entry/school-info/page.module.css";
import Preview from "@/app/component/Preview";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, Button } from "react-bootstrap";

const GatePassEntry = () => {
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    todayDate: new Date().toISOString().split("T")[0],
    formNo: "1",
    personName: "",
    companyDetails: "",
    emailId: "",
    mobileNo: "",
    purpose: "",
    address: "",
    remark: "",
    itemDetails: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Form Submitted Successfully");
  };

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };
  return (
    <>
      <Container>
        <Row>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/transport">Front Office Module</Breadcrumb.Item>
              <Breadcrumb.Item active>Gate Pass Entry</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row>
          <Col>

            
              <div className="cover-sheet">
                <div className="studentHeading"><h2>Gate Pass Entry</h2>  </div>
                <Form className="formSheet" onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6" controlId="validationCustom01">
                      <FormLabel className="labelForm">Today Date </FormLabel>
                      <FormControl
                        required
                        type="date"
                        value={formData.todayDate}
                        onChange={handleChange}
                      />
                    </FormGroup>
                    <FormGroup as={Col} md="6" controlId="validationCustom02">
                      <FormLabel className="labelForm">Purpose *</FormLabel>
                      <FormControl
                        required
                        as="textarea"
                        value={formData.purpose}
                        onChange={handleChange}
                        rows={1}
                      />
                    </FormGroup>
                  </Row>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6" controlId="validationCustom01">
                      <FormLabel className="labelForm">Form No.</FormLabel>
                      <FormControl
                        required
                        type="text"
                        value={formData.formNo}
                        onChange={handleChange}
                      />
                    </FormGroup>
                    <FormGroup as={Col} md="6" controlId="validationCustom02">
                      <FormLabel className="labelForm">Address *</FormLabel>
                      <FormControl
                        required
                        as="textarea"
                        value={formData.address}
                        onChange={handleChange}
                        rows={1}
                      />
                    </FormGroup>
                  </Row>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6" controlId="validationCustom01">
                      <FormLabel className="labelForm">Company Details *</FormLabel>
                      <FormControl
                        required
                        type="text"
                        value={formData.companyDetails}
                        onChange={handleChange}  />
                    </FormGroup>
                    <FormGroup as={Col} md="6" controlId="validationCustom02">
                      <FormLabel className="labelForm">Item In Details *</FormLabel>
                      <FormControl
                        required
                        as="textarea"
                        value={formData.itemDetails}
                        onChange={handleChange}
                        rows={1} />
                    </FormGroup>
                  </Row>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6" controlId="validationCustom02">
                      <FormLabel className="labelForm">Email Id *</FormLabel>
                      <FormControl
                        required
                        type="text"
                        value={formData.emailId}
                        onChange={handleChange}/>
                    </FormGroup>
                  </Row>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6" controlId="validationCustom02">
                      <FormLabel className="labelForm">MobileNo *</FormLabel>
                      <FormControl
                        required
                        type="text"
                        value={formData.mobileNo}
                        onChange={handleChange} />
                    </FormGroup>
                  </Row>
                </Form>
              </div>

            <div className={styles.buttons}>
              <Button className={styles.btnn} type="button" onClick={togglePreview}>Preview</Button>
              <Button className={styles.btnn} type="submit">Submit</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GatePassEntry;
