"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Thought = () => {
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newThought, setNewThought] = useState({ date: today, thought_name: "" });

  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    {
      name: "Date",
      selector: (row) =>
        editRowId === row._id ? (
          <FormControl
            type="date"
            value={editValues.date}
            onChange={(e) => handleInputChange(e, "date")}
          />
        ) : (
          new Date(row.date).toLocaleDateString("en-GB")
        ),
      sortable: true,
    },
    {
      name: "Thought Name",
      selector: (row) =>
        editRowId === row._id ? (
          <FormControl
            type="text"
            value={editValues.thought_name}
            onChange={(e) => handleInputChange(e, "thought_name")}
          />
        ) : (
          row.thought_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id)}>
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
        await axios.post("https://erp-backend-fy3n.onrender.com/api/thoughts", newThought);
        setNewThought({ date: today, thought_name: "" });
        setShowAddForm(false);
        fetchData();
      } catch {
        setError("Failed to add thought.");
      }
    }
  };

  const handleEdit = (id) => {
    const item = data.find((row) => row._id === id);
    setEditRowId(id);
    setEditValues({ ...item });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/thoughts/${id}`, {
        thought_name: editValues.thought_name,
        date: editValues.date,
      });
      setEditRowId(null);
      fetchData();
    } catch {
      setError("Failed to update thought.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this thought?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/thoughts/${id}`);
        fetchData();
      } catch {
        setError("Failed to delete thought.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Thought", link: "/thought" }];

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Thought
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Thought</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl
                      type="date"
                      value={newThought.date}
                      onChange={(e) => setNewThought({ ...newThought, date: e.target.value })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Thought Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Thought Name"
                      value={newThought.thought_name}
                      onChange={(e) => setNewThought({ ...newThought, thought_name: e.target.value })}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">Add Thought</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Thought Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Thought), { ssr: false });
