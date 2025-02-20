"use client";
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";

const StateCityMasterPage = () => {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [newStateName, setNewStateName] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editingState, setEditingState] = useState(null); // State to track the state being edited
  const [editingCity, setEditingCity] = useState(null); // State to track the city being edited

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statesRes, citiesRes] = await Promise.all([
          axios.get(`https://erp-backend-fy3n.onrender.com/api/all-states`),
          axios.get(`https://erp-backend-fy3n.onrender.com/api/all-cities`),
        ]);
        setStates(statesRes.data.data || []);
        setCities(citiesRes.data.data || []);
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine state and city data for the table
  const combinedData = cities.map((city) => ({
    ...city,
    state_name: states.find((state) => state._id === city.state_id)?.state_name || "N/A",
  }));

  // Handle adding a new state
  const handleAddState = async () => {
    if (!newStateName.trim()) {
      setFormErrors({ state_name: "State name is required" });
      return;
    }
    try {
      const response = await axios.post(`https://erp-backend-fy3n.onrender.com/api/add-states`, {
        state_name: newStateName,
      });
      if (response.data.success) {
        setNewStateName("");
        const res = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-states`);
        setStates(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to add state.");
    }
  };

  // Handle updating an existing state
  const handleUpdateState = async () => {
    if (!editingState) return;

    if (!newStateName.trim()) {
      setFormErrors({ state_name: "State name is required" });
      return;
    }
    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-states/${editingState._id}`, {
        state_name: newStateName,
      });
      if (response.data.success) {
        setNewStateName("");
        setEditingState(null);
        const res = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-states`);
        setStates(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to update state.");
    }
  };

  // Handle deleting a state
  const handleDeleteState = async (id) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-states/${id}`);
      setStates(states.filter((state) => state._id !== id));
    } catch (err) {
      setError("Failed to delete state.");
    }
  };

  // Handle adding a new city
  const handleAddCity = async () => {
    if (!selectedState) {
      setFormErrors({ state_id: "Please select a state." });
      return;
    }
    if (!newCityName.trim()) {
      setFormErrors({ city_name: "City name is required." });
      return;
    }
    try {
      const response = await axios.post(`https://erp-backend-fy3n.onrender.com/api/add-cities`, {
        state_id: selectedState,
        city_name: newCityName,
      });
      if (response.data.success) {
        setNewCityName("");
        setSelectedState("");
        const res = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-cities`);
        setCities(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to add city.");
    }
  };

  // Handle updating an existing city
  const handleUpdateCity = async () => {
    if (!editingCity) return;

    if (!selectedState) {
      setFormErrors({ state_id: "Please select a state." });
      return;
    }
    if (!newCityName.trim()) {
      setFormErrors({ city_name: "City name is required." });
      return;
    }
    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-cities/${editingCity._id}`, {
        state_id: selectedState,
        city_name: newCityName,
      });
      if (response.data.success) {
        setNewCityName("");
        setSelectedState("");
        setEditingCity(null);
        const res = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-cities`);
        setCities(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to update city.");
    }
  };

  // Handle deleting a city
  const handleDeleteCity = async (id) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-cities/${id}`);
      setCities(cities.filter((city) => city._id !== id));
    } catch (err) {
      setError("Failed to delete city.");
    }
  };

  // Handle editing a state
  const handleEditState = (state) => {
    setEditingState(state);
    setNewStateName(state.state_name);
  };

  // Handle editing a city
  const handleEditCity = (city) => {
    setEditingCity(city);
    setSelectedState(city.state_id);
    setNewCityName(city.city_name);
  };

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
            <Breadcrumb.Item active>State & City Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Tabs id="uncontrolled-tab-example" className="mb-3 TabButton" defaultActiveKey="state">
        <Tab eventKey="state" title={<span><CgAddR /> {editingState ? "Update State" : "New State"}</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2>{editingState ? "Update State" : "Add New State"}</h2>
          </div>
          <div className="formSheet">
            <Row className="mb-3">
              <Col lg={12}>
                <FormLabel className="labelForm">State Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter State Name"
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                />
                {formErrors.state_name && <div className="text-danger">{formErrors.state_name}</div>}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Button onClick={editingState ? handleUpdateState : handleAddState} className="btn btn-primary mt-4">
                  {editingState ? "Update State" : "Add State"}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>

        <Tab eventKey="city" title={<span><CgAddR /> {editingCity ? "Update City" : "New City"}</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2>{editingCity ? "Update City" : "Add New City"}</h2>
          </div>
          <div className="formSheet">
            <Row className="mb-3">
              <Col lg={12}>
                <FormLabel className="labelForm">Select State</FormLabel>
                <FormControl
                  as="select"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.state_name}
                    </option>
                  ))}
                </FormControl>
                {formErrors.state_id && <div className="text-danger">{formErrors.state_id}</div>}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col lg={12}>
                <FormLabel className="labelForm">City Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter City Name"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                />
                {formErrors.city_name && <div className="text-danger">{formErrors.city_name}</div>}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Button onClick={editingCity ? handleUpdateCity : handleAddCity} className="btn btn-primary mt-4">
                  {editingCity ? "Update City" : "Add City"}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>
      </Tabs>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>State & City Records</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
              <Table
                columns={[
                  { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
                  { name: "State Name", selector: (row) => row.state_name, sortable: true },
                  { name: "City Name", selector: (row) => row.city_name, sortable: true },
                  {
                    name: "Actions",
                    cell: (row) => (
                      <div className="d-flex gap-2">
                        <button className="editButton" onClick={() => handleEditCity(row)}>
                          <FaEdit />
                        </button>
                        <button className="editButton btn-danger" onClick={() => handleDeleteCity(row._id)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={combinedData}
              />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StateCityMasterPage;