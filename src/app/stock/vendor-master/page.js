"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect, Alert, } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { deleteVendorRecordById, getAllVendors, getItemCategories, updateVendor, addNewVendor } from "@/Services";

const VendorMaster = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [errors, setErrors] = useState({});
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

  // Define options for select fields
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

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Organization Name",
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              type="text"
              value={editedValues.organizationName || ""}
              onChange={(e) => setEditedValues({ ...editedValues, organizationName: e.target.value })}
              required
            />
          ) : (
            <strong>{row.organizationName || "N/A"}</strong>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Organization Type",
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormSelect
              value={editedValues.organizationType || ""}
              onChange={(e) => setEditedValues({ ...editedValues, organizationType: e.target.value })}
            >
              <option value="">Select Type</option>
              {organizationTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          ) : (
            row.organizationType || "N/A"
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Organization Address",
      cell: (row) => (
        <div>
          <div>{editingId === row._id ? (
            <FormControl
              type="text"
              value={editedValues.organizationAddress || ""}
              onChange={(e) => setEditedValues({ ...editedValues, organizationAddress: e.target.value })}
              required
            />
          ) : (
            row.organizationAddress || "N/A"
          )}</div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "ContactPersonDetails",
      cell: (row) => (
        <div>
          <div>
            {editingId === row._id ? (
              <FormControl
                type="text"
                value={editedValues.contactPersonName || ""}
                onChange={(e) => setEditedValues({ ...editedValues, contactPersonName: e.target.value })}
              />
            ) : (
              row.contactPersonName || "N/A"
            )}
          </div>
          <div>
            {editingId === row._id ? (
              <FormControl
                type="text"
                value={editedValues.contactNumber || ""}
                onChange={(e) => setEditedValues({ ...editedValues, contactNumber: e.target.value })}
              />
            ) : (
              row.contactNumber || "No contact"
            )}
          </div>
          <div>
            {editingId === row._id ? (
              <FormControl
                type="email"
                value={editedValues.email || ""}
                onChange={(e) => setEditedValues({ ...editedValues, email: e.target.value })}
              />
            ) : (
              row.email || "No email"
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => {
                  setEditingId(null);
                  setEditedValues({});
                }}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

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

  const handleEdit = (vendor) => {
    setEditingId(vendor._id);
    setEditedValues({
      ...vendor,
      itemCategory: vendor.itemCategory._id || vendor.itemCategory
    });
  };

  const handleUpdate = async (id) => {
    try {
      // Validate required fields
      if (!editedValues.organizationName || !editedValues.contactPersonName || !editedValues.contactNumber || !editedValues.email || !editedValues.itemCategory || !editedValues.organizationType) {
        toast.error("Please fill all required fields");
        setError("Please fill all required fields");
        return;
      }

      // Validate contact number format
      if (!/^[0-9]{10,15}$/.test(editedValues.contactNumber)) {
        setError("Contact number must be 10-15 digits");
        return;
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(editedValues.email)) {
        setError("Please enter a valid email address");
        return;
      }

      const response = await updateVendor(id, editedValues)
      console.log(response);

      toast.success(response.message || "Vendor updated successfully");
      fetchData();
      setEditingId(null);
      setEditedValues({});
      setError("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vendor");
      console.error("Error updating data:", error);
    }
  };

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

  const handleAdd = async () => {
    // Validate required fields
    if (!validateForm()) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      const existingVendor = data.find(
        (vendor) => vendor.organizationName === formData.organizationName
      );
      if (existingVendor) {
        setError("Vendor name already exists.");
        return;
      }

      const response = await addNewVendor(formData);
      toast.success(response.message || "Vendor added successfully");
      fetchData();
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
      setIsPopoverOpen(false);
      setError("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add vendor");
      console.error("Error adding data:", error);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Required fields validation
    if (!formData.organizationName) {
      newErrors.organizationName = "Organization name is required";
      isValid = false;
    }
    if (!formData.itemCategory) {
      newErrors.itemCategory = "Item Category is required";
      isValid = false;
    }
    if (!formData.statusOfEnterprise) {
      newErrors.statusOfEnterprise = "Enterpris Status is required";
      isValid = false;
    }
    if (!formData.contactPersonName) {
      newErrors.contactPersonName = "Contact PersonName is required";
      isValid = false;
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Organization Type is required";
      isValid = false;
    }
    if (!formData.organizationAddress) {
      newErrors.organizationAddress = "Organization Address is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } // Validate email format
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;;
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact Number is required";
      isValid = false;
    }
    // Validate contact number format
    else if (!/^[0-9]{10,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10-15 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
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

  const handleCopy = () => {
    const headers = ["#", "Organization", "Type", "Status", "Category", "Contact Person"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.organizationName}\t${row.organizationType}\t${row.statusOfEnterprise}\t${row.itemCategory?.categoryName || "N/A"}\t${row.contactPersonName}`
    );
    copyContent(headers, rows);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Vendor
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Vendor</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Organization Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                      isInvalid={errors.organizationName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.organizationName}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Organization Type<span className="text-danger">*</span></FormLabel>
                    <FormSelect
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
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.organizationType}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Contact Person Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      required
                      isInvalid={!!errors.contactPersonName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contactPersonName}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Status Of Enterprise<span className="text-danger">*</span></FormLabel>
                    <FormSelect
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
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.statusOfEnterprise}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Contact Number<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      isInvalid={!!errors.contactNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contactNumber}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Email<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      isInvalid={!!errors.email}
                    />
                  </Col>
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Category<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="itemCategory"
                      value={formData.itemCategory}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Organization Address<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      name="organizationAddress"
                      value={formData.organizationAddress}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">GST Number</FormLabel>
                    <FormControl
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      maxLength={15}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">PAN Number</FormLabel>
                    <FormControl
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">TIN Number</FormLabel>
                    <FormControl
                      type="text"
                      name="tinNumber"
                      value={formData.tinNumber}
                      onChange={handleChange}
                      maxLength={11}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Website</FormLabel>
                    <FormControl
                      type="text"
                      name="organizationWebsite"
                      value={formData.organizationWebsite}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Bank Account Number</FormLabel>
                    <FormControl
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Bank Name & Address</FormLabel>
                    <FormControl
                      type="text"
                      name="bankersNameWithAddress"
                      value={formData.bankersNameWithAddress}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">IFSC Code</FormLabel>
                    <FormControl
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Excise Registration No</FormLabel>
                    <FormControl
                      type="text"
                      name="exciseRegistrationNumber"
                      value={formData.exciseRegistrationNumber}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Vendor
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