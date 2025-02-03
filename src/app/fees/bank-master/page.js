"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";

const BankMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBank, setNewBank] = useState({ bank_name: "" });

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

  // Fetch banks data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/banks/fetch");
      if (response.data && response.data.data && response.data.data.length > 0) {
        setData(response.data.data);
      } else {
        setData([]); // Set empty array if no records are found
        setError("No records found.");
      }
    } catch (err) {
      setData([]); // Set empty array if there's an error fetching data
      setError("Failed to fetch banks.");
    } finally {
      setLoading(false);
    }
  };

  // Add new bank
  const handleAdd = async () => {
    if (newBank.bank_name.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/banks/create",
          newBank
        );
        setData((prevData) => [...prevData, response.data]);
        setNewBank({ bank_name: "" });
        setShowAddForm(false);
        fetchData(); // Fetch data again after adding new bank
      } catch (err) {
        setError("Failed to add bank.");
      }
    } else {
      alert("Bank Name is required.");
    }
  };

  // Edit bank
  const handleEdit = async (id) => {
    const bank = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new bank name:", bank?.bank_name || "");

    if (updatedName) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/banks/update/${id}`,
          { bank_name: updatedName }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, bank_name: updatedName } : row
          )
        );
      } catch (err) {
        setError("Failed to update bank.");
      }
    }
  };

  // Delete bank
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/banks/delete/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete bank.");
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
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`mb-4 ${styles.search}`}
        >
          Add Bank
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Bank Name</FormLabel>
                <FormControl
                  type="text"
                  value={newBank.bank_name}
                  onChange={(e) =>
                    setNewBank({ bank_name: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Bank
            </Button>
          </div>
        )}
        <h2>Bank Records</h2>
        {/* {loading && <p>Loading...</p>} */}
        {error && <p>{error}</p>}
        {!loading && !error && data.length === 0 && <p>No records found.</p>}
        {!loading && !error && data.length > 0 && (
          <Table columns={columns} data={data} />
        )}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(BankMaster), { ssr: false });
