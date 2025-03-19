"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import axios from "axios";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const ReligionMasterPage = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newReligionName, setNewReligionName] = useState(""); // New religion name
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        ) : (
          row.religion_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id, row.religion_name)}>
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/religions");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing entry
  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/religions/${id}`, {
        religion_name: editName,
      });
      setData((prevData) =>
        prevData.map((row) =>
          row._id === id ? { ...row, religion_name: editName } : row
        )
      );
      fetchData();
      setEditId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update data. Please try again later.");
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/religions/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        // fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Add a new entry
  const handleAdd = async () => {
    if (newReligionName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/religions", {
          religion_name: newReligionName,
        });
        setData((prevData) => [...prevData, response.data]);
        setNewReligionName("");
        setShowAddForm(false);
        fetchData();
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add data. Please try again later.");
      }
    } else {
      alert("Please enter a valid religion name.");
    }
  };

  const handlePrint = () => {

    const tableHeaders = [["#", "Religion Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.religion_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);

  };

  const handleCopy = () => {
    const headers = ["#", "Religion Name"];
    const row = data.map((row, index) => `${index + 1}\t${row.religion_name || "N/A"}`);
    copyContent(headers, row);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Master Entry", link: "/master-entry/all-module" }, { label: "religion-master", link: "null" }]

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
          <Button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">
            <CgAddR /> {showAddForm ? "Close Form" : "Add Religion"}
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Religion</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Religion Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Religion Name"
                      value={newReligionName}
                      onChange={(e) => setNewReligionName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd}>Add Religion</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Religion Master</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : (
                  <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ReligionMasterPage;
