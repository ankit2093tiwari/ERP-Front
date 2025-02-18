"use client";
import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statesRes, citiesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-states`),
          axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-cities`)
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

  const handleAddState = async () => {
    if (!newStateName.trim()) {
      setFormErrors({ state_name: "State name is required" });
      return;
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SITE_URL}/api/add-states`, {
        state_name: newStateName,
      });
      if (response.data.success) {
        setNewStateName("");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-states`);
        setStates(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to add state.");
    }
  };

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SITE_URL}/api/add-cities`, {
        state_id: selectedState,
        city_name: newCityName,
      });
      if (response.data.success) {
        setNewCityName("");
        setSelectedState("");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-cities`);
        setCities(res.data.data || []);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to add city.");
    }
  };

  const handleDeleteCity = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SITE_URL}/api/delete-cities/${id}`);
      setCities(cities.filter((city) => city._id !== id));
    } catch (err) {
      setError("Failed to delete city.");
    }
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
        <Tab eventKey="state" title={<span><CgAddR /> New State</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New State</h2>
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
                <Button onClick={handleAddState} className="btn btn-primary mt-4">
                  Add State
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
                <Button onClick={handleAddCity} className="btn btn-primary mt-4">
                  Add City
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
                  { name: "City Name", selector: (row) => row.city_name },
                  { name: "State Name", selector: (row) => row.state?.state_name || "N/A" },
                  {
                    name: "Actions",
                    cell: (row) => (
                      <div className="d-flex gap-2">
                        <button className="editButton" onClick={() => handleDeleteCity(row._id)}>
                          <FaTrashAlt />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={cities}
              />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StateCityMasterPage;


