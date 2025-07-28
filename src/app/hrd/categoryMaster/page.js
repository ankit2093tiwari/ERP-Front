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
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [editError, setEditError] = useState("");

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
      name: "Category Name",
      selector: (row) => row.category_name,
      cell: (row) =>
        editingId === row._id ? (
          <div className="w-100">
            <FormControl
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value);
                setEditError("");
              }}
              isInvalid={!!editError}
            />
          </div>
        ) : (
          row.category_name || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess && {
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
                onClick={() => { setEditingId(null); setEditError(""); }}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row._id, row.category_name)}
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

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      toast.warn("Category name cannot be empty.");
      setEditError("Category name cannot be empty.");
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() ===
        editedName.trim().toLowerCase() && cat._id !== id
    );

    if (exists) {
      toast.warn("Category name already exists.");
      setEditError("Category name already exists.");
      return;
    }

    try {
      await updateCategory(id, { category_name: editedName });
      toast.success("Category updated successfully!");
      fetchData();
      setEditingId(null);
      setEditError("");
    } catch (error) {
      toast.error("Failed to update category. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id)
        toast.success("Category deleted successfully");
        fetchData(); // re-fetch and resort
      } catch (error) {
        toast.error("Failed to delete category. Please try again later.", {
          position: "top-right",
        });
      }
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      setFieldError("Category name is required.");
      toast.warning("Please enter a valid category name.");
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() ===
        newCategoryName.trim().toLowerCase()
    );

    if (exists) {
      setFieldError("Category already exists.");
      toast.warning("Category already exists!");
      setIsPopoverOpen(false);
      setNewCategoryName("");
      return;
    }

    try {
      const response = await addCategory({
        category_name: newCategoryName,
      });

      toast.success("Category added successfully!");
      fetchData();
      setNewCategoryName("");
      setIsPopoverOpen(false);
      setFieldError(""); // Clear any previous error
    } catch (error) {
      toast.error("Failed to add category. Please try again later.");
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "hrd", link: "/hrd/allModule" },
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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
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
                    setNewCategoryName("");
                    setFieldError("")
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      isInvalid={!!fieldError}
                    />
                    {fieldError && <div className="text-danger mt-1">{fieldError}</div>}

                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Category
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
