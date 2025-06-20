"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, FormSelect, Button, Alert } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewAdvertisement, deleteAdvertisementById, getAdvertisements, getAdvertisementTypes, updateAdvertisementById } from "@/Services";

const AdvertisementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [advertisementTypes, setAdvertisementTypes] = useState([]);

  // Form data for adding new advertisement
  const [formData, setFormData] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    remark: "",
    file: null,
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
        <FormSelect
          name="advertisement_type"
          value={editFormData.advertisement_type}
          onChange={(e) => setEditFormData({ ...editFormData, advertisement_type: e.target.value })}
        >
          <option value="">Select Type</option>
          {advertisementTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.type_name}
            </option>
          ))}
        </FormSelect>
      ) : (
        row.advertisement_type?.type_name || "N/A"
      ),
      sortable: true
    },
    {
      name: "Advertisement Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editFormData.advertisement_name}
          onChange={(e) => setEditFormData({ ...editFormData, advertisement_name: e.target.value })}
        />
      ) : (
        row.advertisement_name || "N/A"
      ),
      sortable: true
    },
    {
      name: "Page No",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editFormData.page_no}
          onChange={(e) => setEditFormData({ ...editFormData, page_no: e.target.value })}
        />
      ) : (
        row.page_no || "N/A"
      ),
      sortable: true
    },
    {
      name: "Size",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editFormData.size}
          onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
        />
      ) : (
        row.size || "N/A"
      ),
      sortable: true
    },
    {
      name: "Amount",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editFormData.amount}
          onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
        />
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
        <FormControl
          type="date"
          value={editFormData.publish_date ? new Date(editFormData.publish_date).toISOString().split('T')[0] : ""}
          onChange={(e) => setEditFormData({ ...editFormData, publish_date: e.target.value })}
        />
      ) : (
        row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A"
      ),
      sortable: true
    },
    {
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
                onClick={() => setEditingId(null)}
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

  ];

  // Fetch advertisements data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdvertisements()
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch advertisements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch advertisement types
  const fetchAdvertisementTypes = async () => {
    try {
      const response = await getAdvertisementTypes()
      setAdvertisementTypes(response?.data || []);
    } catch (err) {
      console.error("Error fetching advertisement types:", err);
      setError("Failed to fetch advertisement types. Please try again later.");
    }
  };

  // Handle form input changes for add form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  // Add a new advertisement
  const handleAdd = async () => {
    if (!formData.advertisement_type || !formData.advertisement_name || !formData.amount || !formData.page_no || !formData.publish_date, !formData.size) {
      toast.warn("All Fields are required");
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      const response = await addNewAdvertisement(form)
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
    if (!editFormData.advertisement_type || !editFormData.advertisement_name) {
      toast.warn("Advertisement Type and Name are required");
      return;
    }

    try {
      const form = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      const response = await updateAdvertisementById(id, form)
      toast.success(response?.message || "Advertisement updated successfully!");
      fetchData();
      setEditingId(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating advertisement:", error);
      toast.error(error.response?.data?.message || "Failed to update advertisement.");
    }
  };

  // Delete an advertisement
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response = await deleteAdvertisementById(id)
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
    const headers = ["#", "Type", "Name", "Page No", "Size", "Amount", "Remark", "Publish Date"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.advertisement_type?.type_name || "N/A"}\t${row.advertisement_name || "N/A"}\t${row.page_no || "N/A"}\t${row.size || "N/A"}\t${row.amount || "N/A"}\t${row.remark || "N/A"}\t${row.publish_date ? new Date(row.publish_date).toLocaleDateString() : "N/A"}`
    );
    copyContent(headers, rows);
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
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Advertisement
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Advertisement</h2>
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
                    <FormLabel className="labelForm">Advertisement Type</FormLabel>
                    <FormSelect
                      name="advertisement_type"
                      value={formData.advertisement_type}
                      onChange={handleChange}
                    >
                      <option value="">Select Type</option>
                      {advertisementTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.type_name}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publish Date</FormLabel>
                    <FormControl
                      type="date"
                      name="publish_date"
                      value={formData.publish_date}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Advertisement Name</FormLabel>
                    <FormControl
                      type="text"
                      name="advertisement_name"
                      value={formData.advertisement_name}
                      onChange={handleChange}
                      placeholder="Enter Advertisement Name"
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Size</FormLabel>
                    <FormControl
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="Enter Size"
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Page No</FormLabel>
                    <FormControl
                      type="text"
                      name="page_no"
                      value={formData.page_no}
                      onChange={handleChange}
                      placeholder="Enter Page Number"
                    />
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
                    <FormLabel className="labelForm">Amount</FormLabel>
                    <FormControl
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter Amount"
                    />
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

export default dynamic(() => Promise.resolve(AdvertisementPage), { ssr: false });