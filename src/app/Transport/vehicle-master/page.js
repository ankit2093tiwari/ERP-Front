"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable"; // Ensure this path is correct
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
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
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const VehicleRecords = () => {
  const [data, setData] = useState([]); // Table data
  const [editRowId, setEditRowId] = useState(null);
  const [updatedVehicle, setUpdatedVehicle] = useState({});
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [newVehicle, setNewVehicle] = useState({
    vehicle_type: "",
    vehicle_no: "",
    driver: {
      driver_name: "",
    },
  }); // New vehicle form

  const handleChange = (e, field) => {
    setUpdatedVehicle({ ...updatedVehicle, [field]: e.target.value });
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Vehicle Type", selector: (row) => (row._id === editRowId ? <FormControl type="text" value={updatedVehicle.vehicle_type} onChange={(e) => handleChange(e, "vehicle_type")} /> : row.vehicle_type) },
    { name: "Vehicle No", selector: (row) => (row._id === editRowId ? <FormControl type="text" value={updatedVehicle.vehicle_no} onChange={(e) => handleChange(e, "vehicle_no")} /> : row.vehicle_no) },
    { name: "Driver Name", selector: (row) => (row._id === editRowId ? <FormControl type="text" value={updatedVehicle.driver.driver_name} onChange={(e) => setUpdatedVehicle({ ...updatedVehicle, driver: { driver_name: e.target.value } })} /> : row.driver?.driver_name) },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button className="editButton btn-success" onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEditClick(row._id, row)}>
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/vehicles"
      );
      const fetchedData = response.data.data.map((item) => ({
        ...item,
        driver_name: item.driver?.driver_name || "N/A", // Flatten for table display
      }));
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
    if (
      newVehicle.vehicle_type.trim() &&
      newVehicle.vehicle_no.trim() &&
      newVehicle.driver.driver_name.trim()
    ) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/vehicles",
          newVehicle
        );
        setData((prevData) => [...prevData, response.data]);
        setNewVehicle({
          vehicle_type: "",
          vehicle_no: "",
          driver: { driver_name: "" },
        });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding vehicle:", error);
        setError("Failed to add vehicle. Please try again later.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  };
  // Edit existing vehicle
  const handleEditClick = (id, row) => {
    setEditRowId(id);
    setUpdatedVehicle(row);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/vehicles/${id}`, updatedVehicle);
      setData((prevData) => prevData.map((row) => (row._id === id ? updatedVehicle : row)));
      setEditRowId(null);
    } catch (error) {
      setError("Failed to update vehicle.");
    }
  };

  // Delete a vehicle
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

  const breadcrumbItems = [{ label: "Transport", link: "/Transport/all-module" }, { label: "Vehicle Master", link: "null" }]

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
          {/* Add Vehicle Form */}
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Vehicle
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading"><h2>Add Vehicle Type</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle Type</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Vehicle Type"
                      value={newVehicle.vehicle_type}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          vehicle_type: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Vehicle No</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Vehicle No"
                      value={newVehicle.vehicle_no}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          vehicle_no: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Driver Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Driver Name"
                      value={newVehicle.driver.driver_name}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          driver: {
                            ...newVehicle.driver,
                            driver_name: e.target.value,
                          },
                        })
                      }
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


          {/* Table Section */}
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
                  <p>No data available.</p>
                )}
              </div>
            </Col>
          </Row>
        </Container >
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(VehicleRecords), { ssr: false });
