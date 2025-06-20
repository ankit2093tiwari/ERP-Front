"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { CgAddR } from 'react-icons/cg';
import { toast } from "react-toastify";
import { addNewPublisher, deletePublisherById, getAllPublishers, updatePublisherById } from "@/Services";

const Publisher = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [newPublisher, setNewPublisher] = useState({
    publisherName: "",
    publisherPhoneNo: "",
    publisherRegistrationNo: "",
    publisherFaxNo: "",
    publisherLocation: "",
    taxIdentNo: "",
    publisherMobileNo: "",
    publisherEmail: "",
  });

  const handleInputChange = (field, value) => {
    setNewPublisher(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: "" }));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllPublishers();
      setData(response?.data || []);
    } catch {
      setError("Failed to fetch publishers.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const { publisherName, publisherPhoneNo, publisherEmail, publisherMobileNo, publisherRegistrationNo, publisherLocation, publisherFaxNo } = newPublisher;

    if (!publisherName.trim()) errors.publisherName = "Publisher name is required.";
    if (!publisherPhoneNo.trim()) errors.publisherPhoneNo = "Phone number is required.";
    if (!publisherRegistrationNo.trim()) errors.publisherRegistrationNo = "Registration number is required.";
    if (!publisherLocation.trim()) errors.publisherLocation = "Location is required.";
    if (!publisherFaxNo.trim()) errors.publisherFaxNo = "Fax number is required.";
    if (!publisherMobileNo.trim()) {
      errors.publisherMobileNo = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(publisherMobileNo)) {
      errors.publisherMobileNo = "Invalid mobile number.";
    }
    if (!publisherEmail.trim()) {
      errors.publisherEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publisherEmail)) {
      errors.publisherEmail = "Invalid email address.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      const response = await addNewPublisher(newPublisher);
      toast.success(response?.message ?? "Publisher added successfully!");
      fetchData();
      resetForm();
    } catch {
      toast.error("Failed to add publisher.");
    }
  };

  const handleEdit = (id) => {
    const publisher = data.find((row) => row._id === id);
    if (publisher) {
      setNewPublisher({ ...publisher });
      setEditId(id);
      setIsEditMode(true);
      setShowAddForm(true);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const response = await updatePublisherById(editId, newPublisher);
      toast.success(response?.message ?? "Publisher updated successfully!");
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data.message || "Failed to update publisher.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this publisher?")) {
      try {
        const response = await deletePublisherById(id);
        if (response?.success)
          toast.success(response?.message ?? "Publisher deleted successfully!");
        fetchData();
      } catch {
        setError("Failed to delete publisher.");
      }
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setIsEditMode(false);
    setEditId(null);
    setValidationErrors({});
    setNewPublisher({
      publisherName: "",
      publisherPhoneNo: "",
      publisherRegistrationNo: "",
      publisherFaxNo: "",
      publisherLocation: "",
      taxIdentNo: "",
      publisherMobileNo: "",
      publisherEmail: "",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (_, index) => index + 1, width: "80px" },
    { name: "Publisher Name", selector: (row) => row.publisherName || "N/A", sortable: true },
    { name: "Phone No.", selector: (row) => row.publisherPhoneNo || "N/A", sortable: true },
    { name: "Registration No.", selector: (row) => row.publisherRegistrationNo || "N/A", sortable: true },
    { name: "Fax No.", selector: (row) => row.publisherFaxNo || "N/A", sortable: true },
    { name: "Location", selector: (row) => row.publisherLocation || "N/A", sortable: true },
    { name: "Tax Ident No.", selector: (row) => row.taxIdentNo || "N/A", sortable: true },
    { name: "Mobile No.", selector: (row) => row.publisherMobileNo || "N/A", sortable: true },
    { name: "Email", selector: (row) => row.publisherEmail || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Publisher Master", link: "null" },
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Publisher
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditMode ? "Update Publisher" : "Add Publisher"}</h2>
                <button className="closeForm" onClick={resetForm}>X</button>
              </div>

              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Publisher Name</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherName}
                      onChange={(e) => handleInputChange("publisherName", e.target.value)}
                      placeholder="Enter Publisher Name"
                    />
                    {validationErrors.publisherName && <small className="text-danger">{validationErrors.publisherName}</small>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Phone No.</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherPhoneNo}
                      onChange={(e) => handleInputChange("publisherPhoneNo", e.target.value)}
                      placeholder="Enter Phone Number"
                      maxLength={15}
                    />
                    {validationErrors.publisherPhoneNo && <small className="text-danger">{validationErrors.publisherPhoneNo}</small>}
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Mobile No.</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherMobileNo}
                      onChange={(e) => handleInputChange("publisherMobileNo", e.target.value)}
                      placeholder="Enter Mobile Number"
                    />
                    {validationErrors.publisherMobileNo && <small className="text-danger">{validationErrors.publisherMobileNo}</small>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Email</FormLabel>
                    <FormControl
                      type="email"
                      value={newPublisher.publisherEmail}
                      onChange={(e) => handleInputChange("publisherEmail", e.target.value)}
                      placeholder="Enter Email"
                    />
                    {validationErrors.publisherEmail && <small className="text-danger">{validationErrors.publisherEmail}</small>}
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Registration No.</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherRegistrationNo}
                      onChange={(e) => handleInputChange("publisherRegistrationNo", e.target.value)}
                      placeholder="Enter Registration Number"
                    />
                    {validationErrors.publisherRegistrationNo && <small className="text-danger">{validationErrors.publisherRegistrationNo}</small>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Fax No.</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherFaxNo}
                      onChange={(e) => handleInputChange("publisherFaxNo", e.target.value)}
                      placeholder="Enter Fax Number"
                    />
                    {validationErrors.publisherFaxNo && <small className="text-danger">{validationErrors.publisherFaxNo}</small>}
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Location</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.publisherLocation}
                      onChange={(e) => handleInputChange("publisherLocation", e.target.value)}
                      placeholder="Enter Location"
                    />
                    {validationErrors.publisherLocation && <small className="text-danger">{validationErrors.publisherLocation}</small>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Tax Ident No.</FormLabel>
                    <FormControl
                      type="text"
                      value={newPublisher.taxIdentNo}
                      onChange={(e) => handleInputChange("taxIdentNo", e.target.value)}
                      placeholder="Enter Tax Identification Number"
                    />

                  </Col>
                </Row>

                <Button
                  onClick={isEditMode ? handleUpdate : handleAdd}
                  className="btn btn-primary mt-3"
                >
                  {isEditMode ? "Update Publisher" : "Add Publisher"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Publisher Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Publisher), { ssr: false });
