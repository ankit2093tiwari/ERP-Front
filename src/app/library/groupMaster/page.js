"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import axios from "axios";
import { toast } from "react-toastify";
import { addNewLibraryGroup, deleteLibraryGroupById, getLibraryGroups, updateLibraryGroupById } from "@/Services";

const AddLibraryGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => {
    setIsPopoverOpen(false);
    setFieldError("");
    setNewGroupName("");
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Group Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
          />
        ) : (
          row.groupName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getLibraryGroups()
      setData(response.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
      toast.error("Failed to fetch group records.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditGroupName(row.groupName);
  };

  const handleSave = async (id) => {
    if (!editGroupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    try {
      await updateLibraryGroupById(id, {
        groupName: editGroupName,
      })
      toast.success("Group updated successfully");
      setEditId(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteLibraryGroupById(id)
        toast.success("Group deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete group");
      }
    }
  };

  const handleAdd = async () => {
    setFieldError("");

    if (!newGroupName.trim()) {
      setFieldError("Group name is required");
      return;
    }

    if (newGroupName.length < 3) {
      setFieldError("Group name must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addNewLibraryGroup({
        groupName: newGroupName.trim(),
      })
      toast.success("Group added successfully");
      fetchData();
      setNewGroupName("");
      setIsPopoverOpen(false);
    } catch (error) {
      toast.error("Failed to add group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Group Name"]];
    const rows = data.map((row, index) => [index + 1, row.groupName || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Group Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.groupName || "N/A"}`);
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Group Master", link: "null" },
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
          <Button onClick={onOpen} className="btn-add">
            <CgAddR /> Add Group
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Group</h2>
                <button className="closeForm" onClick={onClose}>X</button>
              </div>
              <Form className="formSheet" onSubmit={(e) => e.preventDefault()}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Group Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={newGroupName}
                      isInvalid={!!fieldError}
                      onChange={(e) => {
                        setNewGroupName(e.target.value);
                        setFieldError("");
                      }}
                    />
                    {fieldError && (
                      <Form.Control.Feedback type="invalid">
                        {fieldError}
                      </Form.Control.Feedback>
                    )}
                  </Col>
                </Row>
                <Button
                  className="btn btn-primary mt-3"
                  onClick={handleAdd}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Group"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Group Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
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

export default dynamic(() => Promise.resolve(AddLibraryGroup), { ssr: false });
