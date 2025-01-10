"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";

const DailyDairy = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newEntry, setNewEntry] = useState({
    entryDate: "",
    teacherName: "",
    workDetails: "",
  }); // New entry data

  const baseURL = "https://erp-backend-fy3n.onrender.com/api/dailyDairy";

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Entry Date",
      selector: (row) => new Date(row.entryDate).toLocaleDateString() || "N/A",
    },
    {
      name: "Teacher Name",
      selector: (row) =>
        `${row.teacherName?.first_name || "N/A"} ${row.teacherName?.last_name || ""}`,
    },
    {
      name: "Work Details",
      selector: (row) => row.workDetails || "N/A",
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(baseURL);
      const fetchedData = response.data.data || [];
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit an existing entry
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedWorkDetails = prompt(
      "Enter updated work details:",
      item?.workDetails || ""
    );
    if (updatedWorkDetails) {
      try {
        await axios.put(`${baseURL}/${id}`, { workDetails: updatedWorkDetails });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, workDetails: updatedWorkDetails } : row
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
    if (confirm("Are you sure you want to delete this entry?")) {
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
    if (
      newEntry.entryDate.trim() &&
      newEntry.teacherName.trim() &&
      newEntry.workDetails.trim()
    ) {
      try {
        const response = await axios.post(baseURL, newEntry);
        setData((prevData) => [...prevData, response.data.data]);
        setNewEntry({ entryDate: "", teacherName: "", workDetails: "" });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add data. Please try again later.");
      }
    } else {
      alert("Please fill in all fields before adding.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`mb-4 ${styles.search}`}
        >
          Add Entry
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={4}>
                <FormLabel>Entry Date</FormLabel>
                <FormControl
                  type="date"
                  value={newEntry.entryDate}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, entryDate: e.target.value })
                  }
                />
              </Col>
              <Col lg={4}>
                <FormLabel>Teacher Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Teacher Name"
                  value={newEntry.teacherName}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, teacherName: e.target.value })
                  }
                />
              </Col>
              <Col lg={4}>
                <FormLabel>Work Details</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Work Details"
                  value={newEntry.workDetails}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, workDetails: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add Entry
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Daily Dairy Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(DailyDairy), { ssr: false });
