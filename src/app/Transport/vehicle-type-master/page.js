"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable"; // Ensure this path is correct
import { CgAddR } from "react-icons/cg";

const VehicleRecords = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type_name: "",
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/vehicleTypes"
      );
      setData(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add New Vehicle
  const handleAdd = async () => {
    if (!newVehicle.type_name.trim()) {
      alert("Please enter a valid vehicle type.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/vehicleType",
        newVehicle
      );
      setData([...data, response.data]);
      setNewVehicle({ type_name: "" });
      setShowAddForm(false);
      setSuccessMessage("Vehicle type added successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to add vehicle type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update Vehicle
  const handleEdit = async (id) => {
    const vehicle = data.find((item) => item._id === id);
    const updatedType = prompt(
      "Enter new vehicle type:",
      vehicle?.type_name || ""
    );
    if (!updatedType) return;

    setLoading(true);
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/vehicleType/${id}`,
        { type_name: updatedType }
      );
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, type_name: updatedType } : item
        )
      );
      setSuccessMessage("Vehicle type updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update vehicle type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Vehicle
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    setLoading(true);
    try {
      await axios.delete(
        `https://erp-backend-fy3n.onrender.com/api/vehicleType/${id}`
      );
      setData((prevData) => prevData.filter((item) => item._id !== id));
      setSuccessMessage("Vehicle type deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete vehicle type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Vehicle Type",
      selector: (row) => row.type_name || "N/A",
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

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/Transport/all-module">
              Transport
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Vehicle Type Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Add Vehicle Form */}
      <Row>
        <Col>
          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="mb-4"
          >
            <CgAddR /> New Vehicle Type
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <h2>Add Vehicle Type</h2>
              <Form>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Vehicle Type</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Vehicle Type"
                      value={newVehicle.type_name}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          type_name: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Vehicle Type
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Col>
      </Row>

      {/* Vehicle List Section */}
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Vehicle Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : data.length > 0 ? (
              <Table columns={columns} data={data} />
            ) : (
              <p>No vehicles available.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(VehicleRecords), { ssr: false });
