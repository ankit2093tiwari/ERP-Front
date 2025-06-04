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

const ExisitingUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    usertype: "",
    status: "",
    userfullname: "",
    userimg: null,
    authorities: {
      view: false,
      edit: false,
      submit: false,
      // Add all other authority fields here
    }
  });

  const baseURL = "https://erp-backend-fy3n.onrender.com/api";

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
      selector: (row) => row.userfullname || "N/A",
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
      const response = await axios.get(`${baseURL}/all-users`);
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
      username: user.username || "",
      password: "", 
      usertype: user.usertype || "",
      status: user.status || "",
      userfullname: user.userfullname || "",
      userimg: null,
      authorities: user.authorities || {
        view: false,
        edit: false,
        submit: false,
        // Initialize all other authority fields
      }
    });
    setIsPopoverOpen(true);
  };

  const handleUpdate = async (id) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("usertype", formData.usertype);
      formDataObj.append("status", formData.status);
      if (formData.password) formDataObj.append("password", formData.password);
      formDataObj.append("userfullname", formData.userfullname);
      if (formData.userimg) formDataObj.append("userimg", formData.userimg);
      formDataObj.append("authorities", JSON.stringify(formData.authorities));

      await axios.put(`${baseURL}/update-user/${id}`, formDataObj);
      setSuccess("User updated successfully");
      setError("");
      fetchData();
      setEditingId(null);
      setIsPopoverOpen(false);
      setFormData({
        username: "",
        password: "",
        usertype: "",
        status: "",
        userfullname: "",
        userimg: null,
        authorities: {
          view: false,
          edit: false,
          submit: false,
          // Reset all authority fields
        }
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
        await axios.delete(`${baseURL}/delete-user/${id}`);
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
    const { username, password, usertype, status, userfullname, userimg } = formData;
    if (!username.trim() || !password.trim() || !usertype.trim() || !status.trim() || !userfullname.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append("username", username);
      formDataObj.append("password", password);
      formDataObj.append("usertype", usertype);
      formDataObj.append("status", status);
      formDataObj.append("userfullname", userfullname);
      if (userimg) formDataObj.append("userimg", userimg);
      formDataObj.append("authorities", JSON.stringify(formData.authorities));

      const response = await axios.post(`${baseURL}/create-user`, formDataObj);
      setSuccess("User added successfully");
      setError("");
      fetchData();
      setFormData({
        username: "",
        password: "",
        usertype: "",
        status: "",
        userfullname: "",
        userimg: null,
        authorities: {
          view: false,
          edit: false,
          submit: false,
          // Reset all authority fields
        }
      });
      setIsPopoverOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding data:", error);
      setError(error.response?.data?.message || "Failed to add user. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (name.startsWith("authorities.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        authorities: {
          ...prev.authorities,
          [field]: checked
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : (files ? files[0] : value),
      }));
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "UserName", "Full Name", "User Type", "Status"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.username || "N/A",
      row.userfullname || "N/A",
      row.usertype || "N/A",
      row.status || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "UserName", "Full Name", "User Type", "Status"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.username || "N/A"}\t${row.userfullname || "N/A"}\t${row.usertype || "N/A"}\t${row.status || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "User Management", link: "/userManagement/all-module" },
    { label: "Existing User", link: "null" },
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
                      username: "",
                      password: "",
                      usertype: "",
                      status: "",
                      userfullname: "",
                      userimg: null,
                      authorities: {
                        view: false,
                        edit: false,
                        submit: false,
                        // Reset all authority fields
                      }
                    });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Username</FormLabel>
                    <FormControl
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
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
                    <FormLabel className="labelForm">User Type</FormLabel>
                    <FormSelect 
                      name="usertype" 
                      value={formData.usertype} 
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="fees">Fees</option>
                      <option value="other">Other</option>
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Status</FormLabel>
                    <FormSelect 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="deactive">Deactive</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Full Name</FormLabel>
                    <FormControl
                      type="text"
                      name="userfullname"
                      value={formData.userfullname}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Upload User Image</FormLabel>
                    <FormControl 
                      type="file" 
                      name="userimg" 
                      onChange={handleChange} 
                    />
                  </Col>
                </Row>
                
                {/* Authorities Section - you can expand this with all authority fields */}
                <Row className="mb-3">
                  <Col lg={12}>
                    <h5>Authorities</h5>
                  </Col>
                  <Col lg={3}>
                    <Form.Check
                      type="checkbox"
                      label="View"
                      name="authorities.view"
                      checked={formData.authorities.view || false}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={3}>
                    <Form.Check
                      type="checkbox"
                      label="Edit"
                      name="authorities.edit"
                      checked={formData.authorities.edit || false}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col lg={3}>
                    <Form.Check
                      type="checkbox"
                      label="Submit"
                      name="authorities.submit"
                      checked={formData.authorities.submit || false}
                      onChange={handleChange}
                    />
                  </Col>
                  {/* Add more authority checkboxes as needed */}
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
            <h2>Existing User Records</h2>
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

export default dynamic(() => Promise.resolve(ExisitingUser), { ssr: false });