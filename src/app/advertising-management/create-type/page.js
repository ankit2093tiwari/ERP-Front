"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Table,
} from "react-bootstrap";
import axios from "axios";

const CreateType = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showForm, setShowForm] = useState(false); // Form visibility
  const [newTypeName, setNewTypeName] = useState(""); // New type name

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/advertisings"
      );
      if (response.status === 200 && response.data.data) {
        setData(response.data.data);
      } else {
        setError("Failed to load data. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please check the API URL.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new type
  const handleAdd = async () => {
    if (newTypeName.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/advertisings",
          { type_name: newTypeName }
        );
        if (response.status === 201) {
          setData((prevData) => [...prevData, response.data.data]);
          setNewTypeName("");
          setShowForm(false);
        } else {
          alert("Failed to add type. Please try again.");
        }
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add type. Please try again.");
      }
    } else {
      alert("Please enter a valid type name.");
    }
  };

  // Edit type
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new type name:", item?.type_name || "");
    if (updatedName) {
      try {
        const response = await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/advertisings/${id}`,
          { type_name: updatedName }
        );
        if (response.status === 200) {
          setData((prevData) =>
            prevData.map((row) =>
              row._id === id ? { ...row, type_name: updatedName } : row
            )
          );
        } else {
          alert("Failed to update type. Please try again.");
        }
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update type. Please try again.");
      }
    }
  };

  // Delete type
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this type?")) {
      try {
        const response = await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/advertisings/${id}`
        );
        if (response.status === 200) {
          setData((prevData) => prevData.filter((row) => row._id !== id));
        } else {
          alert("Failed to delete type. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete type. Please try again.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        {/* Add New Type Button */}
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`mb-4 ${styles.search}`}
        >
          <CgAddR /> New Type
        </Button>

        {/* Add Type Form */}
        {showForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Type Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Type Name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add Type
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Advertising Type Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <Table bordered>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={row._id}>
                      <td>{index + 1}</td>
                      <td>{row.type_name || "N/A"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="editButton"
                            onClick={() => handleEdit(row._id)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="editButton btn-danger"
                            onClick={() => handleDelete(row._id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(CreateType), { ssr: false });
