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
    email_address: "",
    web_address: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip_code: ""
    },
    account_no: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    logo_image_url: "",
    logo_file: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");
        
        // Handle both response formats (single object or array)
        const schoolData = response.data.data?.[0] || response.data.data;
        
        if (schoolData) {
          setSchool({
            ...schoolData,
            address: schoolData.address || {  // Ensure address exists
              street: "",
              city: "",
              state: "",
              zip_code: ""
            },
            logo_file: null
          });
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
    
    // Handle nested address fields
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setSchool(prev => ({
        ...prev,
        address: {
          ...(prev.address || {}),  // Ensure address exists
          [field]: value
        }
      }));
    } else {
      setSchool(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field changes
    setErrors(prev => ({ ...prev, [name.split('.')[0]]: "" }));
  };

  const handleFileChange = (e) => {
    setSchool(prev => ({ ...prev, logo_file: e.target.files[0] }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'school_name', 'phone_no', 'email_address', 'account_no',
      'ifsc_code', 'bank_name', 'branch_name'
    ];

    requiredFields.forEach(field => {
      if (!school[field]) {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    // Validate address
    if (!school.address || 
        !school.address.street || 
        !school.address.city || 
        !school.address.state || 
        !school.address.zip_code) {
      newErrors.address = "Complete address is required";
    }

    // Validate phone format
    if (school.phone_no && !/^\d{10}$/.test(school.phone_no)) {
      newErrors.phone_no = "Invalid phone number (10 digits required)";
    }

    // Validate email format
    if (school.email_address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(school.email_address)) {
      newErrors.email_address = "Invalid email address";
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
      
      // Append all school data to formData
      Object.keys(school).forEach(key => {
        if (key === 'address') {
          formData.append('address', JSON.stringify(school.address || {}));
        } else if (key !== 'logo_file' && key !== 'logo_image_url') {
          formData.append(key, school[key]);
        }
      });

      // Append logo file if selected
      if (school.logo_file) {
        formData.append('logo', school.logo_file);
      }

      // Determine if we're creating or updating
      const hasExistingSchool = school._id;
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
      
      setIsEditMode(false);
      router.refresh(); // Refresh to get updated data
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
                  {!isEditMode && (
                    <Button 
                      variant="primary" 
                      onClick={() => setIsEditMode(true)}
                      disabled={!school._id} // Only allow edit if school exists
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
                        name="email_address"
                        value={school.email_address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                      {errors.email_address && (
                        <Form.Text className="text-danger">{errors.email_address}</Form.Text>
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
                        type="url"
                        name="web_address"
                        value={school.web_address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                    </Form.Group>
                  </Row>

                  {/* Address Fields */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="3">
                      <FormLabel>Street</FormLabel>
                      <FormControl
                        type="text"
                        name="address.street"
                        value={school.address?.street || ""}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group as={Col} md="3">
                      <FormLabel>City</FormLabel>
                      <FormControl
                        type="text"
                        name="address.city"
                        value={school.address?.city || ""}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group as={Col} md="3">
                      <FormLabel>State</FormLabel>
                      <FormControl
                        type="text"
                        name="address.state"
                        value={school.address?.state || ""}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group as={Col} md="3">
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl
                        type="text"
                        name="address.zip_code"
                        value={school.address?.zip_code || ""}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                        required
                      />
                    </Form.Group>
                    {errors.address && (
                      <Form.Text className="text-danger">{errors.address}</Form.Text>
                    )}
                  </Row>

                  {/* Logo Upload */}
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>School Logo</FormLabel>
                      {school.logo_image_url && (
                        <div className="mb-2">
                          <img 
                            src={school.logo_image_url} 
                            alt="School Logo" 
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        </div>
                      )}
                      <FormControl
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={!isEditMode}
                      />
                    </Form.Group>
                  </Row>

                  {isEditMode && (
                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : school._id ? 'Update' : 'Create'}
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