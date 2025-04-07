"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const FeeSetting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFeeSetting, setNewFeeSetting] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track which row is being edited
  const [editedData, setEditedData] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
  });

  const handlePrint = async () => {
    const tableHeaders = [["#", "Credit Card Charge", "Debit Card Charge", "AMEX Charge"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.credit_card_charge || "N/A",
      row.debit_card_charge || "N/A",
      row.amex_charge || "N/A",
    ]);

    printContent(tableHeaders, tableRows);

  };



  const handleCopy = () => {
    const headers = ["#", "Credit Card Charge", "Debit Card Charge", "AMEX Charge"];
    const rows = data.map((row, index) => `${index + 1}\t${row.credit_card_charge || "N/A"}\t${row.debit_card_charge || "N/A"}\t${row.amex_charge || "N/A"}`);

    copyContent(headers, rows);
  };


  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-settings");
      console.log("API Response:", response.data);

      if (response.data && response.data.success && Array.isArray(response.data.feeSettings)) {
        setData(response.data.feeSettings);
      } else {
        setData([]); // Set empty array instead of null
        setError("No records found.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
      setError("Failed to fetch fee settings.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new fee setting
  const handleAdd = async () => {
    if (
      newFeeSetting.credit_card_charge.trim() &&
      newFeeSetting.debit_card_charge.trim() &&
      newFeeSetting.amex_charge.trim()
    ) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-fee-settings", newFeeSetting);
        console.log("Added Fee Setting:", response.data);
        fetchData(); // Refresh data
        setNewFeeSetting({
          credit_card_charge: "",
          debit_card_charge: "",
          amex_charge: "",
        });
        setIsPopoverOpen(false); // Close the popover
      } catch (err) {
        console.error("Add error:", err);
        setError("Failed to add fee setting.");
      }
    } else {
      alert("All fields are required.");
    }
  };

  // Enter edit mode for a row
  const handleEdit = (row) => {
    setEditingId(row._id); // Set the ID of the row being edited
    setEditedData({
      credit_card_charge: row.credit_card_charge,
      debit_card_charge: row.debit_card_charge,
      amex_charge: row.amex_charge,
    });
  };

  // Save changes for the edited row
  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-fee-settings/${id}`,
        editedData
      );

      // Update the local state
      setData((prevData) =>
        prevData.map((row) =>
          row._id === id
            ? { ...row, ...editedData }
            : row
        )
      );
      fetchData();
      setEditingId(null); // Exit edit mode
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update fee setting.");
    }
  };

  // Delete a fee setting
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee setting?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-settings/${id}`);
        console.log("Deleted Fee Setting:", id);
        fetchData(); // Refresh data
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete fee setting.");
      }
    }
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
      name: "Credit Card Charge",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedData.credit_card_charge}
            onChange={(e) =>
              setEditedData({ ...editedData, credit_card_charge: e.target.value })
            }
          />
        ) : (
          row.credit_card_charge || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Debit Card Charge",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedData.debit_card_charge}
            onChange={(e) =>
              setEditedData({ ...editedData, debit_card_charge: e.target.value })
            }
          />
        ) : (
          row.debit_card_charge || "N/A"
        ),
      sortable: true,
    },
    {
      name: "AMEX Charge",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedData.amex_charge}
            onChange={(e) =>
              setEditedData({ ...editedData, amex_charge: e.target.value })
            }
          />
        ) : (
          row.amex_charge || "N/A"
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

  const breadcrumbItems = [{ label: "Fee", link: "/fees/all-module" }, { label: "fee-Setting", link: "null" }]

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

          {/* Add Fee Setting Button */}
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Fee Setting
          </Button>

          {/* Add Fee Setting Popover */}
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Fee Setting</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Credit Card Charge</FormLabel>
                    <FormControl
                      type="text"
                      value={newFeeSetting.credit_card_charge}
                      onChange={(e) =>
                        setNewFeeSetting({ ...newFeeSetting, credit_card_charge: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Debit Card Charge</FormLabel>
                    <FormControl
                      type="text"
                      value={newFeeSetting.debit_card_charge}
                      onChange={(e) =>
                        setNewFeeSetting({ ...newFeeSetting, debit_card_charge: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">AMEX Charge</FormLabel>
                    <FormControl
                      type="text"
                      value={newFeeSetting.amex_charge}
                      onChange={(e) =>
                        setNewFeeSetting({ ...newFeeSetting, amex_charge: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Fee Setting
                </Button>
              </Form>
            </div>
          )}

          {/* Fee Setting Records Table */}
          <div className="tableSheet">
            <h2>Fee Setting Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FeeSetting), { ssr: false });