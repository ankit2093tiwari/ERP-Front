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

const InstallmentMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstallment, setNewInstallment] = useState({ installment_name: "" });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Installment Name",
      selector: (row) => row.installment_name || "N/A",
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

  // Fetch installments
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments");
      if (response.data && response.data.data && response.data.data.length > 0) {
        setData(response.data.data);
      } else {
        setData([]); // Set empty array if no records are found
        setError("No records found.");
      }
    } catch (err) {
      setData([]); // Set empty array if there's an error fetching data
      setError("Failed to fetch installments.");
    } finally {
      setLoading(false);
    }
  };

  // Add new installment
  const handleAdd = async () => {
    if (newInstallment.installment_name.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/add-installments",
          newInstallment
        );
        setData((prevData) => [...prevData, response.data]);
        setNewInstallment({ installment_name: "" });
        setShowAddForm(false);
        fetchData(); // Fetch data again after adding new installment
      } catch (err) {
        setError("Failed to add installment.");
      }
    } else {
      alert("Installment Name is required.");
    }
  };

  // Edit installment
  const handleEdit = async (id) => {
    const installment = data.find((row) => row._id === id);
    const updatedName = prompt(
      "Enter new installment name:",
      installment?.installment_name || ""
    );

    if (updatedName) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/update-installments/${id}`,
          { installment_name: updatedName }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, installment_name: updatedName } : row
          )
        );
      } catch (err) {
        setError("Failed to update installment.");
      }
    }
  };

  // Delete installment
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this installment?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-installments/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete installment.");
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
          Add Installment
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Installment Name</FormLabel>
                <FormControl
                  type="text"
                  value={newInstallment.installment_name}
                  onChange={(e) =>
                    setNewInstallment({ installment_name: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Installment
            </Button>
          </div>
        )}
        <h2>Installment Records</h2>
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

export default dynamic(() => Promise.resolve(InstallmentMaster), { ssr: false });
