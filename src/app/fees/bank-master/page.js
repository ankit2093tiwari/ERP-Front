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

const BankMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBank, setNewBank] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Bank Name",
      selector: (row) => row.bank_name || "N/A",
      cell: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.bank_name
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton btn-success" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id, row.bank_name)}>
              <FaEdit />
            </button>
          )}
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-banks");
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch banks.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-banks/${id}`, {
        bank_name: editedName,
      });
      setData((prevData) =>
        prevData.map((row) => (row._id === id ? { ...row, bank_name: editedName } : row))
      );
      fetchData();
      setEditId(null);
    } catch (err) {
      setError("Failed to update bank.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-banks/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        fetchData();
      } catch (err) {
        setError("Failed to delete bank.");
      }
    }
  };

  const handleAdd = async () => {
    if (newBank.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/add-banks",
          { bank_name: newBank }
        );
        setData((prevData) => [...prevData, response.data]);
        setNewBank("");
        setIsPopoverOpen(false);
        fetchData();
      } catch (err) {
        setError("Failed to add bank.");
      }
    }
  };

  const handlePrint = async () => {
      const tableHeaders = [["#", "Bank Name"]];
      const tableRows = data.map((row, index) => [
        index + 1,
        row.bank_name || "N/A",
      ]);

       printContent(tableHeaders, tableRows);
    }

  const handleCopy = () => {
      const headers = ["#", "Bank Name"]; 
      const rows = data.map((row, index) => `${index + 1}\t${row.bank_name || "N/A"}`);
      copyContent(headers, rows);
     
    }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="">
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/banks">Banks</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Banks</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary">
        <CgAddR /> Add Bank
      </Button>

      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Bank</h2>
            <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>
              X
            </button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Bank Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Bank Name"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Bank
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Bank Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} handlePrint={handlePrint} handleCopy={handleCopy} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(BankMaster), { ssr: false });