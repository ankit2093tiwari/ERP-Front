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
  FormSelect,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user_type: "",
    username: "",
    status: "",
    password: "",
    full_name: "",
    image: null,
  });

  const baseURL = "https://erp-backend-fy3n.onrender.com/api/users";

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Username",
      selector: (row) => row.username || "N/A",
      sortable: true,
    },
    {
      name: "Full Name",
      selector: (row) => row.full_name || "N/A",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button
              className="editButton"
              onClick={() => handleUpdate(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row)}
            >
              <FaEdit />
            </button>
          )}
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

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      user_type: user.user_type || "",
      username: user.username || "",
      status: user.status || "",
      password: "", // Don't pre-fill password for security
      full_name: user.full_name || "",
      image: null,
    });
    setIsPopoverOpen(true);
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("user_type", formData.user_type);
      formData.append("username", formData.username);
      formData.append("status", formData.status);
      if (formData.password) formData.append("password", formData.password);
      formData.append("full_name", formData.full_name);
      if (formData.image) formData.append("image", formData.image);

      await axios.put(`${baseURL}/${id}`, formData);
      setSuccess("User updated successfully");
      setError("");
      fetchData();
      setEditingId(null);
      setIsPopoverOpen(false);
      setFormData({
        user_type: "",
        username: "",
        status: "",
        password: "",
        full_name: "",
        image: null,
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating data:", error);
      setError(error.response?.data?.message || "Failed to update user. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${baseURL}/${id}`);
        setSuccess("User deleted successfully");
        setError("");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    const { user_type, username, status, password, full_name, image } = formData;
    if (!username.trim() || !password.trim() || !user_type.trim() || !status.trim() || !full_name.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append("user_type", user_type);
      formDataObj.append("username", username);
      formDataObj.append("status", status);
      formDataObj.append("password", password);
      formDataObj.append("full_name", full_name);
      if (image) formDataObj.append("image", image);

      const response = await axios.post(baseURL, formDataObj);
      setSuccess("User added successfully");
      setError("");
      fetchData();
      setFormData({
        user_type: "",
        username: "",
        status: "",
        password: "",
        full_name: "",
        image: null,
      });
      setIsPopoverOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding data:", error);
      setError(error.response?.data?.message || "Failed to add user. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Username", "Full Name", "Email", "Phone", "Status"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.username || "N/A",
      row.full_name || "N/A",
      row.email || "N/A",
      row.phone || "N/A",
      row.status || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Username", "Full Name", "Email", "Phone", "Status"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.username || "N/A"}\t${row.full_name || "N/A"}\t${row.email || "N/A"}\t${row.phone || "N/A"}\t${row.status || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "User Management", link: "/userManagement/all-module" },
    { label: "Add User", link: "null" },
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
          {success && (
            <Alert variant="success" onClose={() => setSuccess("")} dismissible>
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add User
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit User" : "Add New User"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setEditingId(null);
                    setError("");
                    setFormData({
                      user_type: "",
                      username: "",
                      status: "",
                      password: "",
                      full_name: "",
                      image: null,
                    });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">User Type</FormLabel>
                    <FormSelect 
                      name="user_type" 
                      value={formData.user_type} 
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="1">Fees</option>
                      <option value="2">Other</option>
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Username</FormLabel>
                    <FormControl
                      type="text"
                      name="username"
                      placeholder="User Name"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Status</FormLabel>
                    <FormSelect 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="1">Active</option>
                      <option value="2">Inactive</option>
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Password</FormLabel>
                    <FormControl
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={editingId ? "Leave blank to keep current" : ""}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Full Name</FormLabel>
                    <FormControl
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Upload User Image</FormLabel>
                    <FormControl 
                      type="file" 
                      name="image" 
                      onChange={handleChange} 
                    />
                  </Col>
                </Row>
                <Button 
                  onClick={editingId ? () => handleUpdate(editingId) : handleAdd} 
                  className="btn btn-primary"
                >
                  {editingId ? "Update User" : "Add User"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>User Records</h2>
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

export default dynamic(() => Promise.resolve(AddUser), { ssr: false });