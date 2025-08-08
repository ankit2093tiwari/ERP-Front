"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, FormSelect, Button, Alert } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewAdvertisement, deleteAdvertisementById, getAdvertisements, getAdvertisementTypes, updateAdvertisementById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AdvertisementPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [advertisementTypes, setAdvertisementTypes] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  
  // Form state for adding new advertisement
  const [formData, setFormData] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    remark: "",
    file: null,
    publish_date: today,
  });

  // Form state for editing advertisement
  const [editFormData, setEditFormData] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    remark: "",
    file: null,
    publish_date: today,
  });

  // Form errors
  const [errors, setErrors] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    publish_date: "",
  });

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false
    },
    {
      name: "Advertisement Type",
      selector: (row) => row.advertisement_type?.type_name || "N/A",
      sortable: true
    },
    {
      name: "Advertisement Name",
      selector: (row) => row.advertisement_name || "N/A",
      sortable: true
    },
    {
      name: "Page No",
      selector: (row) => row.page_no || "N/A",
      sortable: true
    },
    {
      name: "Size",
      selector: (row) => row.size || "N/A",
      sortable: true
    },
    {
      name: "Amount",
      selector: (row) => row.amount || "N/A",
      sortable: true
    },
    {
      name: "Remark",
      selector: (row) => row.remark || "N/A",
      sortable: true
    },
    {
      name: "Publish Date",
      selector: (row) => row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A",
      sortable: true
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            variant="success"
            size="sm"
            title="Edit"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button
            variant="danger"
            size="sm"
            title="Delete"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    }
  ].filter(Boolean);

  // Fetch advertisements data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAdvertisements();
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to fetch advertisements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch advertisement types
  const fetchAdvertisementTypes = async () => {
    try {
      const response = await getAdvertisementTypes();
      setAdvertisementTypes(response?.data || []);
    } catch (err) {
      console.error("Error fetching advertisement types:", err);
      toast.error("Failed to fetch advertisement types. Please try again later.");
    }
  };

  // Validate form function
  const validateForm = (formData) => {
    const newErrors = {};
    let isValid = true;

    if (!formData.advertisement_type) {
      newErrors.advertisement_type = "Advertisement type is required";
      isValid = false;
    }
    if (!formData.advertisement_name) {
      newErrors.advertisement_name = "Advertisement name is required";
      isValid = false;
    }
    if (!formData.page_no) {
      newErrors.page_no = "Page number is required";
      isValid = false;
    }
    if (!formData.size) {
      newErrors.size = "Size is required";
      isValid = false;
    }
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else if (isNaN(formData.amount)) {
      newErrors.amount = "Amount must be a number";
      isValid = false;
    }
    if (!formData.publish_date) {
      newErrors.publish_date = "Publish date is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form input changes for add form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form input changes for edit form
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Add a new advertisement
  const handleAdd = async () => {
    if (!validateForm(formData)) {
      toast.warn("Please fill all required fields correctly");
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      const response = await addNewAdvertisement(form);
      toast.success(response?.data?.message || "Advertisement added successfully!");
      fetchData();
      resetAddForm();
      setIsAddFormOpen(false);
    } catch (error) {
      console.error("Error adding advertisement:", error);
      toast.error(error.response?.data?.message || "Failed to add advertisement.");
    }
  };

  // Edit an advertisement
  const handleEdit = (advertisement) => {
    setCurrentEditId(advertisement._id);
    setEditFormData({
      advertisement_type: advertisement.advertisement_type?._id || "",
      advertisement_name: advertisement.advertisement_name || "",
      page_no: advertisement.page_no || "",
      size: advertisement.size || "",
      amount: advertisement.amount || "",
      remark: advertisement.remark || "",
      file: null,
      publish_date: advertisement.publish_date ? new Date(advertisement.publish_date).toISOString().split('T')[0] : today,
    });
    setIsEditFormOpen(true);
  };

  // Update an advertisement
  const handleUpdate = async () => {
    if (!validateForm(editFormData)) {
      toast.warn("Please fill all required fields correctly");
      return;
    }

    try {
      const form = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      const response = await updateAdvertisementById(currentEditId, form);
      toast.success(response?.message || "Advertisement updated successfully!");
      fetchData();
      resetEditForm();
      setIsEditFormOpen(false);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      toast.error(error.response?.data?.message || "Failed to update advertisement.");
    }
  };

  // Delete an advertisement
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response = await deleteAdvertisementById(id);
        toast.success(response?.message || "Advertisement deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting advertisement:", error);
        toast.error(error.response?.data?.message || "Failed to delete advertisement.");
      }
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setFormData({
      advertisement_type: "",
      advertisement_name: "",
      page_no: "",
      size: "",
      amount: "",
      remark: "",
      file: null,
      publish_date: today,
    });
    setErrors({
      advertisement_type: "",
      advertisement_name: "",
      page_no: "",
      size: "",
      amount: "",
      publish_date: "",
    });
  };

  // Reset edit form
  const resetEditForm = () => {
    setCurrentEditId(null);
    setEditFormData({
      advertisement_type: "",
      advertisement_name: "",
      page_no: "",
      size: "",
      amount: "",
      remark: "",
      file: null,
      publish_date: today,
    });
    setErrors({
      advertisement_type: "",
      advertisement_name: "",
      page_no: "",
      size: "",
      amount: "",
      publish_date: "",
    });
  };

  // Print table data
  const handlePrint = () => {
    if (data.length === 0) {
      toast.warn("No data to print");
      return;
    }

    const tableHeaders = [["#", "Type", "Name", "Page No", "Size", "Amount", "Remark", "Publish Date"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.advertisement_type?.type_name || "N/A",
      row.advertisement_name || "N/A",
      row.page_no || "N/A",
      row.size || "N/A",
      row.amount || "N/A",
      row.remark || "N/A",
      row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  // Copy table data
  const handleCopy = () => {
    if (data.length === 0) {
      toast.warn("No data to copy");
      return;
    }

    const headers = ["#", "Type", "Name", "Page No", "Size", "Amount", "Remark", "Publish Date"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.advertisement_type?.type_name || "N/A"}\t${row.advertisement_name || "N/A"}\t${row.page_no || "N/A"}\t${row.size || "N/A"}\t${row.amount || "N/A"}\t${row.remark || "N/A"}\t${row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A"}`
    );
    copyContent(headers, rows);
    toast.success("Data copied to clipboard");
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchAdvertisementTypes();
  }, []);

  const breadcrumbItems = [
    { label: "Advertising Management", link: "/advertising-management/all-module" },
    { label: "Advertisement Data", link: "null" },
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
          {hasSubmitAccess && (
            <Button
              onClick={() => {
                setIsAddFormOpen(true);
                resetAddForm();
              }}
              className="btn-add"
            >
              <CgAddR /> Add Advertisement
            </Button>
          )}

          {/* Add Form */}
          {isAddFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Advertisement</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    resetAddForm();
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Advertisement Type*</FormLabel>
                    <FormSelect
                      name="advertisement_type"
                      value={formData.advertisement_type}
                      onChange={handleChange}
                      isInvalid={!!errors.advertisement_type}
                    >
                      <option value="">Select Type</option>
                      {advertisementTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.advertisement_type}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publish Date*</FormLabel>
                    <FormControl
                      type="date"
                      name="publish_date"
                      value={formData.publish_date}
                      onChange={handleChange}
                      isInvalid={!!errors.publish_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.publish_date}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Advertisement Name*</FormLabel>
                    <FormControl
                      type="text"
                      name="advertisement_name"
                      value={formData.advertisement_name}
                      onChange={handleChange}
                      placeholder="Enter Advertisement Name"
                      isInvalid={!!errors.advertisement_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.advertisement_name}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Size*</FormLabel>
                    <FormControl
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="Enter Size"
                      isInvalid={!!errors.size}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.size}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Page No*</FormLabel>
                    <FormControl
                      type="text"
                      name="page_no"
                      value={formData.page_no}
                      onChange={handleChange}
                      placeholder="Enter Page Number"
                      isInvalid={!!errors.page_no}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.page_no}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">File</FormLabel>
                    <FormControl
                      type="file"
                      name="file"
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount*</FormLabel>
                    <FormControl
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter Amount"
                      isInvalid={!!errors.amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={1}
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Enter Remark"
                    />
                  </Col>
                </Row>
                <Button variant="success" onClick={handleAdd}>
                  Add Advertisement
                </Button>
              </Form>
            </div>
          )}

          {/* Edit Form */}
          {isEditFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Advertisement</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsEditFormOpen(false);
                    resetEditForm();
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Advertisement Type*</FormLabel>
                    <FormSelect
                      name="advertisement_type"
                      value={editFormData.advertisement_type}
                      onChange={handleEditChange}
                      isInvalid={!!errors.advertisement_type}
                    >
                      <option value="">Select Type</option>
                      {advertisementTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {errors.advertisement_type}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publish Date*</FormLabel>
                    <FormControl
                      type="date"
                      name="publish_date"
                      value={editFormData.publish_date}
                      onChange={handleEditChange}
                      isInvalid={!!errors.publish_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.publish_date}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Advertisement Name*</FormLabel>
                    <FormControl
                      type="text"
                      name="advertisement_name"
                      value={editFormData.advertisement_name}
                      onChange={handleEditChange}
                      placeholder="Enter Advertisement Name"
                      isInvalid={!!errors.advertisement_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.advertisement_name}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Size*</FormLabel>
                    <FormControl
                      type="text"
                      name="size"
                      value={editFormData.size}
                      onChange={handleEditChange}
                      placeholder="Enter Size"
                      isInvalid={!!errors.size}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.size}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Page No*</FormLabel>
                    <FormControl
                      type="text"
                      name="page_no"
                      value={editFormData.page_no}
                      onChange={handleEditChange}
                      placeholder="Enter Page Number"
                      isInvalid={!!errors.page_no}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.page_no}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">File</FormLabel>
                    <FormControl
                      type="file"
                      name="file"
                      onChange={handleEditChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount*</FormLabel>
                    <FormControl
                      type="text"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditChange}
                      placeholder="Enter Amount"
                      isInvalid={!!errors.amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={1}
                      name="remark"
                      value={editFormData.remark}
                      onChange={handleEditChange}
                      placeholder="Enter Remark"
                    />
                  </Col>
                </Row>
                <Button variant="success" onClick={handleUpdate} >
                  Update Advertisement
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Advertisement Records</h2>
            {loading ? (
              <div className="text-center my-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="alert alert-info">No advertisement records found</div>
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

export default dynamic(() => Promise.resolve(AdvertisementPage), { ssr: false });