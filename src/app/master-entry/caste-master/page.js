"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';

const CasteMasterPage = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newCasteName, setNewCasteName] = useState(""); // New caste name

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.caste_name || "N/A", // Default to "N/A" if `casteName` is missing
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/castes");
      const fetchedData = response.data.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        caste_name: item.caste_name || "N/A", // Ensure `casteName` always exists
      }));
      setData(normalizedData);
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
    const updatedName = prompt("Enter new name:", item?.caste_name || "");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/castes/${id}`, {
          caste_name: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, caste_name: updatedName } : row
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
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/castes/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Add a new entry
  const handleAdd = async () => {
    if (newCasteName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/castes", {
          caste_name: newCasteName,
        });
        setData((prevData) => [...prevData, response.data]);
        setNewCasteName("");
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add data. Please try again later.");
      }
    } else {
      alert("Please enter a valid caste name.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">
              Master Entry
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Caste Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
      <CgAddR/> Add Caste
      </Button>
      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading"><h2>  Add Document</h2></div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Caste Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Caste Name"
                  value={newCasteName}
                  onChange={(e) => setNewCasteName(e.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add Caste
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Caste Records</h2> 
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Col>
      </Row>
    
    </Container >
  );
};

export default dynamic(() => Promise.resolve(CasteMasterPage), { ssr: false });
