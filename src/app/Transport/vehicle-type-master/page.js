"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable"; // Ensure this path is correct
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Modal } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from "react-icons/cg";

const VehicleRecords = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ type_name: "" });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Vehicle Type",
      selector: (row) =>
        editRowId === row._id ? (
          <FormControl
            type="text"
            value={editValues.type_name}
            onChange={(e) => handleInputChange(e, "type_name")}
          />
        ) : (
          row.type_name || "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row._id)}>
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/vehicleTypes");
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newVehicle.type_name.trim()) {
      if (data.some((vehicle) => vehicle.type_name.toLowerCase() === newVehicle.type_name.toLowerCase())) {
        setErrorMessage("This vehicle type already exists!");
        setShowErrorModal(true); // Show the error modal
        return;
      }
      try {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/vehicleType", newVehicle);
        setNewVehicle({ type_name: "" });
        setShowAddForm(false);
        fetchData();
      } catch (error) {
        console.error("Error adding vehicle:", error);
        setError("Failed to add vehicle. Please try again later.");
      }
    } else {
      setErrorMessage("Please enter a vehicle type.");
      setShowErrorModal(true); // Show the error modal
    }
  };

  const handleEdit = (id) => {
    setEditRowId(id);
    const item = data.find((row) => row._id === id);
    setEditValues({ ...item });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/vehicleType/${id}`, editValues);
      fetchData();
      setEditRowId(null);
    } catch (error) {
      setError("Failed to update vehicle. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/vehicleType/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        setError("Failed to delete vehicle. Please try again later.");
      }
    }
  };

  const handlePrint = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const tableHeaders = [["#", "Vehicle Type Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.type_name || "N/A",
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Open the print dialog instead of directly downloading
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleCopy = () => {
    const headers = ["#", "Vehicle Type Name"].join("\t");
    const rows = data.map((row, index) => `${index + 1}\t${row.type_name || "N/A"}`).join("\n");
    const fullData = `${headers}\n${rows}`;

    navigator.clipboard.writeText(fullData)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/Transport/all-module">Transport</Breadcrumb.Item>
        <Breadcrumb.Item active>Vehicle Master</Breadcrumb.Item>
      </Breadcrumb>
      
      <Button onClick={() => setShowAddForm(true)} className="btn btn-primary mb-4">
        <CgAddR /> Add Vehicle
      </Button>
      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add Vehicle Type</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col>
                <FormLabel className="labelForm">Vehicle Type</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Vehicle Type"
                  value={newVehicle.type_name}
                  onChange={(e) => setNewVehicle({ type_name: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className="btn btn-primary mt-4">Add Vehicle</Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
      
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Vehicle Records</h2>
            {loading ? <p>Loading...</p> : error ? <p style={{ color: "red" }}>{error}</p> : data.length > 0 ? <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint}  /> : <p>No data available.</p>}
          </div>
        </Col>
      </Row>

      {/* Error Modal */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "red" }}>{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(VehicleRecords), { ssr: false });
