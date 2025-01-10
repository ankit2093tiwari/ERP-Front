"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";

const AddGalleryGroup = () => {
  const [data, setData] = useState([]); // Store gallery groups data
  const [formValues, setFormValues] = useState({ name: "" }); // For storing the form values
  const [showResults, setShowResults] = useState(false); // To toggle Add Group form visibility
  const [loading, setLoading] = useState(false); // Loading state for the table data
  const [error, setError] = useState(""); // Error state for handling errors during API calls

  // Columns configuration for the DataTable
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.groupName,
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

  // Fetch all gallery groups from the API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/galleryGroups");
      setData(response.data.data); // Set the fetched data into state
    } catch (error) {
      setError("Error fetching data. Please try again later.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle the "Add Group" form toggle
  const onClick = () => setShowResults(true);

  // Handle adding a new group
  const handleAdd = async () => {
    if (formValues.name.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/galleryGroups", {
          groupName: formValues.name,
        });
        setData((prevData) => [...prevData, response.data]);
        setFormValues({ name: "" });
        setShowResults(false);
      } catch (error) {
        setError("Error adding group. Please try again later.");
        console.error("Error adding group:", error);
      }
    } else {
      alert("Please enter a group name.");
    }
  };

  // Handle editing an existing group
  const handleEdit = async (id) => {
    const updatedName = prompt("Enter new group name:");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`, { groupName: updatedName });
        setData((prevData) =>
          prevData.map((item) =>
            item._id === id ? { ...item, groupName: updatedName } : item
          )
        );
      } catch (error) {
        setError("Error updating group. Please try again later.");
        console.error("Error updating group:", error);
      }
    }
  };

  // Handle deleting a group
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`);
        setData((prevData) => prevData.filter((item) => item._id !== id));
      } catch (error) {
        setError("Error deleting group. Please try again later.");
        console.error("Error deleting group:", error);
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
        <Button onClick={onClick} className={`mb-4 ${styles.search}`}>
          Add Group
        </Button>
        
        {/* Add Group Form */}
        {showResults && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Group Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Group Name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ name: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add Group
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Group Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <Table columns={columns} data={data} />
            )}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddGalleryGroup), { ssr: false });
