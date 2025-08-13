"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import { copyContent, printContent } from '@/app/utils';
import { addNewFuelFilling, deleteFuelFillingById, getAllFuelFillings, getAllVehicles, updateFuelFillingById } from '@/Services';
import usePagePermission from '@/hooks/usePagePermission';

const FuelFilling = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

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
    { name: '#', selector: (row, index) => index + 1, width: '80px' },
    { name: 'Date', selector: row => new Date(row.date).toLocaleDateString() || "N/A", sortable: true },
    { name: 'Vehicle No', selector: row => row.Vehicle_No || "N/A", sortable: true },
    { name: 'Amount Per Litre', selector: row => `${row.Amount_per_Liter} Rs.` || "N/A", sortable: true },
    { name: 'Quantity', selector: row => row.Quantity_of_diesel || "N/A", sortable: true },
    { name: 'Previous Reading', selector: row => row.PreviousReading || "N/A", sortable: true },
    { name: 'New Reading', selector: row => row.NewReading || "N/A", sortable: true },
    { name: 'Total Amount', selector: row => `${row.Quantity_of_diesel * row.Amount_per_Liter} Rs.` || "N/A", sortable: true },
    hasEditAccess && {
      name: 'Action',
      cell: row => (
        <div className='d-flex gap-1'>
          <Button size='sm' variant='success' onClick={() => handleEdit(row)}><FaEdit /></Button>
          <Button size='sm' variant='danger' onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
        </div>
      ),
    }
  ].filter(Boolean);

  const validateForm = (values) => {
    const newErrors = {};
    if (!values.Vehicle_No) newErrors.Vehicle_No = "Vehicle No is required";
    if (!values.Filled_Station) newErrors.Filled_Station = "Filled Station is required";
    if (!values.Quantity_of_diesel || values.Quantity_of_diesel <= 0) newErrors.Quantity_of_diesel = "Valid quantity is required";
    if (!values.PreviousReading || values.PreviousReading < 0) newErrors.PreviousReading = "Valid reading is required";
    if (!values.Amount_per_Liter || values.Amount_per_Liter <= 0) newErrors.Amount_per_Liter = "Valid amount is required";
    if (!values.NewReading || values.NewReading <= values.PreviousReading) newErrors.NewReading = "New reading must be greater than previous";
    if (!values.date) newErrors.date = "Date is required";
    return newErrors;
  };

  const fetchVehicles = async () => {
    try {
      const response = await getAllVehicles()
      setVehicles(response.data);
    } catch {
      toast.error("Failed to fetch vehicles");
    }
  };

  const fetchFuelFillings = async () => {
    setLoading(true);
    try {
      const response = await getAllFuelFillings()
      setData(response.data);
    } catch {
      toast.error("Failed to fetch fuel fillings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
    if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      if (editingId) {
        await updateFuelFillingById(editingId, formData);
        toast.success("Fuel filling updated successfully");
      } else {
        await addNewFuelFilling(formData);
        toast.success("Fuel filling added successfully");
      }
      fetchFuelFillings();
      handleCloseForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save fuel filling");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setFormData({
      Vehicle_No: row.Vehicle_No,
      Filled_Station: row.Filled_Station,
      Quantity_of_diesel: row.Quantity_of_diesel,
      PreviousReading: row.PreviousReading,
      Amount_per_Liter: row.Amount_per_Liter,
      NewReading: row.NewReading,
      date: new Date(row.date)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fuel filling record?")) {
      try {
        await deleteFuelFillingById(id)
        toast.success("Fuel filling deleted successfully");
        fetchFuelFillings()
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete fuel filling");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      Vehicle_No: '',
      Filled_Station: '',
      Quantity_of_diesel: '',
      PreviousReading: '',
      Amount_per_Liter: '',
      NewReading: '',
      date: new Date()
    });
    setErrors({});
  };

  const handlePrint = () => {
    const headers = [["#", "Date", "Vehicle No", "Amount/Litre", "Quantity", "Prev Reading", "New Reading", "Total Amount"]];
    const rows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.Vehicle_No,
      `${row.Amount_per_Liter} Rs.`,
      row.Quantity_of_diesel,
      row.PreviousReading,
      row.NewReading,
      `${row.Quantity_of_diesel * row.Amount_per_Liter} Rs.`
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Vehicle No", "Amount/Litre", "Quantity", "Prev Reading", "New Reading", "Total Amount"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.Vehicle_No}\t${row.Amount_per_Liter} Rs.\t${row.Quantity_of_diesel}\t${row.PreviousReading}\t${row.NewReading}\t${row.Quantity_of_diesel * row.Amount_per_Liter} Rs.`
    );
    copyContent(headers, rows);
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
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <Row>
            <Col>
              {hasSubmitAccess && (
                <Button onClick={() => setShowForm(true)} className="btn-add">
                  <CgAddR /> New Fuel Filling
                </Button>
              )}

              {showForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>{editingId ? "Edit Fuel Filling" : "Add Fuel Filling"}</h2>
                    <button className='closeForm' onClick={handleCloseForm}> X </button>
                  </div>
                  <Form onSubmit={handleSubmit} className='formSheet'>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Vehicle No<span className='text-danger'>*</span></FormLabel>
                        <FormSelect
                          name="Vehicle_No"
                          value={formData.Vehicle_No}
                          onChange={handleChange}
                          isInvalid={!!errors.Vehicle_No}
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle.Vehicle_No}>{vehicle.Vehicle_No}</option>
                          ))}
                        </FormSelect>
                        <FormControl.Feedback type="invalid">{errors.Vehicle_No}</FormControl.Feedback>
                      </FormGroup>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Filled Station<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          placeholder='Enter Filled Station Name'
                          type="text"
                          name="Filled_Station"
                          value={formData.Filled_Station}
                          onChange={handleChange}
                          isInvalid={!!errors.Filled_Station}
                        />
                        <FormControl.Feedback type="invalid">{errors.Filled_Station}</FormControl.Feedback>
                      </FormGroup>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Quantity<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          placeholder='Enter Quantity in litre'
                          type="number"
                          name="Quantity_of_diesel"
                          value={formData.Quantity_of_diesel}
                          onChange={handleChange}
                          min="0.1"
                          step="0.01"
                          isInvalid={!!errors.Quantity_of_diesel}
                        />
                        <FormControl.Feedback type="invalid">{errors.Quantity_of_diesel}</FormControl.Feedback>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Previous Reading<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          placeholder='Enter Previous Reading'
                          type="number"
                          name="PreviousReading"
                          value={formData.PreviousReading}
                          onChange={handleChange}
                          min="0"
                          isInvalid={!!errors.PreviousReading}
                        />
                        <FormControl.Feedback type="invalid">{errors.PreviousReading}</FormControl.Feedback>
                      </FormGroup>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Amount Per Litre<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          placeholder='Enter Amount/Lt.'
                          type="number"
                          name="Amount_per_Liter"
                          value={formData.Amount_per_Liter}
                          onChange={handleChange}
                          min="0.1"
                          step="0.01"
                          isInvalid={!!errors.Amount_per_Liter}
                        />
                        <FormControl.Feedback type="invalid">{errors.Amount_per_Liter}</FormControl.Feedback>
                      </FormGroup>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">New Reading<span className='text-danger'>*</span></FormLabel>
                        <FormControl
                          placeholder='Enter New Reading.'
                          type="number"
                          name="NewReading"
                          value={formData.NewReading}
                          onChange={handleChange}
                          min={formData.PreviousReading ? parseInt(formData.PreviousReading) + 1 : 0}
                          isInvalid={!!errors.NewReading}
                        />
                        <FormControl.Feedback type="invalid">{errors.NewReading}</FormControl.Feedback>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} lg="4">
                        <FormLabel className="labelForm">Date<span className='text-danger'>*</span></FormLabel>
                        <DatePicker
                          selected={formData.date}
                          onChange={handleDateChange}
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                        />
                        {errors.date && <div className="invalid-feedback d-block">{errors.date}</div>}
                      </FormGroup>
                    </Row>
                    <Button type="submit" variant='success'>
                      {editingId ? "Update Fuel Filling" : "Add Fuel Filling"}
                    </Button>
                  </Form>
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Fuel Filling Records</h2>
                {loading ? <p>Loading...</p> : data.length > 0 ? (
                  <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
                ) : <p>No fuel filling records available</p>}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FuelFilling), { ssr: false });
