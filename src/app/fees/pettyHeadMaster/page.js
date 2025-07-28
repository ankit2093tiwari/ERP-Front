"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import "jspdf-autotable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewPettyHead, deletePettyHeadById, getAllPettyHeads, updatePettyHeadById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const PettyHeadMaster = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPettyHead, setNewPettyHead] = useState({ petty_name: "", head_type: "" });
  const [fieldError, setFieldError] = useState({ petty_name: "", head_type: "" });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Petty Head Name",
      selector: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={
              editedData[row._id]?.petty_name !== undefined
                ? editedData[row._id].petty_name
                : row.petty_name
            }
            onChange={(e) => handleEdit(row._id, "petty_name", e.target.value)}
          />
        ) : (
          row.petty_name || "N/A"
        ),
    },
    {
      name: "Head Type",
      selector: (row) =>
        editingId === row._id ? (
          <FormControl
            as="select"
            value={
              editedData[row._id]?.head_type !== undefined
                ? editedData[row._id].head_type
                : row.head_type
            }
            onChange={(e) => handleEdit(row._id, "head_type", e.target.value)}
          >
            <option value="">Select Head Type</option>
            <option value="Add">Add</option>
            <option value="Subtract">Subtract</option>
          </FormControl>
        ) : (
          row.head_type || "N/A"
        ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEditClick(row)}>
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handlePrint = () => {
    const headers = [["#", "Petty Head Name", "Head Type"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.petty_name || "N/A",
      row.head_type || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Petty Head Name", "Head Type"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.petty_name || "N/A"}\t${row.head_type || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPettyHeads()
      if (res?.pettyHeads?.length > 0) {
        setData(res.pettyHeads);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch {
      setError("Failed to fetch petty heads.");
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!newPettyHead.petty_name.trim()) {
      errors.petty_name = "Petty head name is required.";
    } else if (newPettyHead.petty_name.length < 3 || newPettyHead.petty_name.length > 50) {
      errors.petty_name = "Must be between 3-50 characters.";
    }

    if (!newPettyHead.head_type.trim()) {
      errors.head_type = "Head type is required.";
    }

    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateFields()) return;

    try {
      const response = await addNewPettyHead(newPettyHead)
      toast.success("Petty head added successfully");
      setNewPettyHead({ petty_name: "", head_type: "" });
      setShowAddForm(false);
      fetchData();
    } catch {
      toast.error("Failed to add petty head.");
    }
  };

  const handleEditClick = (row) => {
    setEditingId(row._id);
    setEditedData({
      ...editedData,
      [row._id]: {
        petty_name: row.petty_name,
        head_type: row.head_type
      }
    });
  };

  const handleEdit = (id, field, value) => {
    setEditedData({
      ...editedData,
      [id]: {
        ...editedData[id],
        [field]: value
      }
    });
  };

  const handleSave = async (id) => {
    const dataToSave = editedData[id];

    // Validate fields
    const errors = {};

    if (!dataToSave?.petty_name?.trim()) {
      errors.petty_name = "Petty head name is required.";
    } else if (dataToSave.petty_name.length < 3 || dataToSave.petty_name.length > 50) {
      errors.petty_name = "Petty head name must be between 3-50 characters.";
    }

    if (!dataToSave?.head_type?.trim()) {
      errors.head_type = "Head type is required.";
    }

    // Show errors if any
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    // Proceed with save if validation passes
    try {
      await updatePettyHeadById(id, dataToSave)
      toast.success("Petty head updated successfully!");
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update petty head");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this petty head?")) {
      try {
        await deletePettyHeadById(id)
        toast.success("Deleted successfully.");
        fetchData();
      } catch {
        toast.error("Failed to delete petty head.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "pettyHeadMaster", link: "null" },
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
          {hasSubmitAccess && (
            <Button onClick={() => {
              setShowAddForm(true);
              setFieldError({});
            }} className="btn-add">
              <CgAddR /> Add Petty Head
            </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Petty Head</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Petty Head Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Petty Head Name"
                      value={newPettyHead.petty_name}
                      onChange={(e) => {
                        setNewPettyHead({ ...newPettyHead, petty_name: e.target.value })
                        if (fieldError.petty_name) {
                          setFieldError((prev) => ({ ...prev, petty_name: "" }));
                        }
                      }}
                      isInvalid={!!fieldError.petty_name}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError.petty_name}</Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Head Type</FormLabel>
                    <FormControl
                      as="select"
                      value={newPettyHead.head_type}
                      onChange={(e) => {
                        setNewPettyHead({ ...newPettyHead, head_type: e.target.value })
                        if (fieldError.head_type) {
                          setFieldError((prev) => ({ ...prev, head_type: "" }));
                        }
                      }}
                      isInvalid={!!fieldError.head_type}
                    >
                      <option value="">Select Head Type</option>
                      <option value="Add">Add</option>
                      <option value="Subtract">Subtract</option>
                    </FormControl>
                    <Form.Control.Feedback type="invalid">{fieldError.head_type}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Petty Head
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Petty Head Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && data.length === 0 && <p>No records found.</p>}
            {!loading && !error && data.length > 0 && (
              <Table
                columns={columns}
                data={data}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(PettyHeadMaster), { ssr: false });