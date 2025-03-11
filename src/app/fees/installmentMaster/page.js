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
  Button,
  Breadcrumb
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { copyContent, printContent } from "@/app/utils";

const InstallmentMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newInstallment, setNewInstallment] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track which row is being edited
  const [editedName, setEditedName] = useState(""); // Store the edited installment name

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments");
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch installments.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new installment
  const handleAdd = async () => {
    if (newInstallment.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-installments", {
          installment_name: newInstallment
        });
        setData((prevData) => [...prevData, response.data.data]);
        setNewInstallment("");
        setIsPopoverOpen(false);
        fetchData(); // Refresh data
      } catch (err) {
        setError("Failed to add installment.");
      }
    }
  };

  // Enter edit mode for a row
  const handleEdit = (row) => {
    setEditingId(row._id); // Set the ID of the row being edited
    setEditedName(row.installment_name); // Set the current installment name
  };

  // Save changes for the edited row
  const handleUpdate = async (id) => {
    if (editedName.trim()) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-installments/${id}`, {
          installment_name: editedName
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, installment_name: editedName } : row
          )
        );
        fetchData();
        setEditingId(null); // Exit edit mode
      } catch (err) {
        setError("Failed to update installment.");
      }
    }
  };

  // Delete an installment
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this installment?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-installments/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        fetchData();
      } catch (err) {
        setError("Failed to delete installment.");
      }
    }
  };

  // Handle Print Functionality
  const handlePrint = async () => {
    const tableHeaders = [["#", "Installment Name"]]; // Add headers
    const tableRows = data.map((row, index) => [
      index + 1,
      row.installment_name || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  // Copy table data to clipboard
  const handleCopy = () => {
    const headers = ["#", "Installment Name"]; // Tab-separated headers
    const rows = data.map((row, index) => `${index + 1}\t${row.installment_name || "N/A"}`);
    
    copyContent(headers, rows);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Table columns definition
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Installment Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.installment_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Container className="">
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/installments">Installments</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Installments</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Add Installment Button */}
      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary">
        <CgAddR /> Add Installment
      </Button>

      {/* Add Installment Popover */}
      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Installment</h2>
            <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Installment Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Installment Name"
                  value={newInstallment}
                  onChange={(e) => setNewInstallment(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Installment
            </Button>
          </Form>
        </div>
      )}

      {/* Installment Records Table */}
      <div className="tableSheet">
        <h2>Installment Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <Table
            columns={columns}
            data={data}
            handlePrint={handlePrint}
            handleCopy={handleCopy}
          />
        )}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(InstallmentMaster), { ssr: false });