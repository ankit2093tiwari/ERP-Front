"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";  // You may need to adjust your CSS paths accordingly

const CategoryMasterPage = () => {
  const [categories, setCategories] = useState([]); // State for categories
  const [newCategoryName, setNewCategoryName] = useState(""); // State for new category name
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for add form
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  // Table columns configuration
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    {
      name: "Category Name",
      selector: (row) => row.category_name || "N/A",
      sortable: true,
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.category_name
        )
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton btn-success" onClick={() => handleSave(row._id)}>
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

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/categories"
      );

      const fetchedCategories = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/categories",
          {
            category_name: newCategoryName,
          }
        );

        // Append the new category to the state array
        setCategories((prevCategories) => [...prevCategories, response.data]);
        setNewCategoryName(""); // Reset input field
        setShowAddForm(false); // Hide the form
        fetchCategories();
      } catch (err) {
        console.error("Error adding category:", err);
        setError("Failed to add category. Please try again later.");
      }
    } else {
      alert("Please enter a valid category name.");
    }
  };

  // Handle editing a category
  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedName(row.category_name);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/categories/${id}`, { category_name: editedName });
      setCategories((prev) => prev.map((row) => (row._id === id ? { ...row, category_name: editedName } : row)));
      fetchCategories();
      setEditingId(null);
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again later.");
    }
  };

  // Handle deleting a category
  // const handleDelete = async (id) => {
  //   if (confirm("Are you sure you want to delete this category?")) {
  //     try {
  //       await axios.delete(
  //         `https://erp-backend-fy3n.onrender.com/api/categories/${id}`
  //       );

  //       // Remove the category from the state array
  //       setCategories((prevCategories) =>
  //         prevCategories.filter((row) => row._id !== id)
  //       );
  //       fetchCategories();
  //     } catch (err) {
  //       console.error("Error deleting category:", err);
  //       setError("Failed to delete category. Please try again later.");
  //     }
  //   }
  // };
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/categories/${id}`, { is_deleted: true });
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category. Please try again later.");
      }
    }
  };

  const handlePrint = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = categories.map((row, index) => [index + 1, row.category_name || "N/A"]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleCopy = () => {
    const headers = "#\tCategory Name";
    const rows = categories.map((row, index) => `${index + 1}\t${row.category_name || "N/A"}`).join("\n");
    const fullData = `${headers}\n${rows}`;
    navigator.clipboard.writeText(fullData)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };



  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">
              Master Entry
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Category Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        className="btn btn-primary mb-4"
      >
        <CgAddR /> Add Category
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Category</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Category Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAddCategory} className="btn btn-primary">
              Add Category
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Category Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && <Table columns={columns} data={categories} handleCopy={handleCopy} handlePrint={handlePrint} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(CategoryMasterPage), { ssr: false });
