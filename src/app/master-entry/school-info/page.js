"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { useRouter } from "next/navigation";
import { BASE_URL, getSchools } from "@/Services";
import { toast } from "react-toastify";

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
    contentType: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasExistingSchool, setHasExistingSchool] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await getSchools()
        if (response.success && response.data?.length > 0) {
          const schoolData = response.data[0];
          const logoUrl = schoolData.logo_image?.data;
          setHasExistingSchool(true);
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
          variant: "danger",
        });
      }
    };

    fetchSchoolData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchool((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchool((prev) => ({
          ...prev,
          logo_file: file,
          logo_image: event.target.result,
          contentType: file.type,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "school_name",
      "phone_no",
      "email_name",
      "account_no",
      "ifsc_code",
      "bank_name",
      "branch_name",
      "address",
    ];

    requiredFields.forEach((field) => {
      if (!school[field]) {
        newErrors[field] = `${field.replace("_", " ")} is required`;
      }
    });

    if (school.phone_no && !/^\d{10}$/.test(school.phone_no)) {
      newErrors.phone_no = "Phone number must be exactly 10 digits";
    }

    if (school.email_name && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(school.email_name)) {
      newErrors.email_name = "Invalid email address format";
    }

    if (school.account_no && !/^\d{9,18}$/.test(school.account_no)) {
      newErrors.account_no = "Account number must be 9 to 18 digits only";
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
      const { logo_file, logo_image, contentType, ...schoolData } = school;

      Object.keys(schoolData).forEach((key) => {
        formData.append(key, schoolData[key]);
      });

      if (school.logo_file) {
        formData.append("logo_image", school.logo_file);
      }

      const url = `${BASE_URL}/api/schools`;
      const method = hasExistingSchool ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response?.message || (hasExistingSchool ? "School info updated" : "School info created"))
      setHasExistingSchool(true);
      setIsEditMode(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving school:", error);
      toast.error(error.response?.data?.message || "Failed to save school information",)
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "School Info", link: null },
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
                    <Button variant="primary" onClick={() => setIsEditMode(true)}>
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
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>School Name</FormLabel>
                      <FormControl
                        type="text"
                        name="school_name"
                        maxLength={100}
                        value={school.school_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.school_name && <Form.Text className="text-danger">{errors.school_name}</Form.Text>}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Account Number</FormLabel>
                      <FormControl
                        type="text"
                        name="account_no"
                        maxLength={18}
                        value={school.account_no}
                        onChange={(e) => {
                          if (/^\d{0,18}$/.test(e.target.value)) handleChange(e);
                        }}
                        readOnly={!isEditMode}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                      />
                      {errors.account_no && <Form.Text className="text-danger">{errors.account_no}</Form.Text>}
                    </Form.Group>
                  </Row>

                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl
                        type="text"
                        name="phone_no"
                        maxLength={10}
                        value={school.phone_no}
                        onChange={(e) => {
                          if (/^\d{0,10}$/.test(e.target.value)) handleChange(e);
                        }}
                        readOnly={!isEditMode}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault();
                        }}
                      />
                      {errors.phone_no && <Form.Text className="text-danger">{errors.phone_no}</Form.Text>}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl
                        type="email"
                        name="email_name"
                        maxLength={100}
                        value={school.email_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.email_name && <Form.Text className="text-danger">{errors.email_name}</Form.Text>}
                    </Form.Group>
                  </Row>

                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl
                        type="text"
                        name="bank_name"
                        maxLength={100}
                        value={school.bank_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.bank_name && <Form.Text className="text-danger">{errors.bank_name}</Form.Text>}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl
                        type="text"
                        name="branch_name"
                        maxLength={100}
                        value={school.branch_name}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.branch_name && <Form.Text className="text-danger">{errors.branch_name}</Form.Text>}
                    </Form.Group>
                  </Row>

                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl
                        type="text"
                        name="ifsc_code"
                        maxLength={11}
                        value={school.ifsc_code}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.ifsc_code && <Form.Text className="text-danger">{errors.ifsc_code}</Form.Text>}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>Website</FormLabel>
                      <FormControl
                        type="text"
                        name="web_address"
                        maxLength={100}
                        value={school.web_address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                    </Form.Group>
                  </Row>

                  <Row className="mb-3">
                    <Form.Group as={Col} md="6">
                      <FormLabel>Address</FormLabel>
                      <FormControl
                        as="textarea"
                        rows={3}
                        name="address"
                        maxLength={300}
                        value={school.address}
                        onChange={handleChange}
                        readOnly={!isEditMode}
                      />
                      {errors.address && <Form.Text className="text-danger">{errors.address}</Form.Text>}
                    </Form.Group>

                    <Form.Group as={Col} md="6">
                      <FormLabel>School Logo</FormLabel>
                      {school.logo_image && (
                        <div className="mb-2">
                          <img src={school.logo_image} alt="School Logo" style={{ maxWidth: "100px", maxHeight: "100px" }} />
                        </div>
                      )}
                      {isEditMode && (
                        <FormControl type="file" accept="image/*" onChange={handleFileChange} />
                      )}
                    </Form.Group>
                  </Row>

                  {isEditMode ? (
                    <div className="d-flex gap-2 mt-4">
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Saving..." : hasExistingSchool ? "Update" : "Create"}
                      </Button>
                      <button
                        className="editButton btn-danger fs-6"
                        onClick={() => {
                          setIsEditMode(false);
                          setErrors({});
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : !hasExistingSchool ? (
                    <div className="mt-4">
                      <Button variant="primary" onClick={() => setIsEditMode(true)}>
                        Create School Information
                      </Button>
                    </div>
                  ) : null}
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
