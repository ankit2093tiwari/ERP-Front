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
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    student: '',
    vehicle_route: '',
    pickUpPoint: ''
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
            value={updatedData.vehicle_route}
            onChange={(e) => handleUpdateChange(e, 'vehicle_route')}
          >
            <option value="">Select Route</option>
            {routes.map(route => (
              <option key={route._id} value={route._id}>
                {route.Route_name} ({route.Vehicle_No})
              </option>
            ))}
          </FormSelect>
        ) : (
          row.vehicle_route ? `${row.vehicle_route.Route_name} (${row.vehicle_route.Vehicle_No})` : 'N/A'
        ),
      sortable: true,
    },
    {
      name: 'Pickup Point',
      selector: row =>
        editRowId === row._id ? (
          <FormSelect
            value={updatedData.pickUpPoint}
            onChange={(e) => handleUpdateChange(e, 'pickUpPoint')}
          >
            <option value="">Select Pickup Point</option>
            {pickupPoints.map(point => (
              <option key={point._id} value={point._id}>
                {point.PickupPoint}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.pickUpPoint ? `${row.pickUpPoint.PickupPoint}` : 'N/A'
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

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, routesRes, pickupPointsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/students/search`),
        axios.get(`${API_BASE_URL}/routes`),
        axios.get(`${API_BASE_URL}/pickup-points`)
      ]);
      
      setStudents(studentsRes.data.data);
      setRoutes(routesRes.data.data);
      setPickupPoints(pickupPointsRes.data.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Failed to fetch dropdown data");
    }
  };

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/all-studentVehicle`);
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
      if (!formData.student || !formData.vehicle_route || !formData.pickUpPoint) {
        throw new Error("Please fill all required fields");
      }

      const response = await axios.post(`${API_BASE_URL}/assign-studentVehicle`, {
        student: formData.student,
        vehicle_route: formData.vehicle_route,
        pickUpPoint: formData.pickUpPoint
      });

      setData([...data, response.data.data]);
      setShowAddForm(false);
      setFormData({
        student: '',
        vehicle_route: '',
        pickUpPoint: ''
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
      student: row.student?._id,
      vehicle_route: row.vehicle_route?._id,
      pickUpPoint: row.pickUpPoint?._id
    });
  };

  const handleUpdate = async (id) => {
    try {
      if (!updatedData.vehicle_route || !updatedData.pickUpPoint) {
        throw new Error("Please fill all required fields");
      }

      await axios.put(`${API_BASE_URL}/update-studentVehicle/${id}`, {
        student: updatedData.student,
        vehicle_route: updatedData.vehicle_route,
        pickUpPoint: updatedData.pickUpPoint
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
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await axios.delete(`${API_BASE_URL}/student-vehicle/${id}`);
        setData(prevData => prevData.filter(item => item._id !== id));
        setError("");
      } catch (err) {
        console.error("Error deleting student vehicle relation:", err);
        setError(err.response?.data?.message || "Failed to delete relation");
      }
    }
  };

  useEffect(() => {
    fetchDropdownData();
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
                <CgAddR /> New Transport Assignment
              </Button>

              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}

              {showAddForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add Student Transport Assignment</h2>
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
                            <option key={student._id} value={student._id}>
                              {student.first_name} {student.last_name} ({student.adm_no})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} lg="6" controlId="routeSelect">
                        <FormLabel className="labelForm">Route*</FormLabel>
                        <FormSelect
                          name="vehicle_route"
                          value={formData.vehicle_route}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Route</option>
                          {routes.map(route => (
                            <option key={route._id} value={route._id}>
                              {route.Route_name} ({route.Vehicle_No})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="12" controlId="pickupPointSelect">
                        <FormLabel className="labelForm">Pickup Point*</FormLabel>
                        <FormSelect
                          name="pickUpPoint"
                          value={formData.pickUpPoint}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Pickup Point</option>
                          {pickupPoints.map(point => (
                            <option key={point._id} value={point._id}>
                              {point.PickupPoint}
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

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Student Transport Assignments</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p style={{ color: "red" }}>{error}</p>
                ) : data.length > 0 ? (
                  <Table columns={columns} data={data} />
                ) : (
                  <p>No student transport assignments available</p>
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