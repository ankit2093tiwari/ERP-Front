"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const FuelFilling = () => {
  const API_BASE_URL = "https://erp-backend-fy3n.onrender.com/api";
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    Vehicle_No: '',
    Filled_Station: '',
    Quantity_of_diesel: '',
    PreviousReading: '',
    Amount_per_Liter: '',
    NewReading: '',
    date: new Date()
  });

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Date',
      selector: row => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => 
        editRowId === row._id ? (
          <FormSelect
            value={updatedData.Vehicle_No}
            onChange={(e) => handleUpdateChange(e, 'Vehicle_No')}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle.Vehicle_No}>
                {vehicle.Vehicle_No}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.Vehicle_No
        ),
      sortable: true,
    },
    {
      name: 'Amount Per Litre',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="number"
            value={updatedData.Amount_per_Liter}
            onChange={(e) => handleUpdateChange(e, 'Amount_per_Liter')}
            min="0.1"
            step="0.01"
          />
        ) : (
          `${row.Amount_per_Liter} Rs.`
        ),
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="number"
            value={updatedData.Quantity_of_diesel}
            onChange={(e) => handleUpdateChange(e, 'Quantity_of_diesel')}
            min="0.1"
            step="0.01"
          />
        ) : (
          row.Quantity_of_diesel
        ),
      sortable: true,
    },
    {
      name: 'Previous Reading',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="number"
            value={updatedData.PreviousReading}
            onChange={(e) => handleUpdateChange(e, 'PreviousReading')}
            min="0"
          />
        ) : (
          row.PreviousReading
        ),
      sortable: true,
    },
    {
      name: 'New Reading',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="number"
            value={updatedData.NewReading}
            onChange={(e) => handleUpdateChange(e, 'NewReading')}
            min={updatedData.PreviousReading ? parseInt(updatedData.PreviousReading) + 1 : 0}
          />
        ) : (
          row.NewReading
        ),
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: row => `${row.Quantity_of_diesel * row.Amount_per_Liter} Rs.`,
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex' }}>
          {editRowId === row._id ? (
            <button className='editButton btn-success'
              onClick={() => handleUpdate(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button className='editButton'
              onClick={() => handleEditClick(row)}
            >
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    }
  ];

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/vehicles/dropdown`);
      setVehicles(response.data.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to fetch vehicles");
    }
  };

  const fetchFuelFillings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/all-fuel-fillings`);
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching fuel fillings:", err);
      setError(err.response?.data?.message || "Failed to fetch fuel fillings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleUpdateChange = (e, field) => {
    setUpdatedData({ ...updatedData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/create-fuel-fillings`, formData);
      setData([...data, response.data.data]);
      setShowAddForm(false);
      fetchFuelFillings();
      setFormData({
        Vehicle_No: '',
        Filled_Station: '',
        Quantity_of_diesel: '',
        PreviousReading: '',
        Amount_per_Liter: '',
        NewReading: '',
        date: new Date()
      });
    } catch (err) {
      console.error("Error creating fuel filling:", err);
      setError(err.response?.data?.message || "Failed to create fuel filling");
    }
  };

  const handleEditClick = (row) => {
    setEditRowId(row._id);
    setUpdatedData({
      Vehicle_No: row.Vehicle_No,
      Filled_Station: row.Filled_Station,
      Quantity_of_diesel: row.Quantity_of_diesel,
      PreviousReading: row.PreviousReading,
      Amount_per_Liter: row.Amount_per_Liter,
      NewReading: row.NewReading,
      date: new Date(row.date)
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/update-fuel-fillings/${id}`, updatedData);
      fetchFuelFillings();
      setEditRowId(null);
    } catch (err) {
      console.error("Error updating fuel filling:", err);
      setError(err.response?.data?.message || "Failed to update fuel filling");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fuel filling record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/delete-fuel-fillings/${id}`);
        setData(data.filter(item => item._id !== id));
      } catch (err) {
        console.error("Error deleting fuel filling:", err);
        setError(err.response?.data?.message || "Failed to delete fuel filling");
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchFuelFillings();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" }, 
    { label: "Fuel Filling", link: "null" }
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
          <Row>
            <Col>
              <Button onClick={() => setShowAddForm(true)} className="btn-add">
                <CgAddR /> New Fuel Filling
              </Button>

              {showAddForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add Fuel Filling</h2>
                    <button className='closeForm' onClick={() => setShowAddForm(false)}> X </button>
                  </div>
                  <Form onSubmit={handleSubmit} className='formSheet'>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="4" controlId="validationCustom01">
                        <FormLabel className="labelForm">Vehicle No*</FormLabel>
                        <FormSelect 
                          name="Vehicle_No" 
                          value={formData.Vehicle_No} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle.Vehicle_No}>
                              {vehicle.Vehicle_No}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} lg="4" controlId="validationCustom02">
                        <FormLabel className="labelForm">Filled Station*</FormLabel>
                        <FormControl
                          required
                          type="text"
                          name="Filled_Station"
                          value={formData.Filled_Station}
                          onChange={handleChange}
                        />
                      </FormGroup>
                      <FormGroup as={Col} lg="4" controlId="validationCustom03">
                        <FormLabel className="labelForm">Quantity*</FormLabel>
                        <FormControl
                          required
                          type="number"
                          name="Quantity_of_diesel"
                          value={formData.Quantity_of_diesel}
                          onChange={handleChange}
                          min="0.1"
                          step="0.01"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} lg="4" controlId="validationCustom04">
                        <FormLabel className="labelForm">Previous Reading*</FormLabel>
                        <FormControl
                          required
                          type="number"
                          name="PreviousReading"
                          value={formData.PreviousReading}
                          onChange={handleChange}
                          min="0"
                        />
                      </FormGroup>
                      <FormGroup as={Col} lg="4" controlId="validationCustom05">
                        <FormLabel className="labelForm">Amount Per Litre*</FormLabel>
                        <FormControl
                          required
                          type="number"
                          name="Amount_per_Liter"
                          value={formData.Amount_per_Liter}
                          onChange={handleChange}
                          min="0.1"
                          step="0.01"
                        />
                      </FormGroup>
                      <FormGroup as={Col} lg="4" controlId="validationCustom06">
                        <FormLabel className="labelForm">New Reading*</FormLabel>
                        <FormControl
                          required
                          type="number"
                          name="NewReading"
                          value={formData.NewReading}
                          onChange={handleChange}
                          min={formData.PreviousReading ? parseInt(formData.PreviousReading) + 1 : 0}
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} lg="4" controlId="validationCustom07">
                        <FormLabel className="labelForm">Date*</FormLabel>
                        <DatePicker
                          selected={formData.date}
                          onChange={handleDateChange}
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                          required
                        />
                      </FormGroup>
                    </Row>
                    <Button type="submit" className='btn btn-primary mt-4'>
                      Add Fuel Filling
                    </Button>
                  </Form>
                </div>
              )}
            </Col>
          </Row>

          {/* Edit Form */}
          {editRowId && (
            <div className="cover-sheet mt-3">
              <div className="studentHeading">
                <h2>Edit Fuel Filling</h2>
                <button className='closeForm' onClick={() => setEditRowId(null)}> X </button>
              </div>
              <Form className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="4" controlId="editVehicleNo">
                    <FormLabel className="labelForm">Vehicle No*</FormLabel>
                    <FormSelect
                      value={updatedData.Vehicle_No}
                      onChange={(e) => handleUpdateChange(e, 'Vehicle_No')}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle.Vehicle_No}>
                          {vehicle.Vehicle_No}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="editFilledStation">
                    <FormLabel className="labelForm">Filled Station*</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={updatedData.Filled_Station}
                      onChange={(e) => handleUpdateChange(e, 'Filled_Station')}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="editQuantity">
                    <FormLabel className="labelForm">Quantity*</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={updatedData.Quantity_of_diesel}
                      onChange={(e) => handleUpdateChange(e, 'Quantity_of_diesel')}
                      min="0.1"
                      step="0.01"
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} lg="4" controlId="editPreviousReading">
                    <FormLabel className="labelForm">Previous Reading*</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={updatedData.PreviousReading}
                      onChange={(e) => handleUpdateChange(e, 'PreviousReading')}
                      min="0"
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="editAmountPerLitre">
                    <FormLabel className="labelForm">Amount Per Litre*</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={updatedData.Amount_per_Liter}
                      onChange={(e) => handleUpdateChange(e, 'Amount_per_Liter')}
                      min="0.1"
                      step="0.01"
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="editNewReading">
                    <FormLabel className="labelForm">New Reading*</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={updatedData.NewReading}
                      onChange={(e) => handleUpdateChange(e, 'NewReading')}
                      min={updatedData.PreviousReading ? parseInt(updatedData.PreviousReading) + 1 : 0}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} lg="4" controlId="editDate">
                    <FormLabel className="labelForm">Date*</FormLabel>
                    <DatePicker
                      selected={updatedData.date}
                      onChange={(date) => setUpdatedData({...updatedData, date})}
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                      required
                    />
                  </FormGroup>
                </Row>
                <Button 
                  onClick={() => handleUpdate(editRowId)} 
                  className='btn btn-primary mt-4'
                >
                  Update Fuel Filling
                </Button>
              </Form>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Fuel Filling Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} />
                ) : (
                  <p>No fuel filling records available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FuelFilling), { ssr: false });