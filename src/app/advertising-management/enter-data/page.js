"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, FormSelect, Button, Alert } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewAdvertisement, deleteAdvertisementById, getAdvertisements, getAdvertisementTypes, updateAdvertisementById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AdvertisementPage = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [advertisementTypes, setAdvertisementTypes] = useState([]);


  const today = new Date().toISOString().split("T")[0];
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


  // Form errors for add form
  const [formErrors, setFormErrors] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    publish_date: "",
  });

  // Form data for editing existing advertisement
  const [editFormData, setEditFormData] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    remark: "",
    file: null,
    publish_date: "",
  });

  // Form errors for edit form
  const [editFormErrors, setEditFormErrors] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    publish_date: "",
  });

  // Validate form function
  const validateForm = (formData, isEdit = false) => {
    const errors = {};
    let isValid = true;

    if (!formData.advertisement_type) {
      errors.advertisement_type = "Advertisement type is required";
      isValid = false;
    }
    if (!formData.advertisement_name) {
      errors.advertisement_name = "Advertisement name is required";
      isValid = false;
    }
    if (!formData.page_no) {
      errors.page_no = "Page number is required";
      isValid = false;
    }
    if (!formData.size) {
      errors.size = "Size is required";
      isValid = false;
    }
    if (!formData.amount) {
      errors.amount = "Amount is required";
      isValid = false;
    } else if (isNaN(formData.amount)) {
      errors.amount = "Amount must be a number";
      isValid = false;
    }
    if (!formData.publish_date) {
      errors.publish_date = "Publish date is required";
      isValid = false;
    }

    if (isEdit) {
      setEditFormErrors(errors);
    } else {
      setFormErrors(errors);
    }

    return isValid;
  };

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
      cell: (row) => editingId === row._id ? (
        <>
          <FormSelect
            name="advertisement_type"
            value={editFormData.advertisement_type}
            onChange={(e) => {
              setEditFormData({ ...editFormData, advertisement_type: e.target.value });
              setEditFormErrors({ ...editFormErrors, advertisement_type: "" });
            }}
            isInvalid={!!editFormErrors.advertisement_type}
          >
            <option value="">Select Type</option>
            {advertisementTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.type_name}
              </option>
            ))}
          </FormSelect>
        </>
      ) : (
        row.advertisement_type?.type_name || "N/A"
      ),
      sortable: true
    },
    {
      name: "Advertisement Name",
      cell: (row) => editingId === row._id ? (
        <>
          <FormControl
            type="text"
            value={editFormData.advertisement_name}
            onChange={(e) => {
              setEditFormData({ ...editFormData, advertisement_name: e.target.value });
              setEditFormErrors({ ...editFormErrors, advertisement_name: "" });
            }}
            isInvalid={!!editFormErrors.advertisement_name}
          />
        </>
      ) : (
        row.advertisement_name || "N/A"
      ),
      sortable: true
    },
    {
      name: "Page No",
      cell: (row) => editingId === row._id ? (
        <>
          <FormControl
            type="text"
            value={editFormData.page_no}
            onChange={(e) => {
              setEditFormData({ ...editFormData, page_no: e.target.value });
              setEditFormErrors({ ...editFormErrors, page_no: "" });
            }}
            isInvalid={!!editFormErrors.page_no}
          />

        </>
      ) : (
        row.page_no || "N/A"
      ),
      sortable: true
    },
    {
      name: "Size",
      cell: (row) => editingId === row._id ? (
        <>
          <FormControl
            type="text"
            value={editFormData.size}
            onChange={(e) => {
              setEditFormData({ ...editFormData, size: e.target.value });
              setEditFormErrors({ ...editFormErrors, size: "" });
            }}
            isInvalid={!!editFormErrors.size}
          />

        </>
      ) : (
        row.size || "N/A"
      ),
      sortable: true
    },
    {
      name: "Amount",
      cell: (row) => editingId === row._id ? (
        <>
          <FormControl
            type="text"
            value={editFormData.amount}
            onChange={(e) => {
              setEditFormData({ ...editFormData, amount: e.target.value });
              setEditFormErrors({ ...editFormErrors, amount: "" });
            }}
            isInvalid={!!editFormErrors.amount}
          />

        </>
      ) : (
        row.amount || "N/A"
      ),
      sortable: true
    },
    {
      name: "Remark",
      cell: (row) => editingId === row._id ? (
        <FormControl
          as="textarea"
          rows={1}
          value={editFormData.remark}
          onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
        />
      ) : (
        row.remark || "N/A"
      ),
      sortable: true
    },
    {
      name: "Publish Date",
      cell: (row) => editingId === row._id ? (
        <>
          <FormControl
            type="date"
            value={editFormData.publish_date ? new Date(editFormData.publish_date).toISOString().split('T')[0] : ""}
            onChange={(e) => {
              setEditFormData({ ...editFormData, publish_date: e.target.value });
              setEditFormErrors({ ...editFormErrors, publish_date: "" });
            }}
            isInvalid={!!editFormErrors.publish_date}
          />

        </>
      ) : (
        row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A"
      ),
      sortable: true
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <Button
                variant="success"
                size="sm"
                title="Save"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                title="Cancel"
                onClick={() => {
                  setEditingId(null);
                  setEditFormErrors({
                    advertisement_type: "",
                    advertisement_name: "",
                    page_no: "",
                    size: "",
                    amount: "",
                    publish_date: "",
                  });
                }}
              >
                <FaTimes />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="warning"
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
            </>
          )}
        </div>
      ),
    }
  ].filter(Boolean);;

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

  // Handle form input changes for add form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));

    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
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
      fetchData();
      setFormData({
        advertisement_type: "",
        advertisement_name: "",
        page_no: "",
        size: "",
        amount: "",
        remark: "",
        file: null,
        publish_date: "",
      });
      setIsPopoverOpen(false);
      toast.success(response?.data?.message || "Advertisement added successfully!");
    } catch (error) {
      console.error("Error adding advertisement:", error);
      toast.error(error.response?.data?.message || "Failed to add advertisement.");
    }
  };

  // Edit an advertisement
  const handleEdit = (advertisement) => {
    setEditingId(advertisement._id);
    setEditFormData({
      advertisement_type: advertisement.advertisement_type?._id || "",
      advertisement_name: advertisement.advertisement_name || "",
      page_no: advertisement.page_no || "",
      size: advertisement.size || "",
      amount: advertisement.amount || "",
      remark: advertisement.remark || "",
      file: null, // Don't pre-fill file for edit
      publish_date: advertisement.publish_date ? new Date(advertisement.publish_date).toISOString().split('T')[0] : "",
    });
  };

  // Update an advertisement
  const handleUpdate = async (id) => {
    if (!validateForm(editFormData, true)) {
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

      const response = await updateAdvertisementById(id, form);
      toast.success(response?.message || "Advertisement updated successfully!");
      fetchData();
      setEditingId(null);
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
    toast.success("Printing initiated");
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
        {hasSubmitAccess &&(
            <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Advertisement
          </Button>
        )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Advertisement</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormErrors({
                      advertisement_type: "",
                      advertisement_name: "",
                      page_no: "",
                      size: "",
                      amount: "",
                      publish_date: "",
                    });
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
                      isInvalid={!!formErrors.advertisement_type}
                    >
                      <option value="">Select Type</option>
                      {advertisementTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.advertisement_type}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publish Date*</FormLabel>
                    <FormControl
                      type="date"
                      name="publish_date"
                      value={formData.publish_date}
                      onChange={handleChange}
                      isInvalid={!!formErrors.publish_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.publish_date}
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
                      isInvalid={!!formErrors.advertisement_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.advertisement_name}
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
                      isInvalid={!!formErrors.size}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.size}
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
                      isInvalid={!!formErrors.page_no}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.page_no}
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
                      isInvalid={!!formErrors.amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.amount}
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
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Advertisement
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