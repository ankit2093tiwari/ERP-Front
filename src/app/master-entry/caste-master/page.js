"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { copyContent, printContent } from "@/app/utils";
import Breadcrumb from "@/app/component/Breadcrumb"; 

const CasteMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newCasteName, setNewCasteName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Master Entry", href: "/master-entry/all-module" }, 
    { label: "Caste Master", href: null }, 
  ];

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.caste_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id, row.caste_name)}>
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

  const handlePrint = async () => {
    const tableHeaders = [["#", "Caste Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.caste_name || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Caste Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.caste_name || "N/A"}`);

    copyContent(headers, rows);
  };

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/castes");
      const fetchedData = response.data.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        caste_name: item.caste_name || "N/A",
      }));
      setData(normalizedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  // Handle save action
  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/castes/${id}`, {
        caste_name: editedName,
      });
      setData((prevData) =>
        prevData.map((row) =>
          row._id === id ? { ...row, caste_name: editedName } : row
        )
      );
      fetchData(); // Refresh data after update
      setEditingId(null);
    } catch (error) {
      setError("Failed to update data. Please try again later.");
    }
  };

  // Handle soft delete action
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/castes/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id)); // Remove from UI
        fetchData(); // Refresh data after delete
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Handle add action
  const handleAdd = async () => {
    if (newCasteName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/castes", {
          caste_name: newCasteName,
        });
        setData((prevData) => [...prevData, response.data]); // Add to UI
        setNewCasteName("");
        setIsPopoverOpen(false);
        fetchData(); // Refresh data after add
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
          <Breadcrumb items={breadcrumbItems} />
        </Col>
      </Row>
      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary mb-4">
        <CgAddR /> Add Caste
      </Button>

      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Caste</h2>
            <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Caste Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Caste Name"
                  value={newCasteName}
                  onChange={(e) => setNewCasteName(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Caste
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Caste Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(CasteMasterPage), { ssr: false });