"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Alert } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewBookCategory, deleteBookCategoryById, getBookCategories, updateBookCategoryById } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const BookCategory = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editId, setEditId] = useState(null);

  const [fieldError, setFieldError] = useState("");
  const [editFieldError, setEditFieldError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getBookCategories();
      setData(response?.data || []);
    } catch (err) {
      setError("Failed to fetch book categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      setFieldError("Category name is required.");
      return;
    }
    if (trimmedName.length > 50) {
      setFieldError("Category name must be under 50 characters.");
      return;
    }
    if (data.some((item) => item.groupName.toLowerCase() === trimmedName.toLowerCase())) {
      setFieldError("Category name already exists.");
      return;
    }

    try {
      const response = await addNewBookCategory({ groupName: trimmedName });
      toast.success(response?.message || "Book Category added successfully!");
      setNewGroupName("");
      setIsAddFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add book category.");
    }
  };

  const handleEditClick = (row) => {
    setEditId(row._id);
    setEditGroupName(row.groupName);
    setEditFieldError("");
    setIsEditFormOpen(true);
  };

  const handleUpdate = async () => {
    const trimmedName = editGroupName.trim();

    if (!trimmedName) {
      setEditFieldError("Category name is required.");
      return;
    }
    if (trimmedName.length > 50) {
      setEditFieldError("Category name must be under 50 characters.");
      return;
    }
    if (data.some((item) => item._id !== editId && item.groupName.toLowerCase() === trimmedName.toLowerCase())) {
      setEditFieldError("Category name already exists.");
      return;
    }

    try {
      const response = await updateBookCategoryById(editId, { groupName: trimmedName });
      toast.success(response?.message || "Book Category updated successfully!");
      setIsEditFormOpen(false);
      setEditGroupName("");
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await deleteBookCategoryById(id);
        toast.success(response?.message || "Book Category deleted successfully!");
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete category.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.groupName || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Category Name"].join("\t");
    const rows = data.map((row, index) => `${index + 1}\t${row.groupName || "N/A"}`).join("\n");
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Category Name", selector: (row) => row.groupName || "N/A", sortable: true },
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
    { label: "Category Master", link: "null" },
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
              <CgAddR /> Add Book Category
            </Button>
          )}

          {/* Add Form */}
          {isAddFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Category</h2>
                <button className="closeForm" onClick={() => setIsAddFormOpen(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={(e) => e.preventDefault()}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={newGroupName}
                      isInvalid={!!fieldError}
                      onChange={(e) => {
                        setNewGroupName(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Button variant="success" className="mt-3" onClick={handleAdd}>
                  Add Category
                </Button>
              </Form>
            </div>
          )}

          {/* Edit Form */}
          {isEditFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Category</h2>
                <button className="closeForm" onClick={() => setIsEditFormOpen(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={(e) => e.preventDefault()}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={editGroupName}
                      isInvalid={!!editFieldError}
                      onChange={(e) => {
                        setEditGroupName(e.target.value);
                        if (editFieldError) setEditFieldError("");
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{editFieldError}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Button variant="success" className="mt-3" onClick={handleUpdate}>
                  Update Category
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Book Category Records</h2>
            {loading && <p>Loading...</p>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && (
              <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(BookCategory), { ssr: false });
