// New updated code 
"use client";

import React, { useState, useEffect } from "react";
import Table from "@/app/component/DataTable"; // Ensure this path matches your project structure
import styles from "@/app/students/add-new-student/page.module.css";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, Button } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import axios from "axios";

const ItemCategory = () => {
  const [data, setData] = useState([]); // State to store item categories
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for errors
  const [formData, setFormData] = useState({ categoryName: "" }); // Form data state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false); // Popover state

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemCategories");
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Unexpected API response format. Please contact support.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit entry
  const handleEdit = async (id) => {
    const item = data.find((row) => row.id === id);
    const updatedName = prompt("Enter new category name:", item?.categoryName || "");

    if (updatedName) {
      try {
        const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemCategories/${id}`, {
          categoryName: updatedName,
        });
        if (response.data) {
          setData((prevData) =>
            prevData.map((row) => (row.id === id ? { ...row, categoryName: updatedName } : row))
          );
        }
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update entry. Please try again later.");
      }
    }
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/itemCategories/${id}`);
        setData((prevData) => prevData.filter((row) => row.id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete entry. Please try again later.");
      }
    }
  };

  // Submit new category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/itemCategories", formData);
      if (response.data) {
        setData((prevData) => [...prevData, response.data]);
        setFormData({ categoryName: "" });
        setIsPopoverOpen(false);
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again later.");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName || "N/A",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="editButton" onClick={() => handleEdit(row.id)}>Edit</button>
          <button className="deleteButton" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <Container className={styles.vehicle}>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb style={{ marginLeft: "20px" }}>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Item Category</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            id="submit"
            type="button"
            style={{ marginLeft: "20px" }}
          >
            <CgAddR style={{ fontSize: "27px", marginTop: "-2px", marginRight: "5px" }} /> Add Category
          </button>
          {isPopoverOpen && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                width: "940px",
              }}
            >
              <h3>Add Category</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom03">
                    <FormLabel>Category Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit">Add Category</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2
            style={{
              marginLeft: "23px",
              marginTop: "15px",
              marginBottom: "25px",
              fontSize: "22px",
            }}
          >
            Stock Item Categories
          </h2>
          {loading ? (
            <p>Loading data...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : data.length > 0 ? (
            <Table columns={columns} data={data} />
          ) : (
            <p>No data available.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ItemCategory;
