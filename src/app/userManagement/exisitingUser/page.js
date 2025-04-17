"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const ExisitingUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const baseURL = "https://erp-backend-fy3n.onrender.com/api/users";

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(baseURL);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditValue(row.username || "");
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${baseURL}/${id}`, { username: editValue });
      setData((prevData) =>
        prevData.map((row) =>
          row._id === id ? { ...row, username: editValue } : row
        )
      );
      setEditingId(null);
      setEditValue("");
      setSuccess("Username updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating user data:", error);
      setError("Failed to update user data. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${baseURL}/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        setSuccess("User deleted successfully.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again later.");
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Username",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="form-control"
          />
        ) : (
          row.username || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Full Name",
      selector: (row) => row.name || "N/A",
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
            <button className="editButton btn-success" onClick={() => handleUpdate(row._id)}>
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
        <Container className="tableSheet">
          <Row >
            <Col>
              <h2 className="mb-3" style={{ fontSize: "22px" }}>Existing User Records</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table columns={columns} data={data} />
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExisitingUser), { ssr: false });
