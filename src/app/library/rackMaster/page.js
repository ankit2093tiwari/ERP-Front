"use client"; // This ensures client-side rendering in Next.js

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable"; // Ensure the path to the DataTable component is correct
import axios from "axios";
import { CgAddR } from "react-icons/cg";
import styles from "@/app/medical/routine-check-up/page.module.css"; // Assuming the same styles are used

const RackandShelf = () => {
  const [racks, setRacks] = useState([]); // State for racks
  const [newRackName, setNewRackName] = useState(""); // State for new rack name
  const [newShelfName, setNewShelfName] = useState(""); // State for new shelf name
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for add form
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Rack Name",
      selector: (row) => row.rackName || "N/A",
      sortable: true,
    },
    {
      name: "Shelf Name",
      selector: (row) => row.shelfName || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="editButton"
            onClick={() => handleEdit(row.id)} // Assuming id is the unique identifier
          >
            <FaEdit />
          </button>
          <button
            className="deleteButton"
            onClick={() => handleDelete(row.id)} // Assuming id is the unique identifier
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch racks from API
  const fetchRacks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/rack-shelf"); // Replace with your API URL
      const fetchedRacks = Array.isArray(response.data?.data) ? response.data.data : [];
      setRacks(fetchedRacks);
    } catch (err) {
      console.error("Error fetching racks:", err);
      setError("Failed to fetch racks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new rack
  const handleAddRack = async () => {
    if (newRackName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/rack-shelf", {
          rackName: newRackName,
        });

        setRacks((prevRacks) => [...prevRacks, response.data]);
        setNewRackName("");
        setShowAddForm(false);
      } catch (err) {
        console.error("Error adding rack:", err);
        setError("Failed to add rack. Please try again later.");
      }
    } else {
      alert("Please enter a valid rack name.");
    }
  };

  // Handle adding a new shelf
  const handleAddShelf = async () => {
    if (newShelfName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/rack-shelf", {
          shelfName: newShelfName,
        });

        setRacks((prevRacks) => [...prevRacks, response.data]);
        setNewShelfName("");
        setShowAddForm(false);
      } catch (err) {
        console.error("Error adding shelf:", err);
        setError("Failed to add shelf. Please try again later.");
      }
    } else {
      alert("Please enter a valid shelf name.");
    }
  };

  // Handle editing a rack
  const handleEdit = async (id) => {
    const item = racks.find((row) => row.id === id);
    const updatedRackName = prompt("Enter new rack name:", item?.rackName || "");
    const updatedShelfName = prompt("Enter new shelf name:", item?.shelfName || "");

    if (updatedRackName && updatedShelfName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`, {
          rackName: updatedRackName,
          shelfName: updatedShelfName,
        });

        setRacks((prevRacks) =>
          prevRacks.map((row) =>
            row.id === id
              ? { ...row, rackName: updatedRackName, shelfName: updatedShelfName }
              : row
          )
        );

        alert("Rack updated successfully!");
      } catch (err) {
        console.error("Error updating rack:", err);
        setError("Failed to update rack. Please try again later.");
      }
    }
  };

  // Handle deleting a rack
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this rack?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`);

        setRacks((prevRacks) =>
          prevRacks.filter((row) => row.id !== id)
        );

        alert("Rack deleted successfully!");
      } catch (err) {
        console.error("Error deleting rack:", err);
        setError("Failed to delete rack. Please try again later.");
      }
    }
  };

  // Fetch racks on component mount
  useEffect(() => {
    fetchRacks();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`mb-4 ${styles.search}`}
        >
          Add Rack / Shelf
        </Button>

        {showAddForm && (
          <div className="result">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className={styles.class}>Rack Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Rack Name"
                  value={newRackName}
                  onChange={(e) => setNewRackName(e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className={styles.class}>Shelf Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Shelf Name"
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Button onClick={handleAddRack} className={styles.search}>
                  Add Rack
                </Button>
                <Button onClick={handleAddShelf} className={styles.search}>
                  Add Shelf
                </Button>
              </Col>
            </Row>
          </div>
        )}

        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Rack & Shelf Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={racks} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(RackandShelf), { ssr: false });
