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
import jsPDF from "jspdf";
import "jspdf-autotable";

const HeadMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newHeadMaster, setNewHeadMaster] = useState({
    head_name: "",
    head_type: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [editingHeadMaster, setEditingHeadMaster] = useState({
    _id: "",
    head_name: "",
    head_type: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Head Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editingHeadMaster.head_name}
            onChange={(e) =>
              setEditingHeadMaster({
                ...editingHeadMaster,
                head_name: e.target.value,
              })
            }
          />
        ) : (
          row.head_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Head Type",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            as="select"
            value={editingHeadMaster.head_type}
            onChange={(e) =>
              setEditingHeadMaster({
                ...editingHeadMaster,
                head_type: e.target.value,
              })
            }
          >
            <option value="">Select Head Type</option>
            <option value="Installment Type">Installment Type</option>
            <option value="Lifetime">Lifetime</option>
          </FormControl>
        ) : (
          row.head_type || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button
              className="editButton btn-success"
              onClick={() => handleSave(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
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

  const handlePrint = () => {
    const doc = new jsPDF();
    const tableHeaders = [["#", "Head Name", "Head Type"]]; // Updated headers
    const tableRows = data.map((row, index) => [
      index + 1,
      row.head_name || "N/A",
      row.head_type || "N/A",
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      theme: "grid", // Add grid styling
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }, // Header background color
    });

    // Open the print dialog instead of directly downloading
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => {
      printWindow.print(); // Trigger the print dialog
    };
  };

  const handleCopy = () => {
    const headers = ["#", "Head Name", "Head Type"].join("\t"); // Tab-separated headers
    const rows = data.map((row, index) => `${index + 1}\t${row.head_name || "N/A"}\t${row.head_type || "N/A"}`).join("\n");
    const fullData = `${headers}\n${rows}`;

    navigator.clipboard.writeText(fullData)
      .then(() => alert("Table data copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-fee-type");
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch HeadMasters.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newHeadMaster.head_name.trim() && newHeadMaster.head_type.trim()) {
      try {
        // Check if the HeadMaster already exists
        const existingHeadMaster = data.find(
          (row) => row.head_name === newHeadMaster.head_name
        );
        if (existingHeadMaster) {
          alert("HeadMaster name already exists.");
          return;
        }

        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-fee-type", newHeadMaster);
        if (response.data && response.data.success) {
          setData((prevData) => [...prevData, response.data.data]);
          setNewHeadMaster({ head_name: "", head_type: "" });
          setShowAddForm(false);
          fetchData(); // Refresh data after adding
        } else {
          setError("Failed to add HeadMaster.");
        }
      } catch (err) {
        setError("Failed to add HeadMaster.");
      }
    } else {
      alert("Both Head Name and Head Type are required.");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id); // Set the row ID being edited
    setEditingHeadMaster(row); // Populate the editable fields
  };

  const handleSave = async (id) => {
    const { head_name, head_type } = editingHeadMaster;
    if (head_name.trim() && head_type.trim()) {
      try {
        const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-fee-type/${id}`, {
          head_name,
          head_type,
        });
        if (response.data && response.data.success) {
          setData((prevData) =>
            prevData.map((row) =>
              row._id === id
                ? { ...row, head_name, head_type }
                : row
            )
          );
          fetchData();
          setEditingId(null); // Exit edit mode
        } else {
          setError("Failed to update HeadMaster.");
        }
      } catch (err) {
        setError("Failed to update HeadMaster.");
      }
    } else {
      alert("Both Head Name and Head Type are required.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this HeadMaster?")) {
      try {
        const response = await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-fee-type/${id}`);
        if (response.data && response.data.success) {
          setData((prevData) => prevData.filter((row) => row._id !== id));
          fetchData();
        } else {
          setError("Failed to delete HeadMaster.");
        }
      } catch (err) {
        setError("Failed to delete HeadMaster.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="">
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/head-masters">HeadMasters</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage HeadMasters</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        className="btn btn-primary mb-4"
      >
        <CgAddR /> Add HeadMaster
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New HeadMaster</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>
              X
            </button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Head Name</FormLabel>
                <FormControl
                  type="text"
                  value={newHeadMaster.head_name}
                  onChange={(e) =>
                    setNewHeadMaster({ ...newHeadMaster, head_name: e.target.value })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Head Type</FormLabel>
                <FormControl
                  as="select"
                  value={newHeadMaster.head_type}
                  onChange={(e) =>
                    setNewHeadMaster({ ...newHeadMaster, head_type: e.target.value })
                  }
                >
                  <option value="">Select Head Type</option>
                  <option value="Installment Type">Installment Type</option>
                  <option value="Lifetime">Lifetime</option>
                </FormControl>
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add HeadMaster
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>HeadMaster Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} handlePrint={handlePrint}
          handleCopy={handleCopy} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(HeadMasterPage), { ssr: false });