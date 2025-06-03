"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormSelect, Button } from 'react-bootstrap';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import axios from 'axios';

const StudentVehicle = () => {
  const API_BASE_URL = "https://erp-backend-fy3n.onrender.com/api";
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [formData, setFormData] = useState({ student: '', vehicle_route: '', pickUpPoint: '' });
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '60px',
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicle_no,
      sortable: true,
    },
    {
      name: 'Students',
      cell: row => (
        <div>
          {row.students.map((name, index) => (
            <div key={index}>{name}</div>
          ))}
        </div>
      ),
      wrap: true,
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
      const rawData = response.data.data;

      // Grouping students by vehicle_no
      const grouped = rawData.reduce((acc, curr) => {
        const vehicle_no = curr.vehicle_route?.Vehicle_No || "Unknown";
        const studentName = curr.student ? `${curr.student.first_name} ${curr.student.last_name}` : "N/A";

        const found = acc.find(item => item.vehicle_no === vehicle_no);
        if (found) {
          found.students.push(studentName);
        } else {
          acc.push({ vehicle_no, students: [studentName] });
        }

        return acc;
      }, []);

      setData(grouped);
    } catch (err) {
      console.error("Error fetching student vehicles:", err);
      setError(err.response?.data?.message || "Failed to fetch student vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.student || !formData.vehicle_route || !formData.pickUpPoint) {
        throw new Error("Please fill all required fields");
      }

      await axios.post(`${API_BASE_URL}/assign-studentVehicle`, formData);

      setFormData({ student: '', vehicle_route: '', pickUpPoint: '' });
      setShowAddForm(false);
      fetchStudentVehicles();
      setError("");
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(err.response?.data?.message || err.message || "Failed to assign transport");
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchStudentVehicles();
  }, []);

  const breadcrumbItems = [
    { label: "Transport", link: "/Transport/all-module" },
    { label: "Transport User", link: "null" }
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
              {error && <div className="alert alert-danger mt-3">{error}</div>}

              {showAddForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add Student Transport Assignment</h2>
                    <button className='closeForm' onClick={() => setShowAddForm(false)}>X</button>
                  </div>
                  <Form onSubmit={handleSubmit} className='formSheet'>
                    <Row className="mb-3">
                      <FormGroup as={Col} lg="6">
                        <FormLabel>Student*</FormLabel>
                        <FormSelect name="student" value={formData.student} onChange={handleChange} required>
                          <option value="">Select Student</option>
                          {students.map(student => (
                            <option key={student._id} value={student._id}>
                              {student.first_name} {student.last_name} ({student.adm_no})
                            </option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} lg="6">
                        <FormLabel>Route*</FormLabel>
                        <FormSelect name="vehicle_route" value={formData.vehicle_route} onChange={handleChange} required>
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
                      <FormGroup as={Col} lg="12">
                        <FormLabel>Pickup Point*</FormLabel>
                        <FormSelect name="pickUpPoint" value={formData.pickUpPoint} onChange={handleChange} required>
                          <option value="">Select Pickup Point</option>
                          {pickupPoints.map(point => (
                            <option key={point._id} value={point._id}>{point.PickupPoint}</option>
                          ))}
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Button type="submit" className='btn btn-primary mt-4'>Submit</Button>
                  </Form>
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="tableSheet">
                 <h2>Transport User</h2>
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
