"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewLibraryGroup, deleteLibraryGroupById, getLibraryGroups, updateLibraryGroupById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AddLibraryGroup = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editId, setEditId] = useState(null);

  const [fieldError, setFieldError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getLibraryGroups();
      setData(response.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
      toast.error("Failed to fetch group records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteLibraryGroupById(id);
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
      await addNewLibraryGroup({ groupName: newGroupName.trim() });
      toast.success("Group added successfully");
      fetchData();
      setNewGroupName("");
      setIsAddFormOpen(false);
    } catch (error) {
      toast.error("Failed to add group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (row) => {
    setEditId(row._id);
    setEditGroupName(row.groupName);
    setFieldError("");
    setIsEditFormOpen(true);
  };

  const handleUpdate = async () => {
    setFieldError("");
    if (!editGroupName.trim()) {
      setFieldError("Group name is required");
      return;
    }
    if (editGroupName.length < 3) {
      setFieldError("Group name must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLibraryGroupById(editId, { groupName: editGroupName });
      toast.success("Group updated successfully");
      fetchData();
      setIsEditFormOpen(false);
      setEditGroupName("");
      setEditId(null);
    } catch (error) {
      toast.error("Failed to update group");
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

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Group Name", selector: (row) => row.groupName || "N/A", sortable: true },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEditClick(row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

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
          {hasSubmitAccess && (
            <Button onClick={() => setIsAddFormOpen(true)} className="btn-add">
              <CgAddR /> Add Group
            </Button>
          )}

          {/* Add Group Form */}
          {isAddFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Group</h2>
                <button className="closeForm" onClick={() => setIsAddFormOpen(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={(e) => e.preventDefault()}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Group Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={newGroupName}
                      isInvalid={!!fieldError}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    {fieldError && <Form.Control.Feedback type="invalid">{fieldError}</Form.Control.Feedback>}
                  </Col>
                </Row>
                <Button variant="success" className="mt-3" onClick={handleAdd} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Group"}
                </Button>
              </Form>
            </div>
          )}

          {/* Edit Group Form */}
          {isEditFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Group</h2>
                <button className="closeForm" onClick={() => setIsEditFormOpen(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={(e) => e.preventDefault()}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Group Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={editGroupName}
                      isInvalid={!!fieldError}
                      onChange={(e) => setEditGroupName(e.target.value)}
                    />
                    {fieldError && <Form.Control.Feedback type="invalid">{fieldError}</Form.Control.Feedback>}
                  </Col>
                </Row>
                <Button variant="success" className=" mt-3" onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Group"}
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
              <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddLibraryGroup), { ssr: false });
