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
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addNewLeave, deleteLeaveById, getAllLeaves, updateLeaveById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const LeaveMasterPage = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [editError, setEditError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Leave Name",
      selector: (row) => row.LeaveName,
      cell: (row) =>
        editingId === row._id ? (
          <>
            <FormControl
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value);
                setEditError("");
              }}
              isInvalid={!!editError}
            />
          </>
        ) : (
          row.LeaveName || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleSave(row._id)}>
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => {
                  setEditingId(null);
                  setEditError("");
                }}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row._id, row.LeaveName)}
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

  const handlePrint = () => {
    const tableHeaders = [["#", "Leave Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.LeaveName || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Leave Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.LeaveName || "N/A"}`);
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllLeaves()
      setData(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.");
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
      setEditError("Leave name cannot be empty.");
      toast.warning("Leave name cannot be empty.");
      return;
    }

    const exists = data.find(
      (item) =>
        item.LeaveName.trim().toLowerCase() === editedName.trim().toLowerCase() &&
        item._id !== id
    );

    if (exists) {
      setEditError("Leave name already exists.");
      toast.warning("Leave name already exists.");
      return;
    }

    try {
      await updateLeaveById(id, { LeaveName: editedName })
      toast.success("Leave updated successfully!");
      fetchData();
      setEditingId(null);
      setEditError("");
    } catch (err) {
      console.log('failed to update leave', err)
      toast.error("Failed to update leave. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this leave?")) {
      try {
        await deleteLeaveById(id)
        toast.success("Leave deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete leave. Try again.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newLeaveName.trim()) {
      setFieldError("Leave name is required.");
      toast.warning("Please enter a leave name.");
      return;
    }

    const exists = data.find(
      (item) => item.LeaveName.toLowerCase() === newLeaveName.toLowerCase()
    );

    if (exists) {
      setFieldError("Leave name already exists.");
      toast.warning("Leave name already exists.");
      return;
    }

    try {
      await addNewLeave({ LeaveName: newLeaveName })
      toast.success("Leave added successfully!");
      setNewLeaveName("");
      setIsPopoverOpen(false);
      setFieldError("");
      fetchData();
    } catch (err) {
      console.log('failed to add leave', err)
      toast.error("Failed to add leave. Try again.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Leave Master", link: null },
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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Leave
          </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Leave</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFieldError("");
                    setNewLeaveName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Leave Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Leave Name"
                      value={newLeaveName}
                      onChange={(e) => {
                        setNewLeaveName(e.target.value);
                        setFieldError("");
                      }}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && (
                      <div className="text-danger mt-1 small">{fieldError}</div>
                    )}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Leave
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Leave Records</h2>
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

export default dynamic(() => Promise.resolve(LeaveMasterPage), { ssr: false });
