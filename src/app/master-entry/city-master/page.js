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
      console.log('States fetched', response.data);
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
  const mergedData = cities.map((city) => {
    const state = states.find((stateData) => stateData._id === city.state_id);
    return state ? { ...city, state_name: state.state_name } : city;
  });

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
        <Breadcrumb.Item active>State & City Master</Breadcrumb.Item>
      </Breadcrumb>

      <Tabs className="mb-3" defaultActiveKey="state">
        <Tab eventKey="state" title={<span><CgAddR /> New State</span>}>
          <Row>
            <Col>
              <FormLabel>State Name</FormLabel>
              <FormControl value={newStateName} onChange={(e) => setNewStateName(e.target.value)} />
              {formErrors.state_name && <div className="text-danger">{formErrors.state_name}</div>}
            </Col>
          </Row>
          {editState ? (
            <Button onClick={handleUpdateState} className="mt-3">Update State</Button>
          ) : (
            <Button onClick={handleAddState} className="mt-3">Add State</Button>
          )}
        </Tab>
        <Tab eventKey="city" title={<span><CgAddR /> New City</span>}>
          <Row>
            <Col>
              <FormLabel>Select State</FormLabel>
              <FormControl as="select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>{state.state_name}</option>
                ))}
              </FormControl>
            </Col>
            <Col>
              <FormLabel>City Name</FormLabel>
              <FormControl value={newCityName} onChange={(e) => setNewCityName(e.target.value)} />
              {formErrors.city_name && <div className="text-danger">{formErrors.city_name}</div>}
            </Col>
          </Row>
          {editCity ? (
            <Button onClick={handleUpdateCity} className="mt-3">Update City</Button>
          ) : (
            <Button onClick={handleAddCity} className="mt-3">Add City</Button>
          )}
        </Tab>
      </Tabs>

      <h2>State & City Records</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {mergedData.length === 0 && !loading && <p>No state & city records available.</p>}
      <Table
        columns={[
          { name: "State Name", selector: (row) => row.state_name },
          { name: "City Name", selector: (row) => row.city_name },
          {
            name: "Actions", cell: (row) => (
              <>
                <FaEdit onClick={() => handleEditCity(row)} className="mr-2" />
                <FaTrashAlt onClick={() => handleDeleteCity(row._id)} />
              </>
            )
          }
        ]}
        data={mergedData}
      />
    </Container>
  );
};

export default dynamic(() => Promise.resolve(StateCityMasterPage), { ssr: false });
