"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Preview from "@/app/component/Preview";
import styles from "../school-info/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
export default function Farm() {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    phoneNo: "",
    email: "",
    webAddress: "",
    address: "",
    accountNo: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    logo: null,
  });

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle file input change
  const handleFileChange = (e) => {
    setFormData({ ...formData, logo: e.target.files[0] });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "logo" && formData.logo) {
          data.append(key, formData.logo);
        } else {
          data.append(key, formData[key]);
        }
      });

      // Send POST request to the backend
      const response = await axios.post("school/api/school", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);

      if (response.status === 201) {
        alert("Form submitted successfully!");
        setFormData({
          schoolName: "",
          phoneNo: "",
          email: "",
          webAddress: "",
          address: "",
          accountNo: "",
          ifscCode: "",
          bankName: "",
          branchName: "",
          logo: null,
        });
      } else {
        alert(response.data.message || "Failed to submit the form.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  return (
<Container>
     <Row className='mt-1 mb-1'>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/master-entry/all-module">
                  Master Entry
                </Breadcrumb.Item>
                <Breadcrumb.Item active>School Info</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
    <div className="cover-sheet">
      <div className="studentHeading"><h2>  School Info</h2> </div>
      {!showPreview ? (
        <Form onSubmit={handleSubmit}  className="formSheet" >
         
            <Row>
              <Col lg={4}>
              <FormLabel className="labelForm">  School Name: </FormLabel>
              <FormControl
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">  Phone No: </FormLabel>
              <FormControl
               type="tel"
               name="phoneNo"
               value={formData.phoneNo}
               onChange={handleChange}
               required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">   Email Address: </FormLabel>
              <FormControl
               type="email"
               name="email"
               value={formData.email}
               onChange={handleChange}
               required
              />
              </Col>
            </Row>
            <Row>
            <Col lg={4}>
              <FormLabel className="labelForm">   Web Address: </FormLabel>
              <FormControl
               type="url"
               name="webAddress"
               value={formData.webAddress}
               onChange={handleChange}
               required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">   Address: </FormLabel>
              <FormControl as="textarea" rows={1}
               name="address"
               value={formData.address}
               onChange={handleChange}
               required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">   Account No: </FormLabel>
              <FormControl
               type="text"
               name="accountNo"
               value={formData.accountNo}
               onChange={handleChange}
               required
              />
              </Col>
            </Row>
            <Row>
            <Col lg={4}>
              <FormLabel className="labelForm">    IFSC Code: </FormLabel>
              <FormControl
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">  Bank Name: </FormLabel>
              <FormControl
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              />
              </Col>
              <Col lg={4}>
              <FormLabel className="labelForm">   Branch Name: </FormLabel>
              <FormControl
                 type="text"
                 name="branchName"
                 value={formData.branchName}
                 onChange={handleChange}
                 required
              />
              </Col>

            </Row>
            <Row>
            <Col lg={4}>
              <FormLabel className="labelForm">  Logo Image: </FormLabel>
              <FormControl
                 type="file" name="logo" onChange={handleFileChange} className={styles.file} required
              />
              </Col>
            </Row>
             
            
            <Row>
            <Col lg={12}>
            <div className="d-flex justify-content-between w-100">
          <button className="btn btn-primary mt-4" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button className="btn btn-primary mt-4" type="button" onClick={togglePreview}>
            Preview
          </button>
          </div>
          </Col>
          </Row>
        </Form>
      ) : (
        <Preview data={formData} onEdit={togglePreview} />
      )}   
    </div>
    </Container>
  );
}
