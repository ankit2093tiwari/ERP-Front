"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, Button } from "react-bootstrap";
import axios from "axios";

const ExisitingUser = () => {
  const [data, setData] = useState([]); // User data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const baseURL = "https://erp-backend-fy3n.onrender.com/api/users";

  // Fetch user data from API
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

  // Edit a user's data
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new name:", item?.username || "");
    if (updatedName) {
      try {
        await axios.put(`${baseURL}/${id}`, { username: updatedName });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, username: updatedName } : row
          )
        );
      } catch (error) {
        console.error("Error updating user data:", error);
        setError("Failed to update user data. Please try again later.");
      }
    }
  };

  // Delete a user's data
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${baseURL}/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

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
      selector: (row) => row.username || "N/A",
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

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Existing User Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(ExisitingUser), { ssr: false });
