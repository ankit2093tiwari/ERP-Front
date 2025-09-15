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
import { addCategory, deleteCategory, getCategories, updateCategory } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const CategoryMasterPage = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Category Name",
      selector: (row) => row.category_name || "N/A",
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
      const response = await getCategories()
      setData(response?.data)
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setIsEditFormOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.warning("Category name cannot be empty.");
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() === categoryName.trim().toLowerCase() && 
        cat._id !== editingCategory._id
    );

    if (exists) {
      toast.warning("Category with this name already exists!");
      return;
    }

    try {
      const res = await updateCategory(editingCategory._id, { category_name: categoryName })
      toast.success("Category updated successfully!");
      fetchData();
      setIsEditFormOpen(false);
      setEditingCategory(null);
      setCategoryName("");
    } catch (error) {
      toast.error("Failed to update category. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id)
        toast.success("Category deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete category. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!categoryName.trim()) {
      setFieldError("Category name is required.");
      toast.warning("Please enter a valid category name.");
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() === categoryName.trim().toLowerCase()
    );

    if (exists) {
      setFieldError("Category already exists.");
      toast.warning("Category already exists!");
      return;
    }

    try {
      const response = await addCategory({
        category_name: categoryName,
      });

      toast.success("Category added successfully!");
      fetchData();
      setCategoryName("");
      setIsAddFormOpen(false);
      setFieldError("");
    } catch (error) {
      toast.error("Failed to add category. Please try again later.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.category_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Category Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.category_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Category Master", link: null },
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
              <CgAddR /> Add Category
            </Button>
          )}

          {isAddFormOpen && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading">
                <h2>Add New Category</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setCategoryName("");
                    setFieldError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Category Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && <div className="text-danger mt-1">{fieldError}</div>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="me-2" variant="success">
                  Add Category
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setCategoryName("");
                    setFieldError("");
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
                <h2>Edit Category</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsEditFormOpen(false);
                    setEditingCategory(null);
                    setCategoryName("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Category Name<span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && <div className="text-danger mt-1">{fieldError}</div>}
                  </Col>
                </Row>
                <Button onClick={handleSave} className="me-2" variant="success">
                  Update Category
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsEditFormOpen(false);
                    setEditingCategory(null);
                    setCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Category Records</h2>
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

export default dynamic(() => Promise.resolve(CategoryMasterPage), {
  ssr: false,
});