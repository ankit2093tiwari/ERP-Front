"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Thought = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newThought, setNewThought] = useState({ date: "", thought_name: "" });

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
        fetchData();
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

  const breadcrumbItems = [{ label: "Thought", link: "/thought" }]

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
