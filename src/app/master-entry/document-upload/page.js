"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
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
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewDocumentUpload, deleteDocumentUploadById, getAllDocumentUpload, updateDocumentUploadById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const DocumentMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [formError, setFormError] = useState("");
  const [editingDocument, setEditingDocument] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Document Name",
      cell: (row) => row.document_name || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm" variant="success"
            onClick={() => handleEditClick(row)}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
      width: "120px"
    },
  ].filter(Boolean);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllDocumentUpload()
      setData(res.data || []);
    } catch {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (document) => {
    setEditingDocument(document);
    setDocumentName(document.document_name);
    setIsEditFormOpen(true);
  };

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast.warning("Document name cannot be empty.");
      return;
    }

    const exists = data.find(
      (doc) =>
        doc.document_name.trim().toLowerCase() === documentName.trim().toLowerCase() &&
        doc._id !== editingDocument._id
    );

    if (exists) {
      toast.warn("Document name already exists.");
      return;
    }

    try {
      const res = await updateDocumentUploadById(editingDocument._id, { document_name: documentName })
      const updated = res?.data;
      if (updated) {
        setData((prev) => [updated, ...prev.filter((doc) => doc._id !== editingDocument._id)]);
      } else {
        fetchData();
      }

      toast.success("Document updated successfully.");
      setIsEditFormOpen(false);
      setEditingDocument(null);
      setDocumentName("");
    } catch {
      toast.error("Failed to update document.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocumentUploadById(id)
        toast.success("Document deleted successfully.");
        fetchData();
      } catch {
        toast.error("Failed to delete document.");
      }
    }
  };

  const handleAdd = async () => {
    setFormError("");

    if (!documentName.trim()) {
      setFormError("Document name is required.");
      toast.warning("Please enter a valid document name.");
      return;
    }

    const exists = data.find(
      (doc) =>
        doc.document_name.trim().toLowerCase() === documentName.trim().toLowerCase()
    );

    if (exists) {
      setFormError("This document name already exists.");
      toast.warning("Document already exists.");
      return;
    }

    try {
      const res = await addNewDocumentUpload({ document_name: documentName })

      const added = res?.data;
      if (added) {
        setData((prev) => [added, ...prev]);
      } else {
        fetchData();
      }

      toast.success("Document added successfully.");
      setIsAddFormOpen(false);
      setDocumentName("");
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
          {hasSubmitAccess && (
            <Button onClick={() => setIsAddFormOpen(true)} className="btn-add">
              <CgAddR /> Add Document
            </Button>
          )}

          {isAddFormOpen && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading">
                <h2>Add New Document</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setDocumentName("");
                    setFormError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Document Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Document Name"
                      value={documentName}
                      onChange={(e) => {
                        setDocumentName(e.target.value);
                        setFormError("");
                      }}
                      isInvalid={!!formError}
                    />
                    {formError && (
                      <div className="text-danger mt-1">{formError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary me-2">
                  Add Document
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setDocumentName("");
                    setFormError("");
                  }}
                >
                  Cancel
                </Button>
              </Form>
            </div>
          )}

          {isEditFormOpen && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading">
                <h2>Edit Document</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsEditFormOpen(false);
                    setEditingDocument(null);
                    setDocumentName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Document Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Document Name"
                      value={documentName}
                      onChange={(e) => {
                        setDocumentName(e.target.value);
                        setFormError("");
                      }}
                      isInvalid={!!formError}
                    />
                    {formError && (
                      <div className="text-danger mt-1">{formError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleSave} className="btn btn-primary me-2">
                  Update Document
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditFormOpen(false);
                    setEditingDocument(null);
                    setDocumentName("");
                  }}
                >
                  Cancel
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