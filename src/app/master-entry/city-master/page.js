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
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const StateCityMasterPage = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStateFormOpen, setIsStateFormOpen] = useState(false);
  const [isCityFormOpen, setIsCityFormOpen] = useState(false);
  const [editingStateId, setEditingStateId] = useState(null);
  const [editingCityId, setEditingCityId] = useState(null);
  const [formData, setFormData] = useState({
    state_name: "",
    city_name: "",
    state_id: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "State Name",
      cell: (row) =>
        editingStateId === row._id ? (
          <FormControl
            type="text"
            value={formData.state_name}
            onChange={(e) => setFormData({...formData, state_name: e.target.value})}
          />
        ) : (
          row.state_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Cities",
      cell: (row) => (
        <ul>
          {cities
            .filter(city => city.state_id === row._id)
            .map(city => (
              <li key={city._id}>
                {editingCityId === city._id ? (
                  <>
                    <FormControl
                      as="select"
                      value={formData.state_id}
                      onChange={(e) => setFormData({...formData, state_id: e.target.value})}
                      className="d-inline-block me-2"
                      style={{width: '150px'}}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.state_name}
                        </option>
                      ))}
                    </FormControl>
                    <FormControl
                      type="text"
                      value={formData.city_name}
                      onChange={(e) => setFormData({...formData, city_name: e.target.value})}
                      className="d-inline-block me-2"
                      style={{width: '150px'}}
                    />
                    <button
                      className="editButton"
                      onClick={() => handleUpdateCity(city._id)}
                    >
                      <FaSave />
                    </button>
                    <button
                      className="editButton btn-danger"
                      onClick={() => handleDeleteCity(city._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </>
                ) : (
                  <>
                    {city.city_name || "N/A"}
                    <button
                      className="editButton"
                      onClick={() => handleEditCity(city)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="editButton btn-danger"
                      onClick={() => handleDeleteCity(city._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </>
                )}
              </li>
            ))}
        </ul>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingStateId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdateState(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDeleteState(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEditState(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDeleteState(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

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
    if (!formData.state_name.trim()) {
      setError("State name is required");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-states", {
        state_name: formData.state_name,
      });
      fetchStates();
      setFormData({...formData, state_name: ""});
      setIsStateFormOpen(false);
    } catch (err) {
      setError("Failed to add state.");
    }
  };

  const handleAddCity = async () => {
    if (!formData.state_id || !formData.city_name.trim()) {
      setError("Both state and city name are required");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-cities", {
        state_id: formData.state_id,
        city_name: formData.city_name,
      });
      fetchCities();
      setFormData({...formData, city_name: "", state_id: ""});
      setIsCityFormOpen(false);
    } catch (err) {
      setError("Failed to add city.");
    }
  };

  const handleEditState = (state) => {
    setEditingStateId(state._id);
    setFormData({
      ...formData,
      state_name: state.state_name || ""
    });
  };

  const handleEditCity = (city) => {
    setEditingCityId(city._id);
    setFormData({
      ...formData,
      city_name: city.city_name || "",
      state_id: city.state_id || ""
    });
  };

  const handleUpdateState = async (id) => {
    if (!formData.state_name.trim()) {
      setError("State name is required");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-states/${id}`, {
        state_name: formData.state_name,
      });
      fetchStates();
      setEditingStateId(null);
      setFormData({...formData, state_name: ""});
    } catch (err) {
      setError("Failed to update state.");
    }
  };

  const handleUpdateCity = async (id) => {
    if (!formData.state_id || !formData.city_name.trim()) {
      setError("Both state and city name are required");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-cities/${id}`, {
        state_id: formData.state_id,
        city_name: formData.city_name,
      });
      fetchCities();
      setEditingCityId(null);
      setFormData({...formData, city_name: "", state_id: ""});
    } catch (err) {
      setError("Failed to update city.");
    }
  };

  const handleDeleteState = async (id) => {
    if (confirm("Are you sure you want to delete this state and all its cities?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-states/${id}`);
        fetchStates();
      } catch (err) {
        setError("Failed to delete state.");
      }
    }
  };

  const handleDeleteCity = async (id) => {
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-cities/${id}`);
        fetchCities();
      } catch (err) {
        setError("Failed to delete city.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "State Name", "Cities"]];
    const tableRows = states.map((state, index) => [
      index + 1,
      state.state_name || "N/A",
      cities.filter(city => city.state_id === state._id).map(c => c.city_name).join(", ") || "N/A"
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "State Name", "Cities"];
    const rows = states.map((state, index) => 
      `${index + 1}\t${state.state_name || "N/A"}\t${cities.filter(city => city.state_id === state._id).map(c => c.city_name).join(", ") || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "state-city-master", link: "null" },
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
          <div className="d-flex gap-2 mb-3">
            <Button
              onClick={() => setIsStateFormOpen(true)}
              className="btn-add"
            >
              <CgAddR /> Add State
            </Button>
            <Button
              onClick={() => setIsCityFormOpen(true)}
              className="btn-add"
            >
              <CgAddR /> Add City
            </Button>
          </div>

          {isStateFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New State</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsStateFormOpen(false);
                    setError("");
                    setFormData({...formData, state_name: ""});
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">State Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter State Name"
                      value={formData.state_name}
                      onChange={(e) =>
                        setFormData({...formData, state_name: e.target.value})
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAddState} className="btn btn-primary">
                  Add State
                </Button>
              </Form>
            </div>
          )}

          {isCityFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New City</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsCityFormOpen(false);
                    setError("");
                    setFormData({...formData, city_name: "", state_id: ""});
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Select State</FormLabel>
                    <FormControl
                      as="select"
                      value={formData.state_id}
                      onChange={(e) =>
                        setFormData({...formData, state_id: e.target.value})
                      }
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
                      type="text"
                      placeholder="Enter City Name"
                      value={formData.city_name}
                      onChange={(e) =>
                        setFormData({...formData, city_name: e.target.value})
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAddCity} className="btn btn-primary">
                  Add City
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>State & City Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table
                columns={columns}
                data={states}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StateCityMasterPage), { ssr: false });