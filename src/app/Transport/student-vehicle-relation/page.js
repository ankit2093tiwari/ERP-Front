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
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    student: '',
    route: '',
    Vehicle_No: ''
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
            value={updatedData.student}
            onChange={(e) => handleUpdateChange(e, 'student')}
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.first_name} {student.last_name}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.student
            ? `${row.student.first_name} ${row.student.last_name}`
            : 'N/A'
        ),
      sortable: true,
    },
    {
      name: 'Route',
      selector: row =>
        editRowId === row._id ? (
          <FormSelect
            value={updatedData.route}
            onChange={(e) => handleUpdateChange(e, 'route')}
          >
            <option value="">Select Route</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>
                {route.Route_name} ({route.Vehicle_No})
              </option>
            ))}
          </FormSelect>
        ) : (
          row.route ? `${row.route.Route_name} (${row.route.Vehicle_No})` : 'N/A'
        ),
      sortable: true,
    },
    {
      name: 'Vehicle',
      selector: row => {
        const vehicle = row.Vehicle_No;
        if (editRowId === row._id) {
          return (
            <FormSelect
              value={updatedData.Vehicle_No}
              onChange={(e) => handleUpdateChange(e, 'Vehicle_No')}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.Vehicle_No} ({vehicle.Vehicle_Type})
                </option>
              ))}
            </FormSelect>
          );
        }
        
        if (vehicle && typeof vehicle === 'object') {
          return `${vehicle.Vehicle_No || 'N/A'} (${vehicle.Vehicle_Type || 'N/A'})`;
        }
        
        return 'N/A';
      },
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.route?.Amount ? `${row.route.Amount} Rs.` : 'N/A',
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.isActive ? 'Active' : 'Inactive',
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
      const response = await axios.get(`${API_BASE_URL}/students/search`);
      setStudents(response.data.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all-routes`);
      setRoutes(response.data.data);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Failed to fetch routes");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all-vehicles`);
      setVehicles(response.data.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to fetch vehicles");
    }
  };

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments`);
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
      if (!formData.student || !formData.route || !formData.Vehicle_No) {
        throw new Error("Please fill all required fields");
      }

      const response = await axios.post(`${API_BASE_URL}/assign`, {
        student: String(formData.student),
        route: String(formData.route),
        Vehicle_No: String(formData.Vehicle_No)
      });

      setData([...data, response.data.data]);
      setShowAddForm(false);
      setFormData({
        student: '',
        route: '',
        Vehicle_No: ''
      });
      setError("");
    } catch (err) {
      console.error("Error creating student vehicle relation:", err);
      setError(err.response?.data?.message || err.message || "Failed to create relation");
    }
  };

  const handleEditClick = (row) => {
    setEditRowId(row._id);
    setUpdatedData({
      student: String(row.student?._id),
      route: String(row.route?._id),
      Vehicle_No: String(row.Vehicle_No?._id)
    });
  };

  const handleUpdate = async (id) => {
    try {
      if (!updatedData.route || !updatedData.Vehicle_No) {
        throw new Error("Please fill all required fields");
      }

      await axios.put(`${API_BASE_URL}/assignment/${id}`, {
        route: String(updatedData.route),
        Vehicle_No: String(updatedData.Vehicle_No)
      });

      fetchStudentVehicles();
      setEditRowId(null);
      setError("");
    } catch (err) {
      console.error("Error updating student vehicle relation:", err);
      setError(err.response?.data?.message || err.message || "Failed to update relation");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate this assignment?")) {
      try {
        await axios.delete(`${API_BASE_URL}/assignment/${id}`);
        setData(prevData => prevData.filter(item => item._id !== id));
        setError("");
      } catch (err) {
        console.error("Error deleting student vehicle relation:", err);
        setError(err.response?.data?.message || "Failed to delete relation");
      }
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRoutes();
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

              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}

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
                          name="student"
                          value={formData.student}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Student</option>
                          {students.map(student => (
                            <option key={student._id} value={String(student._id)}>
                              {student.first_name} {student.last_name} ({student.adm_no})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} lg="6" controlId="routeSelect">
                        <FormLabel className="labelForm">Route*</FormLabel>
                        <FormSelect
                          name="route"
                          value={formData.route}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Route</option>
                          {routes.map(route => (
                            <option key={route._id} value={String(route._id)}>
                              {route.Route_name} ({route.Vehicle_No})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="12" controlId="vehicleSelect">
                        <FormLabel className="labelForm">Vehicle*</FormLabel>
                        <FormSelect
                          name="Vehicle_No"
                          value={formData.Vehicle_No}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={String(vehicle._id)}>
                              {vehicle.Vehicle_No} ({vehicle.Vehicle_Type})
                            </option>
                          ))}
                        </FormSelect>
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
                      value={updatedData.student}
                      onChange={(e) => handleUpdateChange(e, 'student')}
                      required
                      disabled
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={String(student._id)}>
                          {student.first_name} {student.last_name} ({student.adm_no})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} lg="6" controlId="editRoute">
                    <FormLabel className="labelForm">Route*</FormLabel>
                    <FormSelect
                      value={updatedData.route}
                      onChange={(e) => handleUpdateChange(e, 'route')}
                      required
                    >
                      <option value="">Select Route</option>
                      {routes.map(route => (
                        <option key={route._id} value={String(route._id)}>
                          {route.Route_name} ({route.Vehicle_No})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="12" controlId="editVehicle">
                    <FormLabel className="labelForm">Vehicle*</FormLabel>
                    <FormSelect
                      value={updatedData.Vehicle_No}
                      onChange={(e) => handleUpdateChange(e, 'Vehicle_No')}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle._id} value={String(vehicle._id)}>
                          {vehicle.Vehicle_No} ({vehicle.Vehicle_Type})
                        </option>
                      ))}
                    </FormSelect>
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