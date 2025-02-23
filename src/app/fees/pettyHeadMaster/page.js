"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const PettyHeadMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPettyHead, setNewPettyHead] = useState({
    petty_name: "",
    head_type: "", // default is empty, can be set to 'Add' or 'Subtract'
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Petty Head Name",
      selector: (row) => row.petty_name || "N/A",
      sortable: true,
    },
    {
      name: "Head Type",
      selector: (row) => row.head_type || "N/A",
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

  // Fetch PettyHeads
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-petty-heads");
      if (response.data && response.data.pettyHeads && response.data.pettyHeads.length > 0) {
        setData(response.data.pettyHeads);
      } else {
        setData([]); // Set empty array if no records are found
        setError("No records found.");
      }
    } catch (err) {
      setData([]); // Set empty array if there's an error fetching data
      setError("Failed to fetch petty heads.");
    } finally {
      setLoading(false);
    }
  };

  // Add new PettyHead
  const handleAdd = async () => {
    if (newPettyHead.petty_name.trim() && newPettyHead.head_type.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-petty-heads", newPettyHead);
        setData((prevData) => [...prevData, response.data.pettyHead]);
        setNewPettyHead({ petty_name: "", head_type: "" });
        setShowAddForm(false);
        fetchData(); // Fetch data again after adding new petty head
      } catch (err) {
        setError("Failed to add petty head.");
      }
    } else {
      alert("Both Petty Head Name and Head Type are required.");
    }
  };

  // Edit PettyHead
  const handleEdit = async (id) => {
    const pettyHead = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new petty head name:", pettyHead?.petty_name || "");
    const updatedType = prompt("Enter new head type (Add or Subtract):", pettyHead?.head_type || "");

    if (updatedName && updatedType) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-petty-heads/${id}`, { petty_name: updatedName, head_type: updatedType });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, petty_name: updatedName, head_type: updatedType } : row
          )
        );
      } catch (err) {
        setError("Failed to update petty head.");
      }
    }
  };

  // Delete PettyHead
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this petty head?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-petty-heads/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete petty head.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/petty-heads">Petty Heads</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Petty Heads</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
        <CgAddR /> Add Petty Head
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Petty Head</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Petty Head Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Petty Head Name"
                  value={newPettyHead.petty_name}
                  onChange={(e) => setNewPettyHead({ ...newPettyHead, petty_name: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Head Type</FormLabel>
                <FormControl
                  as="select"
                  value={newPettyHead.head_type}
                  onChange={(e) => setNewPettyHead({ ...newPettyHead, head_type: e.target.value })}
                >
                  <option value="">Select Head Type</option>
                  <option value="Add">Add</option>
                  <option value="Subtract">Subtract</option>
                </FormControl>
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Petty Head
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Petty Head Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && data.length === 0 && <p>No records found.</p>}
        {!loading && !error && data.length > 0 && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(PettyHeadMaster), { ssr: false });
