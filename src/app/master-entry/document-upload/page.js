"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const DocumentMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [formData, setFormData] = useState({
    document_name: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Document Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.document_name || "N/A"
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
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/document-uploads");
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

  const handleEdit = (document) => {
    setEditingId(document._id);
    setEditedName(document.document_name);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/document-uploads/${id}`, {
        document_name: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update document. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/document-uploads/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting document:", error);
        setError("Failed to delete document. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (formData.document_name.trim()) {
      try {
        const existingDocument = data.find(
          (doc) => doc.document_name === formData.document_name
        );
        if (existingDocument) {
          setError("Document name already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/document-uploads", {
          document_name: formData.document_name,
        });
        fetchData();
        setFormData({ document_name: "" });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding document:", error);
        setError("Failed to add document. Please try again later.");
      }
    } else {
      alert("Please enter a valid document name.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Document Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.document_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Document Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.document_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "document-upload", link: "null" },
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
            <CgAddR /> Add Document
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Document</h2>
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
                    <FormLabel className="labelForm">Document Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Document Name"
                      value={formData.document_name}
                      onChange={(e) =>
                        setFormData({ document_name: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Document
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Document Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
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

export default dynamic(() => Promise.resolve(DocumentMasterPage), { ssr: false });