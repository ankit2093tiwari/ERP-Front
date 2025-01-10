"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";

const Thought = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newThought, setNewThought] = useState({ date: "", name: "" });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Date", selector: (row) => row.date || "N/A", sortable: true },
    { name: "Thought Name", selector: (row) => row.thought_name || "N/A", sortable: true },
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/thoughts");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newThought.thought_name && newThought.date) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/thoughts", newThought);
        setData((prevData) => [...prevData, response.data]);
        setNewThought({ date: "", thought_name: "" });
        setShowAddForm(false);
      } catch {
        setError("Failed to add thought.");
      }
    }
  };

  const handleEdit = async (id) => {
    const thought = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new thought name:", thought?.thought_name || "");
    const updatedDate = prompt("Enter new date (YYYY-MM-DD):", thought?.date || "");

    if (updatedName && updatedDate) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/thoughts/${id}`, {
          thought_name: updatedName,
          date: updatedDate,
        });
        setData((prevData) =>
          prevData.map((row) => (row._id === id ? { ...row, thought_name: updatedName, date: updatedDate } : row))
        );
      } catch {
        setError("Failed to update thought.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this thought?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/thoughts/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch {
        setError("Failed to delete thought.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add Thought
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Date</FormLabel>
                <FormControl
                  type="date"
                  value={newThought.date}
                  onChange={(e) => setNewThought({ ...newThought, date: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Thought Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Thought Name"
                  value={newThought.thought_name}
                  onChange={(e) => setNewThought({ ...newThought, thought_name: e.target.value })}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Thought
            </Button>
          </div>
        )}
        <h2>Thought Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Thought), { ssr: false });
