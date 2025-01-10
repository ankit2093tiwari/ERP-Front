
"use client";
import React, { useState, useEffect } from "react";
import Table from "@/app/component/DataTable"; // Ensure the path to the DataTable component is correct
import styles from "@/app/students/add-new-student/page.module.css";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, Button } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import axios from "axios";

const StoreMaster = () => {
  const [data, setData] = useState([]); // State to hold the table data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors
  const [formData, setFormData] = useState({ storeName: "" });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1, // Auto-incrementing index for rows
      sortable: true,
      width: "80px",
    },
    {
      name: "Store Name",
      selector: (row) => row.storeName || "N/A", // Fallback for missing storeName
      sortable: true,
    },
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/stores");

      // Check if the response has the expected structure
      if (response.data && Array.isArray(response.data)) {
        setData(response.data); // Assuming the API returns an array of store objects
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setData(response.data.data); // Handle nested response structure
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
    const item = data.find((row) => row._id === id); // Ensure _id matches the unique key in your data
    const updatedName = prompt("Enter new name:", item?.storeName || "");

    if (updatedName) {
      try {
        const response = await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/stores/${id}`,
          { storeName: updatedName }
        );
        if (response.data) {
          setData((prevData) =>
            prevData.map((row) =>
              row._id === id ? { ...row, storeName: updatedName } : row
            )
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
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/stores/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete entry. Please try again later.");
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsPopoverOpen(false);
  };

  return (
    <Container className={styles.vehicle}>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb style={{ marginLeft: "20px" }}>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Store Master</Breadcrumb.Item>
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
            <CgAddR style={{ fontSize: "27px", marginTop: "-2px", marginRight: "5px" }} /> Add Store
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
              <h3>Add Store</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom03">
                    <FormLabel required>Store Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Add Store</Button>
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
            Stock Store Details
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
          <div className={styles.buttons} style={{ float: "right", marginRight: "10px" }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StoreMaster;
