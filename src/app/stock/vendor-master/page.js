"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect, Alert, FormGroup } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { deleteVendorRecordById, getAllVendors, getItemCategories, updateVendor, addNewVendor } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const VendorMaster = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  // State management
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    contactPersonName: "",
    organizationAddress: "",
    statusOfEnterprise: "",
    itemCategory: "",
    organizationWebsite: "",
    tinNumber: "",
    contactNumber: "",
    panNumber: "",
    email: "",
    gstNumber: "",
    remark: "",
    exciseRegistrationNumber: "",
    bankAccountNumber: "",
    bankersNameWithAddress: "",
    ifscCode: ""
  });

  // Options for select fields
  const organizationTypeOptions = [
    { value: "Manufacture", label: "Manufacture" },
    { value: "Distributor", label: "Distributor" },
    { value: "Super Stockiest", label: "Super Stockiest" },
    { value: "Dealer", label: "Dealer" },
    { value: "Retailer", label: "Retailer" },
  ];

  const statusOfEnterpriseOptions = [
    { value: "Proprietorship", label: "Proprietorship" },
    { value: "Partnership", label: "Partnership" },
    { value: "PVT LTD CO", label: "PVT LTD CO" },
    { value: "LTD CO", label: "LTD CO" },
    { value: "Others", label: "Others" },
  ];

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Organization Name",
      selector: (row) => row.organizationName || "N/A",
      sortable: true,
    },
    {
      name: "Organization Type",
      selector: (row) => row.organizationType || "N/A",
      sortable: true,
    },
    {
      name: "Organization Address",
      selector: (row) => row.organizationAddress || "N/A",
      sortable: true,
    },
    {
      name: "Contact Person",
      selector: (row) => row.contactPersonName || "N/A",
      sortable: true,
    },
    {
      name: "Contact Number",
      selector: (row) => row.contactNumber || "N/A",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vendorsResponse, categoriesResponse] = await Promise.all([
        getAllVendors(),
        getItemCategories()
      ]);
      setData(vendorsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (vendor) => {
    setIsEditing(true);
    setCurrentVendorId(vendor._id);
    setFormData({
      organizationName: vendor.organizationName,
      organizationType: vendor.organizationType,
      contactPersonName: vendor.contactPersonName,
      organizationAddress: vendor.organizationAddress,
      statusOfEnterprise: vendor.statusOfEnterprise,
      itemCategory: vendor.itemCategory._id || vendor.itemCategory,
      organizationWebsite: vendor.organizationWebsite,
      tinNumber: vendor.tinNumber,
      contactNumber: vendor.contactNumber,
      panNumber: vendor.panNumber,
      email: vendor.email,
      gstNumber: vendor.gstNumber,
      remark: vendor.remark,
      exciseRegistrationNumber: vendor.exciseRegistrationNumber,
      bankAccountNumber: vendor.bankAccountNumber,
      bankersNameWithAddress: vendor.bankersNameWithAddress,
      ifscCode: vendor.ifscCode
    });
    setIsFormOpen(true);
    setErrors({});
  };

  // Handle add new vendor action
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentVendorId(null);
    resetForm();
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      if (isEditing) {
        const response = await updateVendor(currentVendorId, formData);
        toast.success(response.message || "Vendor updated successfully");
      } else {
        const existingVendor = data.find(
          (vendor) => vendor.organizationName === formData.organizationName
        );
        if (existingVendor) {
          setError("Vendor name already exists.");
          return;
        }
        const response = await addNewVendor(formData);
        toast.success(response.message || "Vendor added successfully");
      }

      fetchData();
      setIsFormOpen(false);
      resetForm();
      setError("");
    } catch (error) {
      toast.error(error.response?.data?.message ||
        (isEditing ? "Failed to update vendor" : "Failed to add vendor"));
      console.error("Error:", error);
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await deleteVendorRecordById(id);
        toast.success(response.message || "Vendor deleted successfully");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete vendor");
        console.error("Error deleting data:", error);
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      organizationName: "",
      organizationType: "",
      contactPersonName: "",
      organizationAddress: "",
      statusOfEnterprise: "",
      itemCategory: "",
      organizationWebsite: "",
      tinNumber: "",
      contactNumber: "",
      panNumber: "",
      email: "",
      gstNumber: "",
      remark: "",
      exciseRegistrationNumber: "",
      bankAccountNumber: "",
      bankersNameWithAddress: "",
      ifscCode: ""
    });
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Required fields validation
    if (!formData.organizationName) {
      newErrors.organizationName = "Organization name is required";
      isValid = false;
    }
    if (!formData.itemCategory) {
      newErrors.itemCategory = "Item category is required";
      isValid = false;
    }
    if (!formData.statusOfEnterprise) {
      newErrors.statusOfEnterprise = "Enterprise status is required";
      isValid = false;
    }
    if (!formData.contactPersonName) {
      newErrors.contactPersonName = "Contact person name is required";
      isValid = false;
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Organization type is required";
      isValid = false;
    }
    if (!formData.organizationAddress) {
      newErrors.organizationAddress = "Organization address is required";
      isValid = false;
    }

    // Contact number validation
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // GST validation if provided
    if (formData.gstNumber && !/^[0-9A-Z]{15}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "GST number must be 15 alphanumeric characters";
      isValid = false;
    }

    // PAN validation if provided
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "PAN number must be in format AAAAA9999A";
      isValid = false;
    }

    // TIN validation if provided
    if (formData.tinNumber && !/^[0-9]{11}$/.test(formData.tinNumber)) {
      newErrors.tinNumber = "TIN number must be 11 digits";
      isValid = false;
    }

    // IFSC validation if provided
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC code format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle print action
  const handlePrint = () => {
    const tableHeaders = [["#", "Organization", "Type", "Status", "Category", "Contact Person"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.organizationName,
      row.organizationType,
      row.statusOfEnterprise,
      row.itemCategory?.categoryName || "N/A",
      row.contactPersonName
    ]);
    printContent(tableHeaders, tableRows);
  };

  // Handle copy action
  const handleCopy = () => {
    const headers = ["#", "Organization", "Type", "Status", "Category", "Contact Person"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.organizationName}\t${row.organizationType}\t${row.statusOfEnterprise}\t${row.itemCategory?.categoryName || "N/A"}\t${row.contactPersonName}`
    );
    copyContent(headers, rows);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Vendor Master", link: "null" }
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
          {hasSubmitAccess &&(
            <Button onClick={handleAddNew} className="btn-add">
            <CgAddR /> Add Vendor
          </Button>
          )}

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="organizationName">
                      <Form.Label className="labelForm">Organization Name<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        isInvalid={!!errors.organizationName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organizationName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="organizationType">
                      <Form.Label className="labelForm">Organization Type<span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleChange}
                        isInvalid={!!errors.organizationType}
                      >
                        <option value="">Select</option>
                        {organizationTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.organizationType}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="contactPersonName">
                      <Form.Label className="labelForm">Contact Person Name<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={handleChange}
                        isInvalid={!!errors.contactPersonName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contactPersonName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="statusOfEnterprise">
                      <Form.Label className="labelForm">Status Of Enterprise<span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="statusOfEnterprise"
                        value={formData.statusOfEnterprise}
                        onChange={handleChange}
                        isInvalid={!!errors.statusOfEnterprise}
                      >
                        <option value="">Select</option>
                        {statusOfEnterpriseOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.statusOfEnterprise}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="contactNumber">
                      <Form.Label className="labelForm">Contact Number<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        maxLength={10}
                        isInvalid={!!errors.contactNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contactNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="email">
                      <Form.Label className="labelForm">Email<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="itemCategory">
                      <Form.Label className="labelForm">Item Category<span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="itemCategory"
                        value={formData.itemCategory}
                        onChange={handleChange}
                        isInvalid={!!errors.itemCategory}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.itemCategory}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="organizationAddress">
                      <Form.Label className="labelForm">Organization Address<span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="organizationAddress"
                        value={formData.organizationAddress}
                        onChange={handleChange}
                        isInvalid={!!errors.organizationAddress}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organizationAddress}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="gstNumber">
                      <Form.Label className="labelForm">GST Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        maxLength={15}
                        isInvalid={!!errors.gstNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.gstNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="panNumber">
                      <Form.Label className="labelForm">PAN Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                        maxLength={10}
                        isInvalid={!!errors.panNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.panNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="tinNumber">
                      <Form.Label className="labelForm">TIN Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="tinNumber"
                        value={formData.tinNumber}
                        onChange={handleChange}
                        maxLength={11}
                        isInvalid={!!errors.tinNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.tinNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="organizationWebsite">
                      <Form.Label className="labelForm">Website</Form.Label>
                      <Form.Control
                        type="text"
                        name="organizationWebsite"
                        value={formData.organizationWebsite}
                        onChange={handleChange}
                        isInvalid={!!errors.organizationWebsite}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.organizationWebsite}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="bankAccountNumber">
                      <Form.Label className="labelForm">Bank Account Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        isInvalid={!!errors.bankAccountNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.bankAccountNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="bankersNameWithAddress">
                      <Form.Label className="labelForm">Bank Name & Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="bankersNameWithAddress"
                        value={formData.bankersNameWithAddress}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <Form.Group controlId="ifscCode">
                      <Form.Label className="labelForm">IFSC Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        isInvalid={!!errors.ifscCode}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.ifscCode}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group controlId="exciseRegistrationNumber">
                      <Form.Label className="labelForm">Excise Registration No</Form.Label>
                      <Form.Control
                        type="text"
                        name="exciseRegistrationNumber"
                        value={formData.exciseRegistrationNumber}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={12}>
                    <Form.Group controlId="remark">
                      <Form.Label className="labelForm">Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="remark"
                        value={formData.remark}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button onClick={handleSubmit} className="btn btn-primary mt-3">
                  {isEditing ? 'Update Vendor' : 'Add Vendor'}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Vendor Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(VendorMaster), { ssr: false });