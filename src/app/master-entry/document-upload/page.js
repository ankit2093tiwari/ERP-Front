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
import { toast } from "react-toastify";
import { BASE_URL } from "@/Services";


const DocumentMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
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
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.document_name)}
            >
              <FaEdit />
            </button>
          )}
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/document-uploads`
      );
      const fetchedData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setData(fetchedData);
    } catch {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      toast.warning("Document name cannot be empty.");
      return;
    }

    const exists = data.find(
      (doc) =>
        doc.document_name.trim().toLowerCase() === editedName.trim().toLowerCase() &&
        doc._id !== id
    );

    if (exists) {
      toast.warn("Document name already exists.");
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/api/document-uploads/${id}`,
        { document_name: editedName }
      );

      const updated = res.data?.data;
      if (updated) {
        setData((prev) => [updated, ...prev.filter((doc) => doc._id !== id)]);
      } else {
        fetchData();
      }

      toast.success("Document updated successfully.");
      setEditingId(null);
    } catch {
      toast.error("Failed to update document.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(
          `${BASE_URL}/api/document-uploads/${id}`
        );
        toast.success("Document deleted successfully.");
        fetchData();
      } catch {
        toast.error("Failed to delete document.");
      }
    }
  };

  const handleAdd = async () => {
    setFormError("");

    if (!newDocumentName.trim()) {
      setFormError("Document name is required.");
      toast.warning("Please enter a valid document name.", {
        position: "top-right",
      });
      return;
    }

    const exists = data.find(
      (doc) =>
        doc.document_name.trim().toLowerCase() === newDocumentName.trim().toLowerCase()
    );

    if (exists) {
      setFormError("This document name already exists.");
      toast.warning("Document already exists.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/document-uploads`,
        { document_name: newDocumentName }
      );

      const added = res?.data?.data;
      if (added) {
        setData((prev) => [added, ...prev]);
      } else {
        fetchData();
      }

      toast.success("Document added successfully.");
      setIsPopoverOpen(false);
      setNewDocumentName("");
      setFormError("");
    } catch {
      toast.error("Failed to add document.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Document Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.document_name || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Document Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.document_name || "N/A"}`);
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Document Upload", link: null },
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
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
                    setNewDocumentName("");
                    setFormError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Document Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Document Name"
                      value={newDocumentName}
                      onChange={(e) => {
                        setNewDocumentName(e.target.value);
                        setFormError("");
                      }}
                      isInvalid={!!formError}
                    />
                    {formError && (
                      <div className="text-danger mt-1">{formError}</div>
                    )}
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
            {loading && <p>Loading...</p>}
            {!loading && (
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
