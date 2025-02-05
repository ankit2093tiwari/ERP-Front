"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const DocumentMasterPage = () => {
  const [data, setData] = useState([]); // Documents state
  const [newDocumentName, setNewDocumentName] = useState(""); // New document name
  const [showAddForm, setShowAddForm] = useState(false); // Add form visibility toggle
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1, // Sequential numbering
      sortable: false,
      width: "80px",
    },
    {
      name: "Document Name",
      selector: (row) => row.document_name || "N/A", // Document name field
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="editButton"
            onClick={() => handleEdit(row._id)}
          >
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch documents
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/document-uploads"
      );

      const fetchedData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add new document
  const handleAddDocument = async () => {
    if (newDocumentName.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/document-uploads",
          { document_name: newDocumentName }
        );

        setData((prevData) => [...prevData, response.data]);
        setNewDocumentName("");
        setShowAddForm(false);
        fetchData();
      } catch (err) {
        console.error("Error adding document:", err);
        setError("Failed to add document. Please try again later.");
      }
    } else {
      alert("Please enter a valid document name.");
    }
  };

  // Edit document
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt(
      "Enter new document name:",
      item?.document_name || ""
    );

    if (updatedName) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/document-uploads/${id}`,
          { document_name: updatedName }
        );

        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, document_name: updatedName } : row
          )
        );

        alert("Document updated successfully!");
      } catch (err) {
        console.error("Error updating document:", err);
        setError("Failed to update document. Please try again later.");
      }
    }
  };

  // Delete document
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/document-uploads/${id}`
        );

        setData((prevData) => prevData.filter((row) => row._id !== id));
        alert("Document deleted successfully!");
      } catch (err) {
        console.error("Error deleting document:", err);
        setError("Failed to delete document. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">
              Master Entry
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Document Upload</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary mb-4">
        <CgAddR /> Add Document
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Document</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Document Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Document Name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAddDocument} className="btn btn-primary">
              Add Document
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Document Records</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(DocumentMasterPage), { ssr: false });
