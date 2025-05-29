"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Alert } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { useRouter } from "next/navigation";

const SchoolInfo = () => {
  const router = useRouter();
  const [school, setSchool] = useState({
    school_name: "",
    phone_no: "",
    email_name: "",
    web_address: "",
    address: "",
    account_no: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    logo_image: null,
    logo_file: null,
    contentType: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasExistingSchool, setHasExistingSchool] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");


        if (response.data.success && response.data.data?.length > 0) {
          const schoolData = response.data.data[0];
          const logoUrl = schoolData.logo_image.data;
          setHasExistingSchool(true);

          // Convert base64 logo data to URL if exists
          // let logoUrl = "";
          // if (schoolData.logo_image?.data) {
          //   logoUrl = `data:${schoolData.logo_image.contentType};base64,${schoolData.logo_image.data}`;
          // }

          setSchool({
            ...schoolData,
            logo_file: null,
            logo_image: logoUrl,
          });
        } else {
          setHasExistingSchool(false);
        }
      } catch (error) {
        console.error("Error fetching school data:", error);
        setMessage({
          text: error.response?.data?.message || "Failed to load school information",
          variant: "danger"
        });
      }
    };

    fetchSchoolData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        setSchool(prev => ({
          ...prev,
          logo_file: file,
          logo_image: event.target.result,
          contentType: file.type
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'school_name', 'phone_no', 'email_name', 'account_no',
      'ifsc_code', 'bank_name', 'branch_name', 'address'
    ];

    requiredFields.forEach(field => {
      if (!school[field]) {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    if (school.phone_no && !/^\d{10}$/.test(school.phone_no)) {
      newErrors.phone_no = "Invalid phone number (10 digits required)";
    }

    if (school.email_name && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(school.email_name)) {
      newErrors.email_name = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: "", variant: "" });

    try {
      const formData = new FormData();

      // Append all school data
      const { logo_file, logo_image, contentType, ...schoolData } = school;
      Object.keys(schoolData).forEach(key => {
        formData.append(key, schoolData[key]);
      });

      // Append logo file if selected
      if (school.logo_file) {
        formData.append('logo_image', school.logo_file);
      }

      // const url = "http://localhost:8000/api/schools";
      const url = "https://erp-backend-fy3n.onrender.com/api/schools";
      const method = hasExistingSchool ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({
        text: response.data.message ||
          (hasExistingSchool
            ? "School information updated successfully"
            : "School created successfully"),
        variant: "success"
      });

      setHasExistingSchool(true);
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving school:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to save school information",
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "School Info", link: null }
  ];

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
              <div className="cover-sheet p-3">
                <div className="studentHeading d-flex justify-content-between align-items-center">
                  <h2>School Information</h2>
                  {!isEditMode && hasExistingSchool && (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit School Info
                    </Button>
                  )}
                </div>

                {message.text && (
                  <Alert variant={message.variant} className="mt-3">
                    {message.text}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* School Name */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>School Name</FormLabel>
                      <FormControl
                        type="text"
                        name="school_name"
                        value={school.school_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.school_name && (
                        <Form.Text className="text-danger">{errors.school_name}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Account Number</FormLabel>
                      <FormControl
                        type="text"
                        name="account_no"
                        value={school.account_no}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.account_no && (
                        <Form.Text className="text-danger">{errors.account_no}</Form.Text>
                      )}
                    </Form.Group>
                  </Row>

                  {/* Contact Information */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl
                        type="tel"
                        name="phone_no"
                        value={school.phone_no}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.phone_no && (
                        <Form.Text className="text-danger">{errors.phone_no}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl
                        type="email"
                        name="email_name"
                        value={school.email_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.email_name && (
                        <Form.Text className="text-danger">{errors.email_name}</Form.Text>
                      )}
                    </Form.Group>
                  </Row>

                  {/* Bank Information */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl
                        type="text"
                        name="bank_name"
                        value={school.bank_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.bank_name && (
                        <Form.Text className="text-danger">{errors.bank_name}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl
                        type="text"
                        name="branch_name"
                        value={school.branch_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.branch_name && (
                        <Form.Text className="text-danger">{errors.branch_name}</Form.Text>
                      )}
                    </Form.Group>
                  </Row>

                  {/* IFSC and Web Address */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl
                        type="text"
                        name="ifsc_code"
                        value={school.ifsc_code}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.ifsc_code && (
                        <Form.Text className="text-danger">{errors.ifsc_code}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Website</FormLabel>
                      <FormControl
                        type="text"
                        name="web_address"
                        value={school.web_address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                    </Form.Group>
                  </Row>

                  {/* Address and Logo */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Address</FormLabel>
                      <FormControl
                        as="textarea"
                        rows={3}
                        name="address"
                        value={school.address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.address && (
                        <Form.Text className="text-danger">{errors.address}</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>School Logo</FormLabel>
                      {school.logo_image && (
                        <div className="mb-2">
                          <img
                            src={school.logo_image}
                            alt="School Logo"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        </div>
                      )}
                      {isEditMode && (
                        <FormControl
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      )}
                    </Form.Group>
                  </Row>

                  {isEditMode && (
                    <div className="d-flex gap-2 mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : hasExistingSchool ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsEditMode(false);
                          setErrors({});
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!hasExistingSchool && !isEditMode && (
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        onClick={() => setIsEditMode(true)}
                      >
                        Create School Information
                      </Button>
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

export default SchoolInfo;