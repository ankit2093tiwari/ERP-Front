"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { CgAddR } from "react-icons/cg";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import {
  getAllSubjectCategories,
  addNewSubjectCategory,
  updateSubjectCategoryById,
  deleteSubjectCategoryById
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const SubjectCategory = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const res = await getAllSubjectCategories();
      if (res.success) {
        setCategories(res.data || []);
      } else {
        toast.error(res.message || "Failed to load categories");
      }
    } catch (err) {
      toast.error("Server error while fetching categories");
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editId) {
        const res = await updateSubjectCategoryById(editId, { updatedName: name });
        if (res.success) {
          toast.success(res.message || "Updated successfully");
          resetForm();
          setIsPopoverOpen(false);
          fetchCategories();
        } else {
          toast.error(res.message || "Failed to update");
        }
      } else {
        const res = await addNewSubjectCategory({ name });
        if (res.success) {
          toast.success(res.message || "Added successfully");
          resetForm();
          setIsPopoverOpen(false);
          fetchCategories();
        } else {
          toast.error(res.message || "Failed to add");
        }
      }
    } catch {
      toast.error("Server error during operation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setName(category.name);
    setEditId(category._id);
    setErrors({});
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      const res = await deleteSubjectCategoryById(id);
      if (res.success) {
        toast.success(res.message || "Deleted successfully");
        fetchCategories();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("Server error while deleting");
    }
  };

  const resetForm = () => {
    setName("");
    setEditId(null);
    setErrors({});
  };

  const handleCopy = () => {
    const headers = ["#", "EntryDate", "Name"];
    const rows = categories.map((item, idx) =>
      `${idx + 1}\t${new Date(item.entryDate).toLocaleDateString()}\t${item.name}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "EntryDate", "Name"]];
    const rows = categories.map((item, idx) => [
      idx + 1,
      new Date(item.entryDate).toLocaleDateString(),
      item.name
    ]);
    printContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px"
    },
    {
      name: "EntryDate",
      selector: row => row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "N/A",
      sortable: true
    },
    {
      name: "Name",
      selector: row => row.name,
      sortable: true
    },
    hasEditAccess && {
      name: "Action",
      cell: row => (
        <>
          <Button
            variant="success"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </>
      )
    }
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Subject Category", link: null },
  ];

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {hasSubmitAccess && (
            <Button className="btn-add" onClick={() => {
              resetForm();
              setIsPopoverOpen(true);
            }}>
              <CgAddR /> Add New Category
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Edit" : "Add"} Subject Category</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    resetForm();
                    setIsPopoverOpen(false);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet mb-4">
                <Row>
                  <Col md={8}>
                    <Form.Label>Subject Category Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Enter subject category name"
                    />
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                  </Col>
                </Row>
                <Row>
                  <Col className="mt-3">
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : editId ? "Update" : "Submit"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="ms-2"
                      onClick={() => {
                        resetForm();
                        setIsPopoverOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Category Records</h2>
            {fetching ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={categories}
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

export default dynamic(() => Promise.resolve(SubjectCategory), { ssr: false });
