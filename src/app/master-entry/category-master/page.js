"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';

const CategoryMasterPage = () => {
  const [categories, setCategories] = useState([]); // State for categories
  const [newCategoryName, setNewCategoryName] = useState(""); // State for new category name
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for add form
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Table columns configuration
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
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
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

      // Ensure the response data is an array
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
      } catch (err) {
        console.error("Error adding category:", err);
        setError("Failed to add category. Please try again later.");
      }
    } else {
      alert("Please enter a valid category name.");
    }
  };

  // Handle editing a category
  const handleEdit = async (id) => {
    const item = categories.find((row) => row._id === id);
    const updatedName = prompt(
      "Enter new category name:",
      item?.category_name || ""
    );
    if (updatedName) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/categories/${id}`,
          {
            category_name: updatedName,
          }
        );

        // Update the category in state
        setCategories((prevCategories) =>
          prevCategories.map((row) =>
            row._id === id ? { ...row, category_name: updatedName } : row
          )
        );

        alert("Category updated successfully!");
      } catch (err) {
        console.error("Error updating category:", err);
        setError("Failed to update category. Please try again later.");
      }
    }
  };

  // Handle deleting a category
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/categories/${id}`
        );

        // Remove the category from the state array
        setCategories((prevCategories) =>
          prevCategories.filter((row) => row._id !== id)
        );

        alert("Category deleted successfully!");
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category. Please try again later.");
      }
    }
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
          className={`mb-4 ${styles.search}`}
        >
         <CgAddR/> Add Category
        </Button>

        {showAddForm && (
      <div className="cover-sheet">
                    <div className="studentHeading"><h2>  Add Document</h2></div>
                      <Form className="formSheet">
         
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Category Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Button onClick={handleAddCategory} className={styles.search}>
                  Add Category
                </Button>
              </Col>
            </Row>
            </Form>
          </div>
        )}

        <Row>
          <Col>
          <div className="tableSheet">
            <h2>Category Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <Table columns={columns} data={categories} />
            )}
            </div>
          </Col>
        </Row>
     
    </Container>
  );
};

export default dynamic(() => Promise.resolve(CategoryMasterPage), { ssr: false });
