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
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { copyContent, printContent } from "@/app/utils";
import { addNewCity, addNewState, deleteCityById, deleteStateById, getCities, getStates, updateCityById, updateStateById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const StateCityMaster = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    state_name: "",
    city_name: "",
    state_id: "",
  });
  const [errors, setErrors] = useState({
    state_name: "",
    city_name: "",
    state_id: "",
  });
  const [editingState, setEditingState] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isStateFormOpen, setIsStateFormOpen] = useState(false);
  const [isCityFormOpen, setIsCityFormOpen] = useState(false);

  const validateStateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.state_name.trim()) {
      newErrors.state_name = "State name is required";
      isValid = false;
    } else if (formData.state_name.trim().length < 2) {
      newErrors.state_name = "State name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.state_name = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateCityForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.city_name.trim()) {
      newErrors.city_name = "City name is required";
      isValid = false;
    } else if (formData.city_name.trim().length < 2) {
      newErrors.city_name = "City name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.city_name = "";
    }

    if (!formData.state_id) {
      newErrors.state_id = "Please select a state";
      isValid = false;
    } else {
      newErrors.state_id = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stateRes, cityRes] = await Promise.all([
        getStates(),
        getCities()
      ]);
      setStates(stateRes.data || []);
      setCities(cityRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddState = async () => {
    if (!validateStateForm()) return;

    try {
      await addNewState({
        state_name: formData.state_name.trim()
      })
      toast.success("State added successfully");
      setFormData({ ...formData, state_name: "" });
      setIsStateFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add state");
    }
  };

  const handleAddCity = async () => {
    if (!validateCityForm()) return;

    try {
      await addNewCity({
        city_name: formData.city_name.trim(),
        state: formData.state_id,
      })
      toast.success("City added successfully");
      setFormData({ ...formData, city_name: "", state_id: "" });
      setIsCityFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add city");
    }
  };

  const handleEditState = (state) => {
    setEditingState(state);
    setFormData({ ...formData, state_name: state.state_name });
    setErrors({ ...errors, state_name: "" });
  };

  const handleUpdateState = async (id) => {
    if (!validateStateForm()) return;

    try {
      await updateStateById(id, {
        state_name: formData.state_name.trim(),
      })
      toast.success("State updated successfully");
      setEditingState(null);
      setFormData({ ...formData, state_name: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update state");
    }
  };

  const handleDeleteState = async (id) => {
    if (window.confirm("Are you sure you want to delete this state and all its cities?")) {
      try {
        await deleteStateById(id)
        toast.success("State deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete state");
      }
    }
  };

  const handleEditCity = (city) => {
    setEditingCity(city);
    setFormData({
      ...formData,
      city_name: city.city_name,
      state_id: city?.state?._id || city?.state,
    });
    setErrors({ ...errors, city_name: "", state_id: "" });
  };

  const handleUpdateCity = async (id) => {
    if (!validateCityForm()) return;

    try {
      await updateCityById(id, {
        city_name: formData.city_name.trim(),
        state: formData.state_id,
      })
      toast.success("City updated successfully");
      setEditingCity(null);
      setFormData({ ...formData, city_name: "", state_id: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update city");
    }
  };

  const handleDeleteCity = async (id) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      try {
        await deleteCityById(id)
        toast.success("City deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete city");
      }
    }
  };

  const stateColumns = [
    {
      name: "#",
      selector: (row, i) => i + 1,
      width: "60px",
    },
    {
      name: "State Name",
      selector: (row) => row.state_name,
      cell: (row) =>
        editingState?._id === row._id ? (
          <div>
            <FormControl
              value={formData.state_name}
              onChange={(e) => {
                setFormData({ ...formData, state_name: e.target.value });
                if (errors.state_name) {
                  setErrors({ ...errors, state_name: "" });
                }
              }}
              placeholder="Enter State"
              isInvalid={!!errors.state_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.state_name}
            </Form.Control.Feedback>
          </div>
        ) : (
          row.state_name
        ),
      grow: 2,
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) =>
        editingState?._id === row._id ? (
          <div className="d-flex flex-wrap gap-1 justify-content-start">
            <Button size="sm" variant="success" onClick={() => handleUpdateState(row._id)}>
              <FaSave />
            </Button>
            <Button size="sm" variant="danger" onClick={() => setEditingState(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-1">
            <Button size="sm" variant="success" onClick={() => handleEditState(row)}>
              <FaEdit />
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDeleteState(row._id)}>
              <FaTrashAlt />
            </Button>
          </div>
        ),
    }
  ];

  const cityColumns = [
    {
      name: "#",
      selector: (row, i) => i + 1,
      width: "60px",
    },
    {
      name: "City Name",
      selector: (row) => row.city_name,
      cell: (row) =>
        editingCity?._id === row._id ? (
          <div>
            <FormControl
              value={formData.city_name}
              onChange={(e) => {
                setFormData({ ...formData, city_name: e.target.value });
                if (errors.city_name) {
                  setErrors({ ...errors, city_name: "" });
                }
              }}
              placeholder="Enter City"
              isInvalid={!!errors.city_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.city_name}
            </Form.Control.Feedback>
          </div>
        ) : (
          row.city_name || "N/A"
        ),
      grow: 2,
      sortable: true,
    },
    {
      name: "State",
      selector: (row) =>
        states.find((s) => s._id === (row?.state?._id || row?.state))?.state_name || "N/A",
      grow: 2,
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) =>
        editingCity?._id === row._id ? (
          <div className="d-flex gap-1">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUpdateCity(row._id)}
            >
              <FaSave />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setEditingCity(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-1">
            <Button
              variant="success"
              size="sm" onClick={() => handleEditCity(row)}>
              <FaEdit />
            </Button>
            <Button
              variant="danger"
              size="sm" onClick={() => handleDeleteCity(row._id)}>
              <FaTrashAlt />
            </Button>
          </div>
        ),
    }

  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp
                items={[
                  { label: "Master Entry", link: "/master-entry/all-module" },
                  { label: "State-City Master", link: "" },
                ]}
              />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          {
            hasSubmitAccess && (
              <div className="d-flex gap-2 mb-3">
                <Button className="btn-add" onClick={() => setIsStateFormOpen(true)}>
                  <CgAddR /> Add State
                </Button>
                <Button
                  className="btn-add"
                  onClick={() => setIsCityFormOpen(true)}
                  disabled={states.length === 0}
                  title={states.length === 0 ? "Please add states first" : ""}
                >
                  <CgAddR /> Add City
                </Button>
              </div>
            )
          }

          {/* State Form */}
          {isStateFormOpen && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading d-flex justify-content-between align-items-center mb-3">
                <h2>Add State</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsStateFormOpen(false);
                    setFormData({ ...formData, state_name: "" });
                    setErrors({ ...errors, state_name: "" });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col md={8}>
                    <Form.Group controlId="stateName">
                      <Form.Label>State Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter State"
                        value={formData.state_name}
                        onChange={(e) => {
                          setFormData({ ...formData, state_name: e.target.value });
                          if (errors.state_name) {
                            setErrors({ ...errors, state_name: "" });
                          }
                        }}
                        isInvalid={!!errors.state_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.state_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-3">
                  <Button variant="primary" onClick={handleAddState}>
                    Add State
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsStateFormOpen(false);
                      setFormData({ ...formData, state_name: "" });
                      setErrors({ ...errors, state_name: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {/* City Form */}
          {isCityFormOpen && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading d-flex justify-content-between align-items-center mb-3">
                <h2>Add City</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsCityFormOpen(false);
                    setFormData({ ...formData, city_name: "", state_id: "" });
                    setErrors({ ...errors, city_name: "", state_id: "" });
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group controlId="stateSelect">
                      <Form.Label>Select State</Form.Label>
                      <Form.Select
                        value={formData.state_id}
                        onChange={(e) => {
                          setFormData({ ...formData, state_id: e.target.value });
                          if (errors.state_id) {
                            setErrors({ ...errors, state_id: "" });
                          }
                        }}
                        isInvalid={!!errors.state_id}
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.state_name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.state_id}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={8}>
                    <Form.Group controlId="cityName">
                      <Form.Label>City Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter City"
                        value={formData.city_name}
                        onChange={(e) => {
                          setFormData({ ...formData, city_name: e.target.value });
                          if (errors.city_name) {
                            setErrors({ ...errors, city_name: "" });
                          }
                        }}
                        isInvalid={!!errors.city_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.city_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-3">
                  <Button variant="primary" onClick={handleAddCity}>
                    Add City
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsCityFormOpen(false);
                      setFormData({ ...formData, city_name: "", state_id: "" });
                      setErrors({ ...errors, city_name: "", state_id: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {/* State Table */}
          <div className="tableSheet mb-4">
            <h2>State List</h2>
            {loading ? (
              <div className="text-center py-4">Loading states...</div>
            ) : states.length === 0 ? (
              <div className="text-center py-4">No states found</div>
            ) : (
              <Table
                columns={stateColumns}
                data={states}
                handleCopy={() => copyContent(["#", "State"], states.map((s, i) => `${i + 1}\t${s.state_name}`))}
                handlePrint={() => printContent([["#", "State"]], states.map((s, i) => [i + 1, s.state_name]))}
              />
            )}
          </div>

          {/* City Table */}
          <div className="tableSheet">
            <h2>Cities List</h2>
            {loading ? (
              <div className="text-center py-4">Loading cities...</div>
            ) : cities.length === 0 ? (
              <div className="text-center py-4">No cities found</div>
            ) : (
              <Table
                columns={cityColumns}
                data={cities}
                handleCopy={() =>
                  copyContent(["#", "City", "State"], cities.map((c, i) => `${i + 1}\t${c.city_name}\t${c?.state?.state_name || "N/A"}`))
                }
                handlePrint={() =>
                  printContent(
                    [["#", "City", "State"]],
                    cities.map((c, i) => [
                      i + 1,
                      c.city_name,
                      states.find((s) => s._id === (c.state?._id || c.state))?.state_name || "N/A",
                    ])
                  )
                }
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StateCityMaster), { ssr: false });