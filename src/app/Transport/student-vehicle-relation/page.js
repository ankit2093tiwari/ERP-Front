"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from '@/app/utils';
import { toast } from 'react-toastify';
import { addNewStudentVehicle, deleteStudentVehicleById, getAllPickupPoints, getAllStudents, getAllStudentVehicles, getRoutes, updateStudentVehicleById } from '@/Services';
import useSessionId from '@/hooks/useSessionId';
import usePagePermission from '@/hooks/usePagePermission';

const StudentVehicle = () => {
  const {hasEditAccess,hasSubmitAccess}=usePagePermission()
  const selectedSessionId = useSessionId();

  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
      name: 'Amount',
      selector: row => {
        if (row.Amount) return `₹${row.Amount}`;
        if (row.pickUpPoint?.Amount) return `₹${row.pickUpPoint.Amount}`;
        if (row.vehicle_route?.Amount) return `₹${row.vehicle_route.Amount}`;
        return 'N/A';
      },
      sortable: true,
    },
    hasEditAccess &&{
      name: 'Action',
      cell: row => (
        <div className="d-flex gap-1">
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
        getAllStudents(),
        getRoutes(),
        getAllPickupPoints()
      ]);

      setStudents(studentsRes?.data);
      setRoutes(routesRes?.data);
      setPickupPoints(pickupPointsRes?.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      toast.error("Failed to fetch dropdown data");
    }
  };

  const fetchStudentVehicles = async () => {
    setLoading(true);
    try {
      const response = await getAllStudentVehicles()
      setData(response?.data.reverse()); // Newest entries first
    } catch (err) {
      console.error("Error fetching student vehicles:", err);
      toast.error(err.response?.data?.message || "Failed to fetch student vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleUpdateChange = (e, field) => {
    setUpdatedData({ ...updatedData, [field]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.student) newErrors.student = "Please select a student.";
    if (!formData.vehicle_route) newErrors.vehicle_route = "Please select a vehicle route.";
    if (!formData.pickUpPoint) newErrors.pickUpPoint = "Please select a pick-up point.";

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
      const response = await addNewStudentVehicle({
        student: formData.student,
        vehicle_route: formData.vehicle_route,
        pickUpPoint: formData.pickUpPoint
      })

      toast.success("Transport assignment created successfully!");
      fetchStudentVehicles()
      setShowAddForm(false);
      setFormData({
        student: '',
        vehicle_route: '',
        pickUpPoint: ''
      });
      setFormErrors({}); // Clear errors after successful submit
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
      pickUpPoint: row.pickUpPoint?._id
    });
  };

  const handleUpdate = async (id) => {
    try {
      if (!updatedData.vehicle_route || !updatedData.pickUpPoint) {
        throw new Error("Please fill all required fields");
      }

      await updateStudentVehicleById(id, {
        student: updatedData.student,
        vehicle_route: updatedData.vehicle_route,
        pickUpPoint: updatedData.pickUpPoint
      })

      toast.success("Transport assignment updated successfully!");
      fetchStudentVehicles()
      setEditRowId(null);
    } catch (err) {
      console.error("Error updating student vehicle relation:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update relation");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        await deleteStudentVehicleById(id)
        toast.success("Transport assignment deleted successfully!");
        fetchStudentVehicles()
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
      row.pickUpPoint ? row.pickUpPoint.PickupPoint : 'N/A',
      row.Amount ? `₹${row.Amount}` :
        row.pickUpPoint?.Amount ? `₹${row.pickUpPoint.Amount}` :
          row.vehicle_route?.Amount ? `₹${row.vehicle_route.Amount}` : 'N/A'
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Student Name", "Route", "Pickup Point", "Amount"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.student ? `${row.student.first_name} ${row.student.last_name}` : 'N/A'}\t` +
      `${row.vehicle_route ? `${row.vehicle_route.Route_name} (${row.vehicle_route.Vehicle_No})` : 'N/A'}\t` +
      `${row.pickUpPoint ? row.pickUpPoint.PickupPoint : 'N/A'}\t` +
      `${row.Amount ? `₹${row.Amount}` :
        row.pickUpPoint?.Amount ? `₹${row.pickUpPoint.Amount}` :
          row.vehicle_route?.Amount ? `₹${row.vehicle_route.Amount}` : 'N/A'}`
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
        {hasSubmitAccess &&(
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
                  <FormGroup as={Col} lg="6" controlId="studentSelect">
                    <FormLabel className="labelForm">Student<span className='text-danger'>*</span></FormLabel>
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
                    <Form.Control.Feedback type="invalid">{formErrors.student}</Form.Control.Feedback>
                  </FormGroup>
                  <FormGroup as={Col} lg="6" controlId="routeSelect">
                    <FormLabel className="labelForm">Route<span className='text-danger'>*</span></FormLabel>
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
                    <Form.Control.Feedback type="invalid">{formErrors.vehicle_route}</Form.Control.Feedback>
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="12" controlId="pickupPointSelect">
                    <FormLabel className="labelForm">Pickup Point<span className='text-danger'>*</span></FormLabel>
                    <FormSelect
                      name="pickUpPoint"
                      value={formData.pickUpPoint}
                      onChange={handleChange}
                      isInvalid={!!formErrors.pickUpPoint}
                    >
                      <option value="">Select Pickup Point</option>
                      {pickupPoints.map(point => (
                        <option key={point._id} value={point._id}>
                          {point.PickupPoint}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">{formErrors.pickUpPoint}</Form.Control.Feedback>
                  </FormGroup>
                </Row>
                <Button type="submit" className='btn btn-primary mt-4'>
                  Submit
                </Button>
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