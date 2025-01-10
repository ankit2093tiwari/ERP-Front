"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect } from "react-bootstrap";
import axios from "axios";

const AddUser = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newUser, setNewUser] = useState({
    user_type: "",
    username: "",
    status: "",
    password: "",
    full_name: "",
    image: null,
  }); // New user data

  const baseURL = "https://erp-backend-fy3n.onrender.com/api/users"; // Updated base URL

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Username",
      selector: (row) => safeRender(row.username),
      sortable: true,
    },
    {
      name: "Full Name",
      selector: (row) => safeRender(row.name),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => safeRender(row.email),
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => safeRender(row.phone),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => safeRender(row.status),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Safe rendering function to handle unexpected data types
  const safeRender = (value) => {
    if (value instanceof RegExp) {
      return "Invalid Data"; // If it's a regular expression, render a default string
    }
    return value || "N/A"; // Return value or "N/A" if undefined or null
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(baseURL);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing entry
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new username:", item?.username || "");
    if (updatedName) {
      try {
        await axios.put(`${baseURL}/${id}`, { username: updatedName });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, username: updatedName } : row
          )
        );
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update data. Please try again later.");
      }
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${baseURL}/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Add a new entry
  const handleAdd = async () => {
    const { user_type, username, status, password, full_name, image } = newUser;
    if (username.trim() && password.trim() && user_type.trim() && status.trim() && full_name.trim()) {
      const formData = new FormData();
      formData.append("user_type", user_type);
      formData.append("username", username);
      formData.append("status", status);
      formData.append("password", password);
      formData.append("full_name", full_name);
      if (image) formData.append("image", image);

      try {
        const response = await axios.post(baseURL, formData);
        setData((prevData) => [...prevData, response.data]);
        setNewUser({
          user_type: "",
          username: "",
          status: "",
          password: "",
          full_name: "",
          image: null,
        });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add user. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: files ? files[0] : value,
    }));
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add User
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>User Type</FormLabel>
                <FormSelect name="user_type" value={newUser.user_type} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">Fees</option>
                  <option value="2">Other</option>
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel>Username</FormLabel>
                <FormControl
                  required
                  type="text"
                  name="username"
                  placeholder="User Name"
                  value={newUser.username}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Status</FormLabel>
                <FormSelect name="status" value={newUser.status} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="1">Active</option>
                  <option value="2">Inactive</option>
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel>Password</FormLabel>
                <FormControl
                  required
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col lg={6}>
                <FormLabel>Full Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  name="full_name"
                  value={newUser.full_name}
                  onChange={handleChange}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Upload User Image</FormLabel>
                <FormControl type="file" name="image" onChange={handleChange} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add User
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>User Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddUser), { ssr: false });
