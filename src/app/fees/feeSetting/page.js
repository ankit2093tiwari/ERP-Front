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

const FeeSetting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeeSetting, setNewFeeSetting] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Credit Card Charge",
      selector: (row) => row.credit_card_charge || "N/A",
      sortable: true,
    },
    {
      name: "Debit Card Charge",
      selector: (row) => row.debit_card_charge || "N/A",
      sortable: true,
    },
    {
      name: "AMEX Charge",
      selector: (row) => row.amex_charge || "N/A",
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

  // Fetch fee settings
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/fee-settings");
      if (response.data && response.data.length > 0) {
        setData(response.data);
      } else {
        setData([]); // Set empty array if no records are found
        setError("No records found.");
      }
    } catch (err) {
      setData([]); // Set empty array if there's an error fetching data
      setError("Failed to fetch fee settings.");
    } finally {
      setLoading(false);
    }
  };

  // Add new fee setting
  const handleAdd = async () => {
    if (
      newFeeSetting.credit_card_charge.trim() &&
      newFeeSetting.debit_card_charge.trim() &&
      newFeeSetting.amex_charge.trim()
    ) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/fee-settings/create",
          newFeeSetting
        );
        setData((prevData) => [...prevData, response.data]);
        setNewFeeSetting({ credit_card_charge: "", debit_card_charge: "", amex_charge: "" });
        setShowAddForm(false);
        fetchData(); // Fetch data again after adding new fee setting
      } catch (err) {
        setError("Failed to add fee setting.");
      }
    } else {
      alert("All fields are required.");
    }
  };

  // Edit fee setting
  const handleEdit = async (id) => {
    const feeSetting = data.find((row) => row._id === id);
    const updatedCreditCardCharge = prompt("Enter new Credit Card Charge:", feeSetting?.credit_card_charge || "");
    const updatedDebitCardCharge = prompt("Enter new Debit Card Charge:", feeSetting?.debit_card_charge || "");
    const updatedAmexCharge = prompt("Enter new AMEX Charge:", feeSetting?.amex_charge || "");

    if (updatedCreditCardCharge && updatedDebitCardCharge && updatedAmexCharge) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/fee-settings/${id}`,
          { credit_card_charge: updatedCreditCardCharge, debit_card_charge: updatedDebitCardCharge, amex_charge: updatedAmexCharge }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, credit_card_charge: updatedCreditCardCharge, debit_card_charge: updatedDebitCardCharge, amex_charge: updatedAmexCharge } : row
          )
        );
      } catch (err) {
        setError("Failed to update fee setting.");
      }
    }
  };

  // Delete fee setting
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee setting?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/fee-settings/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete fee setting.");
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
          Add Fee Setting
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Credit Card Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.credit_card_charge}
                  onChange={(e) =>
                    setNewFeeSetting({ ...newFeeSetting, credit_card_charge: e.target.value })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Debit Card Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.debit_card_charge}
                  onChange={(e) =>
                    setNewFeeSetting({ ...newFeeSetting, debit_card_charge: e.target.value })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>AMEX Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.amex_charge}
                  onChange={(e) =>
                    setNewFeeSetting({ ...newFeeSetting, amex_charge: e.target.value })
                  }
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Fee Setting
            </Button>
          </div>
        )}
        <h2>Fee Setting Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && data.length === 0 && <p>No records found.</p>}
        {!loading && !error && data.length > 0 && (
          <Table columns={columns} data={data} />
        )}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(FeeSetting), { ssr: false });
