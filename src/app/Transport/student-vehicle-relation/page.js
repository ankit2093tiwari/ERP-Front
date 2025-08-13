"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import { Container, Row, Col, Form, FormLabel, FormGroup, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from '@/app/utils';
import { toast } from 'react-toastify';
import { addNewStudentVehicle, deleteStudentVehicleById, getAllPickupPoints, getAllStudents, getAllStudentVehicles, getPickupPointsByRouteId, getRoutes, updateStudentVehicleById } from '@/Services';
import useSessionId from '@/hooks/useSessionId';
import usePagePermission from '@/hooks/usePagePermission';

const StudentVehicle = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const selectedSessionId = useSessionId();

  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedRouteId, setSelectedRouteId] = useState();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPickupPoints, setEditPickupPoints] = useState([]);

  const [formData, setFormData] = useState({
    student: '',
    vehicle_route: '',
    pickUpPoint: { location: '', amount: 0 }
  });

  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
      width: '80px',
    },
    {
      name: 'Student Name',
      selector: row => row.student ? `${row.student.first_name} ${row.student.last_name}` : 'N/A',
      sortable: true,
    },
    {
      name: 'Route',
      selector: row => row.vehicle_route ? `${row.vehicle_route.Route_name} (${row.vehicle_route.Vehicle_No})` : 'N/A',
      sortable: true,
    },
    {
      name: 'Pickup Point',
      selector: row => row.pickUpPoint?.location || 'N/A',
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.pickUpPoint?.amount !== undefined ? `₹${row.pickUpPoint.amount}` : 'N/A',
      sortable: true,
    },
    hasEditAccess && {
      name: 'Action',
      cell: row => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success"
            onClick={() => handleEditClick(row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    }
  ].filter(Boolean);

  useEffect(() => {
    if (selectedRouteId) {
      getPickupPointsByRouteId(selectedRouteId).then(res => {
        setPickupPoints(res?.data.pickupPoints || []);
      }).catch(err => console.error("Error fetching pickup points:", err));
    }
  }, [selectedRouteId]);

  const fetchEditPickupPoints = async (routeId) => {
    try {
      const response = await getPickupPointsByRouteId(routeId);
      setEditPickupPoints(response?.data.pickupPoints || []);
    } catch (error) {
      console.error("Error fetching pickup points:", error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, routesRes] = await Promise.all([
        getAllStudents(),
        getRoutes()
      ]);
      setStudents(studentsRes?.data);
      setRoutes(routesRes?.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      toast.error("Failed to fetch dropdown data");
    }
  };

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await getAllStudentVehicles();
      setData(response?.data.reverse());
    } catch (err) {
      console.error("Error fetching student vehicles:", err);
      toast.error(err.response?.data?.message || "Failed to fetch student vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vehicle_route") {
      setSelectedRouteId(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePickupChange = (e) => {
    const point = pickupPoints.find(p => p.location === e.target.value);
    if (point) {
      setFormData(prev => ({
        ...prev,
        pickUpPoint: { location: point.location, amount: point.amount }
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.student) newErrors.student = "Please select a student.";
    if (!formData.vehicle_route) newErrors.vehicle_route = "Please select a vehicle route.";
    if (!formData.pickUpPoint.location) newErrors.pickUpPoint = "Please select a pick-up point.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Please fill required fields.");
      return;
    }
    try {
      await addNewStudentVehicle({
        student: formData.student,
        vehicle_route: formData.vehicle_route,
        pickUpPoint: formData.pickUpPoint
      });
      toast.success("Transport assignment created successfully!");
      fetchStudentVehicles();
      setShowAddForm(false);
      setFormData({ student: '', vehicle_route: '', pickUpPoint: { location: '', amount: 0 } });
      setFormErrors({});
    } catch (err) {
      console.error("Error creating student vehicle relation:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to create relation");
    }
  };

  const handleEditClick = (row) => {
    setEditRowId(row._id);
    setUpdatedData({
      student: row.student?._id,
      vehicle_route: row.vehicle_route?._id,
      pickUpPoint: {
        location: row.pickUpPoint?.location,
        amount: row.pickUpPoint?.amount
      }
    });
    fetchEditPickupPoints(row.vehicle_route?._id);
    setShowEditForm(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPickupChange = (e) => {
    const point = editPickupPoints.find(p => p.location === e.target.value);
    if (point) {
      setUpdatedData(prev => ({
        ...prev,
        pickUpPoint: { location: point.location, amount: point.amount }
      }));
    }
  };

  const validateEditForm = () => {
    let newErrors = {};
    if (!updatedData.vehicle_route) newErrors.vehicle_route = "Please select a vehicle route.";
    if (!updatedData.pickUpPoint?.location) newErrors.pickUpPoint = "Please select a pick-up point.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) {
      toast.warning("Please fill required fields.");
      return;
    }
    try {
      await updateStudentVehicleById(editRowId, {
        vehicle_route: updatedData.vehicle_route,
        pickUpPoint: updatedData.pickUpPoint
      });
      toast.success("Transport assignment updated successfully!");
      fetchStudentVehicles();
      setShowEditForm(false);
      setEditRowId(null);
    } catch (err) {
      console.error("Error updating student vehicle relation:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update relation");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteStudentVehicleById(id);
        toast.success("Transport assignment deleted successfully!");
        fetchStudentVehicles();
      } catch (err) {
        console.error("Error deleting student vehicle relation:", err);
        toast.error(err.response?.data?.message || "Failed to delete relation");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Student Name", "Route", "Pickup Point", "Amount"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.student ? `${row.student.first_name} ${row.student.last_name}` : 'N/A',
      row.vehicle_route ? `${row.vehicle_route.Route_name} (${row.vehicle_route.Vehicle_No})` : 'N/A',
      row.pickUpPoint?.location || 'N/A',
      row.pickUpPoint?.amount !== undefined ? `${row.pickUpPoint.amount}` : 'N/A'
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Student Name", "Route", "Pickup Point", "Amount"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.student ? `${row.student.first_name} ${row.student.last_name}` : 'N/A'}\t` +
      `${row.vehicle_route ? `${row.vehicle_route.Route_name} (${row.vehicle_route.Vehicle_No})` : 'N/A'}\t` +
      `${row.pickUpPoint?.location || 'N/A'}\t` +
      `${row.pickUpPoint?.amount !== undefined ? `₹${row.pickUpPoint.amount}` : 'N/A'}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchDropdownData();
    fetchStudentVehicles();
  }, [selectedSessionId]);

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
          {hasSubmitAccess && (
            <Button onClick={() => setShowAddForm(true)} className="btn-add">
              <CgAddR /> New Transport Assignment
            </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Student Transport Assignment</h2>
                <button className='closeForm' onClick={() => setShowAddForm(false)}> X </button>
              </div>
              <Form onSubmit={handleSubmit} className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="6">
                    <FormLabel>Student<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="student"
                      value={formData.student}
                      onChange={handleChange}
                      isInvalid={!!formErrors.student}
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.first_name} {student.last_name} ({student?.class_name?.class_name})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup as={Col} lg="6">
                    <FormLabel>Route<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="vehicle_route"
                      value={formData.vehicle_route}
                      onChange={handleChange}
                      isInvalid={!!formErrors.vehicle_route}
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
                  <FormGroup as={Col} lg="12">
                    <FormLabel>Pickup Point<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="pickupPointSelect"
                      value={formData.pickUpPoint.location}
                      onChange={handlePickupChange}
                      isInvalid={!!formErrors.pickUpPoint}
                    >
                      <option value="">Select Pickup Point</option>
                      {pickupPoints.map((point, index) => (
                        <option key={index} value={point.location}>
                          {point.location} - ₹{point.amount}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Row>

                <Button type="submit" variant='success'>
                  Submit
                </Button>
              </Form>
            </div>
          )}

          {showEditForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Transport Assignment</h2>
                <button className='closeForm' onClick={() => setShowEditForm(false)}> X </button>
              </div>
              <Form onSubmit={handleUpdate} className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="6">
                    <FormLabel>Student</FormLabel>
                    <FormSelect
                      name="student"
                      value={updatedData.student || ''}
                      onChange={handleEditChange}
                      disabled
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.first_name} {student.last_name} ({student?.class_name?.class_name})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup as={Col} lg="6">
                    <FormLabel>Route<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="vehicle_route"
                      value={updatedData.vehicle_route || ''}
                      onChange={(e) => {
                        handleEditChange(e);
                        fetchEditPickupPoints(e.target.value);
                      }}
                      isInvalid={!!formErrors.vehicle_route}
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
                  <FormGroup as={Col} lg="12">
                    <FormLabel>Pickup Point<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="pickupPointSelect"
                      value={updatedData.pickUpPoint?.location || ''}
                      onChange={handleEditPickupChange}
                      isInvalid={!!formErrors.pickUpPoint}
                    >
                      <option value="">Select Pickup Point</option>
                      {editPickupPoints.map((point, index) => (
                        <option key={index} value={point.location}>
                          {point.location} - ₹{point.amount}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Row>

                <div className="d-flex gap-2">
                  <Button type="submit" variant='success'>
                    Update
                  </Button>
                  <Button 
                    type="button"  variant='danger'
                    onClick={() => setShowEditForm(false)}
                  >
                  Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Student Transport Assignments</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : data.length > 0 ? (
                  <Table
                    columns={columns}
                    data={data}
                    handleCopy={handleCopy}
                    handlePrint={handlePrint}
                  />
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