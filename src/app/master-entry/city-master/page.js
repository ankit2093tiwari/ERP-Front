"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";

const StateCityMasterPage = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [newStateName, setNewStateName] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editState, setEditState] = useState(null);
  const [editCity, setEditCity] = useState(null);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-states");
      setStates(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch state data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-cities");
      setCities(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch city data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  const handleAddState = async () => {
    if (!newStateName.trim()) {
      setFormErrors({ state_name: "State name is required" });
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-states", {
        state_name: newStateName,
      });
      fetchStates();
      setNewStateName("");
    } catch (err) {
      setError("Failed to add state.");
    }
  };

  const handleAddCity = async () => {
    if (!selectedState || !newCityName.trim()) {
      setFormErrors({ city_name: "City name is required" });
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-cities", {
        state_id: selectedState,
        city_name: newCityName,
      });
      fetchCities();
      setNewCityName("");
      setSelectedState("");
    } catch (err) {
      setError("Failed to add city.");
    }
  };

  const handleEditState = (state) => {
    setEditState(state);
    setNewStateName(state.state_name);
  };

  const handleEditCity = (city) => {
    setEditCity(city);
    setNewCityName(city.city_name);
    setSelectedState(city.state_id);
  };

  const handleUpdateState = async () => {
    if (!newStateName.trim()) {
      setFormErrors({ state_name: "State name is required" });
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-states/${id}`, {
        state_name: newStateName,
      });
      fetchStates();
      setEditState(null);
      setNewStateName("");
    } catch (err) {
      setError("Failed to update state.");
    }
  };

  const handleUpdateCity = async () => {
    if (!selectedState || !newCityName.trim()) {
      setFormErrors({ city_name: "City name is required" });
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-cities/${id}`, {
        state_id: selectedState,
        city_name: newCityName,
      });
      fetchCities();
      setEditCity(null);
      setNewCityName("");
      setSelectedState("");
    } catch (err) {
      setError("Failed to update city.");
    }
  };

  const handleDeleteState = async (stateId) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-states/${id}`);
      fetchStates();
    } catch (err) {
      setError("Failed to delete state.");
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-cities/${id}`);
      fetchCities();
    } catch (err) {
      setError("Failed to delete city.");
    }
  };

  // Merging state and city data
  const mergedData = states.map((state) => {
    const stateCities = cities.filter((city) => city.state_id === state._id);
    return {
      state_name: state.state_name,
      cities: stateCities,
    };
  });

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

      <Tabs id="uncontrolled-tab-example" className="mb-3 TabButton" defaultActiveKey={null}>
        <Tab eventKey="state" title={<span><CgAddR /> {editState ? "Update State" : "New State"}</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2>{editState ? "Update State" : "Add New State"}</h2>
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
                <Button onClick={editState ? handleUpdateState : handleAddState} className="btn btn-primary mt-4">
                  {editState ? "Update State" : "Add State"}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>

        <Tab eventKey="city" title={<span><CgAddR /> New City</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New City</h2>
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
                <Button onClick={editCity ? handleUpdateCity : handleAddCity} className="btn btn-primary mt-4">
                  {editCity ? "Update City" : "Add City"}
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
                  { name: "State Name", selector: (row) => row.state_name },
                  {
                    name: "City Name",
                    cell: (row) => (
                      <ul>
                        {row.cities.map((city) => (
                          <li key={city._id}>{city.city_name}</li>
                        ))}
                      </ul>
                    ),
                  },
                  {
                    name: "Actions",
                    cell: (row) => (
                      <div className="d-flex gap-2">
                        <button className="editButton" onClick={() => handleEditState(row)}>
                          <FaEdit />
                        </button>
                        <button className="editButton btn-danger" onClick={() => handleDeleteState(row._id)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={mergedData}
              />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(StateCityMasterPage), { ssr: false });