"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
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
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RouteMaster = () => {
  const [data, setData] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedRoute, setUpdatedRoute] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  const [newRoute, setNewRoute] = useState({
    Vehicle_No: "",
    Route_name: "",
    PickupPoint: "",
    Amount: ""
  });

  const API_BASE_URL = "https://erp-backend-fy3n.onrender.com/api";

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Vehicle No",
      selector: (row) =>
        row._id === editRowId ? (
          <Form.Select
            value={updatedRoute.Vehicle_No}
            onChange={(e) => handleChange(e, "Vehicle_No")}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle.Vehicle_No}>
                {vehicle.Vehicle_No} - {vehicle.Driver_Name}
              </option>
            ))}
          </Form.Select>
        ) : (
          row.Vehicle_No
        ),
    },
    {
      name: "Route Name",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={updatedRoute.Route_name}
            onChange={(e) => handleChange(e, "Route_name")}
          />
        ) : (
          row.Route_name
        ),
    },
    {
      name: "Pickup Point",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="text"
            value={updatedRoute.PickupPoint}
            onChange={(e) => handleChange(e, "PickupPoint")}
          />
        ) : (
          row.PickupPoint
        ),
    },
    {
      name: "Amount",
      selector: (row) =>
        row._id === editRowId ? (
          <FormControl
            type="number"
            value={updatedRoute.Amount}
            onChange={(e) => handleChange(e, "Amount")}
            min="0"
          />
        ) : (
          row.Amount
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editRowId === row._id ? (
            <button
              className="editButton btn-success"
              onClick={() => handleUpdate(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEditClick(row._id, row)}
            >
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

  const handleChange = (e, field) => {
    setUpdatedRoute({ ...updatedRoute, [field]: e.target.value });
  };

  const handleNewRouteChange = (e, field) => {
    setNewRoute({ ...newRoute, [field]: e.target.value });
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/vehicles/dropdown`);
      setVehicles(response.data.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/all-routes`);
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err.response?.data?.message || "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const requiredFields = ["Vehicle_No", "Route_name", "PickupPoint", "Amount"];
    const missingFields = requiredFields.filter(
      (field) => !newRoute[field] || newRoute[field] === ""
    );

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/create-routes`, newRoute);
      setData((prevData) => [...prevData, res.data.data]);
      setNewRoute({
        Vehicle_No: "",
        Route_name: "",
        PickupPoint: "",
        Amount: ""
      });
      setShowAddForm(false);
      fetchRoutes();
    } catch (err) {
      console.error("Error adding route:", err);
      setError(err.response?.data?.message || "Failed to add route");
    }
  };

  const handleEditClick = (id, row) => {
    setEditRowId(id);
    setUpdatedRoute({
      ...row,
      Vehicle_No: row.Vehicle_No
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/update-routes/${id}`, updatedRoute);
      fetchRoutes();
      setEditRowId(null);
    } catch (err) {
      console.error("Failed to update route", err);
      setError(err.response?.data?.message || "Failed to update route");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        await axios.delete(`${API_BASE_URL}/delete-routes/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        setError(err.response?.data?.message || "Failed to delete route");
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Route Master", link: "null" },
  ];

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Route
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Route</h2>
                <button
                  className="closeForm"
                  onClick={() => setShowAddForm(false)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Vehicle No*</FormLabel>
                    <Form.Select
                      value={newRoute.Vehicle_No}
                      onChange={(e) => handleNewRouteChange(e, "Vehicle_No")}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle.Vehicle_No}>
                          {vehicle.Vehicle_No} - {vehicle.Driver_Name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Route Name*</FormLabel>
                    <FormControl
                      type="text"
                      value={newRoute.Route_name}
                      placeholder="Enter Route Name"
                      onChange={(e) => handleNewRouteChange(e, "Route_name")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Pickup Point*</FormLabel>
                    <FormControl
                      type="text"
                      value={newRoute.PickupPoint}
                      placeholder="Enter Pickup Point"
                      onChange={(e) => handleNewRouteChange(e, "PickupPoint")}
                      required
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount*</FormLabel>
                    <FormControl
                      type="number"
                      value={newRoute.Amount}
                      placeholder="Enter Amount"
                      onChange={(e) => handleNewRouteChange(e, "Amount")}
                      min="0"
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Route
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {/* Expanded Edit Form */}
          {editRowId && (
            <div className="cover-sheet mt-3">
              <div className="studentHeading">
                <h2>Edit Route Details</h2>
                <button
                  className="closeForm"
                  onClick={() => setEditRowId(null)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Vehicle No*</FormLabel>
                    <Form.Select
                      value={updatedRoute.Vehicle_No}
                      onChange={(e) => handleChange(e, "Vehicle_No")}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle.Vehicle_No}>
                          {vehicle.Vehicle_No} - {vehicle.Driver_Name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Route Name*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedRoute.Route_name}
                      onChange={(e) => handleChange(e, "Route_name")}
                      required
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Pickup Point*</FormLabel>
                    <FormControl
                      type="text"
                      value={updatedRoute.PickupPoint}
                      onChange={(e) => handleChange(e, "PickupPoint")}
                      required
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount*</FormLabel>
                    <FormControl
                      type="number"
                      value={updatedRoute.Amount}
                      onChange={(e) => handleChange(e, "Amount")}
                      min="0"
                      required
                    />
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Button
                      onClick={() => handleUpdate(editRowId)}
                      className="btn btn-primary mt-4"
                    >
                      Update Route
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {/* Table Section */}
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Route Records</h2>
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
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(RouteMaster), { ssr: false });