"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import axios from 'axios';

const StudentVehicle = () => {
  const API_BASE_URL = "https://erp-backend-fy3n.onrender.com/api";
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    vehicleId: '',
    pickupPoint: '',
    amount: ''
  });

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Student Name',
      selector: row => 
        editRowId === row._id ? (
          <FormSelect
            value={updatedData.studentId}
            onChange={(e) => handleUpdateChange(e, 'studentId')}
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.name} - {student.fatherName}
              </option>
            ))}
          </FormSelect>
        ) : (
          `${row.student.name} (${row.student.fatherName})`
        ),
      sortable: true,
    },
    {
      name: 'Class',
      selector: row => row.student.class || 'N/A',
      sortable: true,
    },
    {
      name: 'Transport No',
      selector: row => 
        editRowId === row._id ? (
          <FormSelect
            value={updatedData.vehicleId}
            onChange={(e) => handleUpdateChange(e, 'vehicleId')}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.Vehicle_No} (Seats: {vehicle.seats || 'N/A'})
              </option>
            ))}
          </FormSelect>
        ) : (
          row.vehicle.Vehicle_No
        ),
      sortable: true,
    },
    {
      name: 'Pickup Point',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="text"
            value={updatedData.pickupPoint}
            onChange={(e) => handleUpdateChange(e, 'pickupPoint')}
          />
        ) : (
          row.pickupPoint
        ),
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => 
        editRowId === row._id ? (
          <FormControl
            type="number"
            value={updatedData.amount}
            onChange={(e) => handleUpdateChange(e, 'amount')}
            min="0"
          />
        ) : (
          `${row.amount} Rs.`
        ),
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ display: 'flex' }}>
          {editRowId === row._id ? (
            <button className='editButton btn-success'
              onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className='editButton'
              onClick={() => handleEditClick(row)}>
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    }
  ];

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/dropdown`);
      setStudents(response.data.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/vehicles/dropdown`);
      setVehicles(response.data.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to fetch vehicles");
    }
  };

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/student-vehicles`);
      setData(response.data.data);
    } catch (err) {
      console.error("Error fetching student vehicles:", err);
      setError(err.response?.data?.message || "Failed to fetch student vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateChange = (e, field) => {
    setUpdatedData({ ...updatedData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/student-vehicles`, formData);
      setData([...data, response.data.data]);
      setShowAddForm(false);
      setFormData({
        studentId: '',
        vehicleId: '',
        pickupPoint: '',
        amount: ''
      });
    } catch (err) {
      console.error("Error creating student vehicle relation:", err);
      setError(err.response?.data?.message || "Failed to create relation");
    }
  };

  const handleEditClick = (row) => {
    setEditRowId(row._id);
    setUpdatedData({
      studentId: row.student._id,
      vehicleId: row.vehicle._id,
      pickupPoint: row.pickupPoint,
      amount: row.amount
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/student-vehicles/${id}`, updatedData);
      fetchStudentVehicles();
      setEditRowId(null);
    } catch (err) {
      console.error("Error updating student vehicle relation:", err);
      setError(err.response?.data?.message || "Failed to update relation");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this student-vehicle relation?")) {
      try {
        await axios.delete(`${API_BASE_URL}/student-vehicles/${id}`);
        setData(data.filter(item => item._id !== id));
      } catch (err) {
        console.error("Error deleting student vehicle relation:", err);
        setError(err.response?.data?.message || "Failed to delete relation");
      }
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchVehicles();
    fetchStudentVehicles();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" }, 
    { label: "Student Vehicle Relation", link: "null" }
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
                <CgAddR /> New Transport
              </Button>

              {showAddForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add Student Transport</h2>
                    <button className='closeForm' onClick={() => setShowAddForm(false)}> X </button>
                  </div>
                  <Form onSubmit={handleSubmit} className='formSheet'>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="6" controlId="studentSelect">
                        <FormLabel className="labelForm">Student*</FormLabel>
                        <FormSelect 
                          name="studentId" 
                          value={formData.studentId} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Select Student</option>
                          {students.map(student => (
                            <option key={student._id} value={student._id}>
                              {student.name} - {student.fatherName}
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} lg="6" controlId="vehicleSelect">
                        <FormLabel className="labelForm">Vehicle*</FormLabel>
                        <FormSelect 
                          name="vehicleId" 
                          value={formData.vehicleId} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.Vehicle_No} (Seats: {vehicle.seats || 'N/A'})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="6" controlId="pickupPoint">
                        <FormLabel className="labelForm">Pickup Point*</FormLabel>
                        <FormControl
                          required
                          type="text"
                          name="pickupPoint"
                          value={formData.pickupPoint}
                          onChange={handleChange}
                          placeholder="Enter pickup point"
                        />
                      </FormGroup>
                      <FormGroup as={Col} lg="6" controlId="amount">
                        <FormLabel className="labelForm">Amount*</FormLabel>
                        <FormControl
                          required
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          min="0"
                          placeholder="Enter amount"
                        />
                      </FormGroup>
                    </Row>
                    <Button type="submit" className='btn btn-primary mt-4'>
                      Submit
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
                <h2>Edit Student Transport</h2>
                <button className='closeForm' onClick={() => setEditRowId(null)}> X </button>
              </div>
              <Form className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="6" controlId="editStudent">
                    <FormLabel className="labelForm">Student*</FormLabel>
                    <FormSelect
                      value={updatedData.studentId}
                      onChange={(e) => handleUpdateChange(e, 'studentId')}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} - {student.fatherName}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} lg="6" controlId="editVehicle">
                    <FormLabel className="labelForm">Vehicle*</FormLabel>
                    <FormSelect
                      value={updatedData.vehicleId}
                      onChange={(e) => handleUpdateChange(e, 'vehicleId')}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.Vehicle_No} (Seats: {vehicle.seats || 'N/A'})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="6" controlId="editPickupPoint">
                    <FormLabel className="labelForm">Pickup Point*</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={updatedData.pickupPoint}
                      onChange={(e) => handleUpdateChange(e, 'pickupPoint')}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="6" controlId="editAmount">
                    <FormLabel className="labelForm">Amount*</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={updatedData.amount}
                      onChange={(e) => handleUpdateChange(e, 'amount')}
                      min="0"
                    />
                  </FormGroup>
                </Row>
                <Button 
                  onClick={() => handleUpdate(editRowId)} 
                  className='btn btn-primary mt-4'
                >
                  Update
                </Button>
              </Form>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Student Transport Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} />
                ) : (
                  <p>No student transport records available</p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(StudentVehicle), { ssr: false });