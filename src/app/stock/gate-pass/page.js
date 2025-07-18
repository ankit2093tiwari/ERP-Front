"use client";
import React, { useState } from "react";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewGatePass } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const GatePassEntry = () => {
  const { hasSubmitAccess } = usePagePermission()
  const [formData, setFormData] = useState({
    todayDate: new Date().toISOString().split("T")[0],
    personName: "",
    companyDetails: "",
    emailId: "",
    mobileNo: "",
    purpose: "",
    address: "",
    remark: "",
    itemDetails: "",
  });

  const [errors, setErrors] = useState({});

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Gate Pass", link: "null" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyDetails) newErrors.companyDetails = "Company Details is required";
    if (!formData.emailId || !/\S+@\S+\.\S+/.test(formData.emailId)) newErrors.emailId = "Valid Email is required";
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo)) newErrors.mobileNo = "Valid 10-digit mobile number is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.itemDetails) newErrors.itemDetails = "Item details are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      console.log(formData);

      const response = await addNewGatePass(formData)
      toast.success("Gate Pass submitted successfully");
      // Reset form
      setFormData({
        todayDate: new Date().toISOString().split("T")[0],
        personName: "",
        companyDetails: "",
        emailId: "",
        mobileNo: "",
        purpose: "",
        address: "",
        remark: "",
        itemDetails: "",
      });
    } catch (error) {
      console.error("Error submitting gate pass:", error);
      toast.error(error.response?.data?.message || "Failed to submit Gate Pass.");
    }
  };


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
                <div className="studentHeading"><h2>Gate Pass Entry</h2></div>

                <Form className="formSheet" onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Today Date</FormLabel>
                      <FormControl
                        type="date"
                        name="todayDate"
                        value={formData.todayDate}
                        onChange={handleChange}

                      />
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Purpose <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        as="textarea"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        isInvalid={!!errors.purpose}
                        rows={1}
                      />
                      <FormControl.Feedback type="invalid">{errors.purpose}</FormControl.Feedback>
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Company Details <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        type="text"
                        name="companyDetails"
                        value={formData.companyDetails}
                        onChange={handleChange}
                        isInvalid={!!errors.companyDetails}

                      />
                      <FormControl.Feedback type="invalid">{errors.companyDetails}</FormControl.Feedback>
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Item In Details <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        as="textarea"
                        name="itemDetails"
                        value={formData.itemDetails}
                        onChange={handleChange}
                        isInvalid={!!errors.itemDetails}
                        rows={1}

                      />
                      <FormControl.Feedback type="invalid">{errors.itemDetails}</FormControl.Feedback>
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Email Id <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        type="email"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleChange}
                        isInvalid={!!errors.emailId}

                      />
                      <FormControl.Feedback type="invalid">{errors.emailId}</FormControl.Feedback>
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Mobile No <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        type="text"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={handleChange}
                        isInvalid={!!errors.mobileNo}

                      />
                      <FormControl.Feedback type="invalid">{errors.mobileNo}</FormControl.Feedback>
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Address <span className="text-danger">*</span></FormLabel>
                      <FormControl
                        as="textarea"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        isInvalid={!!errors.address}
                        rows={1}
                      />
                      <FormControl.Feedback type="invalid">{errors.address}</FormControl.Feedback>
                    </FormGroup>

                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Remark</FormLabel>
                      <FormControl
                        type="text"
                        name="remark"
                        value={formData.remark}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Row>

                  <Row className="mb-3">
                    <FormGroup as={Col} md="6">
                      <FormLabel className="labelForm">Person Name</FormLabel>
                      <FormControl
                        type="text"
                        name="personName"
                        value={formData.personName}
                        onChange={handleChange}
                      />
                    </FormGroup>
                  </Row>

                  {hasSubmitAccess && (
                    <div>
                      <Button variant="success" type="submit">Submit</Button>
                    </div>
                  )}
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default GatePassEntry;
