// new updated code
"use client";
import React, { useState, useEffect } from "react";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/add-new-student/page.module.css";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, Button } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import axios from "axios";

const ItemMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ itemName: "", category: "" });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: true, width: "80px" },
    { name: "Category", selector: (row) => row.categoryName || "N/A", sortable: true },
    { name: "Item Type", selector: (row) => row.itemType || "N/A", sortable: true },
    { name: "Item Name", selector: (row) => row.itemName || "N/A", sortable: true },
    { name: "Maintain Minimum Stock", selector: (row) => row.maintainMinimumStock || "N/A", sortable: true },
    { name: "Description", selector: (row) => row.description || "N/A", sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="editButton" onClick={() => handleEdit(row._id)}>Edit</button>
          <button className="deleteButton" onClick={() => handleDelete(row._id)}>Delete</button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemMasters");
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
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

  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new item name:", item?.itemName || "");

    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemMaster/${id}`, {
          itemName: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, itemName: updatedName } : row
          )
        );
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update entry. Please try again later.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/itemMaster/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete entry. Please try again later.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.vehicle}>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb style={{ marginLeft: "20px" }}>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Item Master</Breadcrumb.Item>
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
            <CgAddR style={{ fontSize: "27px", marginTop: "-2px", marginRight: "5px" }} /> Add Item
          </button>
          {isPopoverOpen && (
            <div
              className="absolute right-0 mt-3 w-60 p-4"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                width: "940px",
              }}
            >
              <h3>Add Item</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6">
                    <FormLabel required>Item Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6">
                    <FormLabel required>Category</FormLabel>
                    <FormControl
                      required
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit">Add Item</Button>
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
            Stock Item Details
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

export default ItemMaster;
