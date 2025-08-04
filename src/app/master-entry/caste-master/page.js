"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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
import { addNewCaste, deleteCasteById, getCastes, updateCasteById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const CasteMasterPage = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newCasteName, setNewCasteName] = useState("");
  const [editCasteName, setEditCasteName] = useState("");
  const [editId, setEditId] = useState(null);

  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);

  const [fieldError, setFieldError] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.caste_name || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm" variant="success"
            onClick={() => handleEditOpen(row._id, row.caste_name)}
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
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getCastes();
      const fetchedData = response.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        caste_name: item.caste_name || "N/A",
      }));
      setData(normalizedData);
    } catch (err) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCasteName.trim()) {
      setFieldError("Caste name is required.");
      toast.warning("Please enter a valid caste name.");
      return;
    }

    try {
      const exists = data.find(
        (c) => c.caste_name.toLowerCase().trim() === newCasteName.toLowerCase().trim()
      );
      if (exists) {
        setFieldError("Already present! Try another.");
        toast.warning("Caste name already exists!");
        return;
      }

      await addNewCaste({ caste_name: newCasteName.trim() });
      setNewCasteName("");
      setIsAddPopoverOpen(false);
      fetchData();
      toast.success("Caste added successfully!");
    } catch {
      toast.error("Failed to add caste.");
    }
  };

  const handleEditOpen = (id, name) => {
    setEditId(id);
    setEditCasteName(name);
    setIsEditPopoverOpen(true);
    setFieldError("");
  };

  const handleEditSave = async () => {
    if (!editCasteName.trim()) {
      setFieldError("Caste name is required.");
      toast.warning("Please enter a valid caste name.");
      return;
    }

    try {
      await updateCasteById(editId, { caste_name: editCasteName.trim() });
      toast.success("Caste updated successfully!");
      fetchData();
      setIsEditPopoverOpen(false);
      setEditId(null);
      setEditCasteName("");
    } catch {
      toast.error("Failed to update caste.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteCasteById(id);
        toast.success("Caste deleted successfully!");
        fetchData();
      } catch {
        toast.error("Failed to delete caste.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = () => {
    const headers = ["#", "Caste Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.caste_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Caste Name"]];
    const rows = data.map((row, index) => [index + 1, row.caste_name || "N/A"]);
    printContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Caste Master", link: null },
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
            <Button onClick={() => setIsAddPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Caste
            </Button>
          )}

          {/* Add Popover */}
          {isAddPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Caste</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsAddPopoverOpen(false);
                    setNewCasteName("");
                    setFieldError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Caste Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Caste Name"
                      value={newCasteName}
                      isInvalid={!!fieldError && !newCasteName.trim()}
                      onChange={(e) => {
                        setNewCasteName(e.target.value);
                        if (fieldError && e.target.value.trim()) setFieldError("");
                      }}
                    />
                    {fieldError && !newCasteName.trim() && (
                      <div className="text-danger mt-1">{fieldError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">Add Caste</Button>
              </Form>
            </div>
          )}

          {/* Edit Popover */}
          {isEditPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Caste</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsEditPopoverOpen(false);
                    setEditCasteName("");
                    setEditId(null);
                    setFieldError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Caste Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Caste Name"
                      value={editCasteName}
                      isInvalid={!!fieldError && !editCasteName.trim()}
                      onChange={(e) => {
                        setEditCasteName(e.target.value);
                        if (fieldError && e.target.value.trim()) setFieldError("");
                      }}
                    />
                    {fieldError && !editCasteName.trim() && (
                      <div className="text-danger mt-1">{fieldError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleEditSave} className="btn btn-success">Save Changes</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Caste Records</h2>
            {loading ? <p>Loading...</p> : (
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

export default dynamic(() => Promise.resolve(CasteMasterPage), { ssr: false });
