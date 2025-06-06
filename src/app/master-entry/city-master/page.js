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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStateFormOpen, setIsStateFormOpen] = useState(false);
  const [isCityFormOpen, setIsCityFormOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
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
      cell: (row) => (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            {editingState && editingState._id === row._id ? (
              <FormControl
                type="text"
                value={formData.state_name}
                onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
              />
            ) : (
              row.state_name || "N/A"
            )}
          </div>
          <div>
            {editingState && editingState._id === row._id ? (
              <button className="editButton ms-2" onClick={() => handleUpdateState(row._id)}>
                <FaSave />
              </button>
            ) : (
              <button className="editButton ms-2" onClick={() => handleEditState(row)}>
                <FaEdit />
              </button>
            )}
            <button className="editButton btn-danger ms-2" onClick={() => handleDeleteState(row._id)}>
              <FaTrashAlt />
            </button>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Cities",
      cell: (row) => (
        <div className="classSpace">
          {row.cities && row.cities.length > 0 ? (
            row.cities.map((city, index) => (
              <div
                key={index}
                className="mb-2"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
              >
                <div className="flex-grow-1">
                  {editingCity && editingCity._id === city?._id ? (
                    <div className="d-flex align-items-center gap-2">
                      <FormControl
                        as="select"
                        value={formData.state_id}
                        onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                      >
                        <option value="">Select State</option>
                        {data.map((state) => (
                          <option key={state._id} value={state._id}>
                            {state.state_name}
                          </option>
                        ))}
                      </FormControl>
                      <FormControl
                        type="text"
                        value={formData.city_name}
                        onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                        placeholder="City Name"
                      />
                    </div>
                  ) : (
                    <span>{city?.city_name || "N/A"}</span>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {editingCity && editingCity._id === city?._id ? (
                    <>
                      <button className="editButton" onClick={() => handleUpdateCity(city._id)}>
                        <FaSave />
                      </button>
                      <button className="editButton btn-danger" onClick={() => setEditingCity(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="editButton" onClick={() => handleEditCity(city)}>
                        <FaEdit />
                      </button>
                      <button className="editButton btn-danger" onClick={() => handleDeleteCity(city?._id)}>
                        <FaTrashAlt />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            "No cities"
          )}
        </div>
      ),
    },
  ];


  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const stateResponse = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-states");
      const states = stateResponse.data.data || [];

      const cityResponse = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-cities");
      const cities = cityResponse.data.data || [];

      const updatedData = states.map((state) => {
        const stateCities = cities
          .filter((city) => city?.state?._id === state?._id || city?.state === state?._id)
          .map((city) => ({
            city_name: city?.city_name,
            _id: city?._id,
            state_id: city?.state?._id || city?.state || ""
          }));

        return { ...state, cities: stateCities || [] };
      });

      setData(updatedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddState = async () => {
    if (!formData.state_name.trim()) {
      setError("State name is required");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-states", {
        state_name: formData.state_name,
      });
      fetchData();
      setFormData({ ...formData, state_name: "" });
      setIsStateFormOpen(false);
    } catch (err) {
      console.error("Error adding state:", err);
      setError(err.response?.data?.message || "Failed to add state. Please try again later.");
    }
  };

  const handleAddCity = async () => {
    if (!formData.state_id || !formData.city_name.trim()) {
      setError("Both state and city name are required");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/add-cities", {
        state: formData.state_id,
        city_name: formData.city_name,
      });
      fetchData();
      setFormData({ ...formData, city_name: "", state_id: "" });
      setIsCityFormOpen(false);
    } catch (err) {
      console.error("Error adding city:", err);
      setError(err.response?.data?.message || "Failed to add city. Please try again later.");
    }
  };

  const handleEditState = (state) => {
    if (!state) return;
    setEditingState(state);
    setFormData({
      ...formData,
      state_name: state?.state_name || ""
    });
  };

  const handleEditCity = (city) => {
    if (!city) return;
    setEditingCity(city);
    setFormData({
      ...formData,
      city_name: city?.city_name || "",
      state_id: city?.state_id || city?.state?._id || city?.state || ""
    });
  };

  const handleUpdateState = async (id) => {
    if (!id) return;
    if (!formData.state_name.trim()) {
      setError("State name is required");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-states/${id}`, {
        state_name: formData.state_name,
      });
      fetchData();
      setEditingState(null);
      setFormData({ ...formData, state_name: "" });
    } catch (err) {
      console.error("Error updating state:", err);
      setError(err.response?.data?.message || "Failed to update state. Please try again later.");
    }
  };

  const handleUpdateCity = async (id) => {
    if (!id) return;
    if (!formData.state_id || !formData.city_name.trim()) {
      setError("Both state and city name are required");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-cities/${id}`, {
        state: formData.state_id,
        city_name: formData.city_name,
      });
      fetchData();
      setEditingCity(null);
      setFormData({ ...formData, city_name: "", state_id: "" });
    } catch (err) {
      console.error("Error updating city:", err);
      setError(err.response?.data?.message || "Failed to update city. Please try again later.");
    }
  };

  const handleDeleteState = async (id) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this state and all its cities?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-states/${id}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting state:", err);
        setError(err.response?.data?.message || "Failed to delete state. Please try again later.");
      }
    }
  };

  const handleDeleteCity = async (id) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-cities/${id}`);
        fetchData();
      } catch (err) {
        console.error("Error deleting city:", err);
        setError(err.response?.data?.message || "Failed to delete city. Please try again later.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "State Name", "Cities"]];
    const tableRows = data.map((state, index) => [
      index + 1,
      state?.state_name || "N/A",
      state?.cities?.map(c => c?.city_name).join(", ") || "N/A"
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "State Name", "Cities"];
    const rows = data.map((state, index) =>
      `${index + 1}\t${state?.state_name || "N/A"}\t${state?.cities?.map(c => c?.city_name).join(", ") || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                <h2>{editingState ? "Update State" : "Add New State"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsStateFormOpen(false);
                    setError("");
                    setFormData({ ...formData, state_name: "" });
                    setEditingState(null);
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
                        setFormData({ ...formData, state_name: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button
                  onClick={editingState ? () => handleUpdateState(editingState?._id) : handleAddState}
                  className="btn btn-primary"
                >
                  {editingState ? "Update State" : "Add State"}
                </Button>
              </Form>
            </div>
          )}

          {isCityFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingCity ? "Update City" : "Add New City"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsCityFormOpen(false);
                    setError("");
                    setFormData({ ...formData, city_name: "", state_id: "" });
                    setEditingCity(null);
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
                        setFormData({ ...formData, state_id: e.target.value })
                      }
                    >
                      <option value="">Select State</option>
                      {data.map((state) => (
                        <option key={state?._id} value={state?._id}>
                          {state?.state_name}
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
                        setFormData({ ...formData, city_name: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button
                  onClick={editingCity ? () => handleUpdateCity(editingCity?._id) : handleAddCity}
                  className="btn btn-primary"
                >
                  {editingCity ? "Update City" : "Add City"}
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
                data={data}
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