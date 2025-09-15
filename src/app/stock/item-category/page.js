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
  Alert,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewCategory, deleteCategoryById, getItemCategories, updateCategoryById } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const ItemCategory = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [formData, setFormData] = useState({
    categoryName: ""
  });
  const [formErrors, setFormErrors] = useState({});


  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName,
      cell: (row) =>
        editingId === row._id ? (
          <div>
            <FormControl
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              isInvalid={!editedName.trim()}
            />
          </div>
        ) : (
          row.categoryName || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <Button
                variant="success" size="sm"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </Button>
              <Button
                variant="danger" size="sm"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="success" size="sm"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </Button>
              <Button
                variant="danger" size="sm"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </Button>
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
      const response = await getItemCategories()
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to fetch item categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditedName(category.categoryName);
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    const isDuplicate = data.some(
      (category) =>
        category._id !== id &&
        category.categoryName.toLowerCase() === editedName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Category name already exists.");
      return;
    }

    try {
      const response = await updateCategoryById(id, { categoryName: editedName.trim() });
      toast.success(response.message || "Item category updated successfully.");
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Failed to update category. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await deleteCategoryById(id)
        toast.success(response.message || "Category deleted successfully.")
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Failed to delete category. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    const errors = {};

    if (!formData.categoryName.trim()) {
      errors.categoryName = "Category name is required.";
    } else if (
      data.find(
        (category) =>
          category.categoryName.toLowerCase() === formData.categoryName.trim().toLowerCase()
      )
    ) {
      errors.categoryName = "Category name already exists.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await addNewCategory({ categoryName: formData.categoryName.trim() });
      toast.success(response.message || "Category added successfully.");
      fetchData();
      setFormData({ categoryName: "" });
      setFormErrors({});
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error adding data:", error);
      toast.error("Failed to add category. Please try again later.");
    }
  };


  const handlePrint = () => {
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.categoryName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Category Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.categoryName || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Item Category", link: null },
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
          {error && <Alert variant="danger">{error}</Alert>}

          {hasSubmitAccess && (
            <Button
              onClick={() => setIsPopoverOpen(true)}
              className="btn-add"
            >
              <CgAddR /> Add Category
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Category</h2>
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
                    <FormLabel className="labelForm">Category Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={formData.categoryName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ categoryName: value });
                        // Clear errors on typing
                        if (value.trim()) {
                          setFormErrors((prev) => ({ ...prev, categoryName: "" }));
                        }
                      }}
                      isInvalid={!!formErrors.categoryName}
                    />
                    {formErrors.categoryName && (
                      <div className="text-danger mt-1">{formErrors.categoryName}</div>
                    )}

                  </Col>
                </Row>
                <Button onClick={handleAdd} variant="success">
                  Add Category
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Item Categories</h2>
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

export default dynamic(() => Promise.resolve(ItemCategory), { ssr: false });