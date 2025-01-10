"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable"; // Ensure this path is correct
import { CgAddR } from 'react-icons/cg'; 
const VehicleRecords = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newVehicle, setNewVehicle] = useState({
    vehicle_type: "",
  }); // New vehicle form

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/vehicles"
      );
      const fetchedData = response.data.data;
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new vehicle
  const handleAdd = async () => {
    if (newVehicle.vehicle_type.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/vehicles",
          newVehicle
        );
        setData((prevData) => [...prevData, response.data]);
        setNewVehicle({ vehicle_type: "" });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding vehicle:", error);
        setError("Failed to add vehicle. Please try again later.");
      }
    } else {
      alert("Please fill in the vehicle type.");
    }
  };

  // Edit existing vehicle
  const handleEdit = (id) => {
    const item = data.find((row) => row._id === id);
    const updatedVehicleType = prompt(
      "Enter new vehicle type:",
      item?.vehicle_type || ""
    );

    if (updatedVehicleType) {
      try {
        axios.put(
          `https://erp-backend-fy3n.onrender.com/api/vehicles/${id}`,
          { vehicle_type: updatedVehicleType }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, vehicle_type: updatedVehicleType } : row
          )
        );
      } catch (error) {
        console.error("Error updating vehicle:", error);
        setError("Failed to update vehicle. Please try again later.");
      }
    }
  };

  // Delete vehicle
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/vehicles/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        setError("Failed to delete vehicle. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Vehicle Type",
      selector: (row) => row.vehicle_type || "N/A",
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
      {/* Add Vehicle Form */}
      <Row>
        <Col>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="mb-4">
           <CgAddR /> New Vehicle Type
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading"><h2>Add Vehicle Type</h2></div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Vehicle Type</FormLabel>
                    <FormControl type="text" placeholder="Enter Vehicle Type" value={newVehicle.vehicle_type} onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        vehicle_type: e.target.value,
                      })
                    }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} class="btn btn-primary mt-4" >Add Vehicle Type</Button>
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
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
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
