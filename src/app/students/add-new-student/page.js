'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable"; 
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, Button, Breadcrumb, FormLabel } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";

const StudentMasterPage = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 
  const [showAddForm, setShowAddForm] = useState(false); 
  const [student, setStudent] = useState({
    first_name: "",
    last_name: "",
    father_name: "",
    mother_name: "",
    father_mobile_no: "",
    phone_no: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    aadhar_card_no: "",
    last_school_attended: "",
    residence_address: { country: "" },
    copy_address: { country: "" },
  });

  const [studentError, setStudentError] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const TOKEN = "6DJdQZJIv6WpChtccQOceQui2qYoKDWWJik2qTX3";
  axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "50px" },
    { name: "First Name", selector: (row) => row.first_name || "N/A", sortable: true },
    { name: "Last Name", selector: (row) => row.last_name || "N/A", sortable: true },
    { name: "Father's Name", selector: (row) => row.father_name || "N/A", sortable: true },
    { name: "Gender", selector: (row) => row.gender || "N/A", sortable: true },
    { name: "Phone No", selector: (row) => row.phone_no || "N/A", sortable: true },
    {
      name: "Residence Country",
      selector: (row) => row.residence_address?.country || "N/A",
      sortable: true,
    },
    {
      name: "Copy Address Country",
      selector: (row) => row.copy_address?.country || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students`);
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err.response || err.message);
      setError("Failed to fetch data. Please check the API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
    setStudentError((prev) => ({ ...prev, [`${name}_error`]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(student).forEach(([key, value]) => {
      if (!value || (typeof value === "object" && !Object.values(value).some(Boolean))) {
        errors[`${key}_error`] = `${key.replace(/_/g, " ")} is required`;
      }
    });
    setStudentError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const endpoint = student._id
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${student._id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/students`;
    const method = student._id ? "put" : "post";

    try {
      const response = await axios[method](endpoint, student);
      setData((prev) =>
        student._id
          ? prev.map((row) => (row._id === student._id ? { ...row, ...student } : row))
          : [...prev, response.data]
      );
      setShowAddForm(false);
      resetStudentForm();
      onClose();
    } catch (err) {
      console.error("Error submitting data:", err.response || err.message);
      setError("Failed to submit data. Please check the API endpoint.");
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${id}`);
      setStudent(response?.data || {});
      setShowAddForm(true);
      onOpen();
    } catch (err) {
      console.error("Error fetching student by ID:", err.response || err.message);
      setError("Failed to fetch student details. Please check the API endpoint.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${id}`);
        setData((prev) => prev.filter((row) => row._id !== id));
      } catch (err) {
        console.error("Error deleting data:", err.response || err.message);
        setError("Failed to delete data. Please check the API endpoint.");
      }
    }
  };

  const resetStudentForm = () => {
    setStudent({
      first_name: "",
      last_name: "",
      father_name: "",
      mother_name: "",
      father_mobile_no: "",
      phone_no: "",
      date_of_birth: "",
      gender: "",
      religion: "",
      aadhar_card_no: "",
      last_school_attended: "",
      residence_address: { country: "" },
      copy_address: { country: "" },
    });
  };

  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">
              Student
            </Breadcrumb.Item>
            <Breadcrumb.Item active> Add New Student </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      {/* <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
      <CgAddR /> {showAddForm ? "Hide Form" : "Add Student"}
      </Button> */}
      <button onClick={onOpen} id="submit" type='button' className='btn btn-primary'>
      <CgAddR /> Add Student</button>
      {isPopoverOpen && (
      <div className="cover-sheet">
        <div className="studentHeading"><h2>Add New Student</h2>
        <button className='closeForm' onClick={onClose}> X </button>
        </div>
        <Form className="formSheet">
          <Row className="mb-3">
            <Form.Group as={Col} lg="3" controlId="first_name">
              <FormLabel className="labelForm">First Name</FormLabel>
              <Form.Control
                type="text"
                value={student?.first_name}
                name="first_name"
                onChange={handleChange}
                />
                {studentError.first_name_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="last_name">
              <FormLabel className="labelForm">Last Name</FormLabel>
              <Form.Control
                type="text"
                value={student.last_name}
                name="last_name"
                  onChange={handleChange}
                />
                {studentError.last_name_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="father_name">
              <FormLabel className="labelForm">Father&apos;s Name</FormLabel>
              <Form.Control
                type="text"
                value={student?.father_name}
                name="father_name"
                onChange={handleChange}
              />
              {studentError.father_name_error}
              
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="mother_name">
              <FormLabel className="labelForm">Mother&apos;s Name</FormLabel>
              <Form.Control
                type="text"
                value={student.mother_name}
                name="mother_name"
                onChange={handleChange}
                />
                {studentError.mother_name_error}
            </Form.Group>
            </Row>
            <Row className="mb-3">
            <Form.Group as={Col} lg="3" controlId="father_mobile_no">
              <FormLabel className="labelForm">Father&apos;s Mobile No</FormLabel>
              <Form.Control
                type="text"
                value={student.father_mobile_no}
                name="father_mobile_no"
                onChange={handleChange}
                />
                {studentError.father_mobile_no_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="phone_no">
              <FormLabel className="labelForm">Phone No</FormLabel>
              <Form.Control
                type="text"
                value={student.phone_no}
                name="phone_no"
                onChange={handleChange}
                />
                {studentError.phone_no_error}
              
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="date_of_birth">
              <FormLabel className="labelForm">Date of Birth</FormLabel>
              <Form.Control
                type="date"
                value={student.date_of_birth}
                name="date_of_birth"
                onChange={handleChange}
                />
                {studentError.date_of_birth_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="gender">
              <FormLabel className="labelForm">Gender</FormLabel>
              <Form.Control
                as="select"
                value={student.gender}
                onChange={(e) =>
                  setStudent({ ...student, gender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Control>
            </Form.Group>
            </Row>
            <Row className="mb-3">
            <Form.Group as={Col} lg="3" controlId="religion">
              <FormLabel className="labelForm">Religion</FormLabel>
              <Form.Control
                type="text"
                value={student.religion}
                name="religion"
                onChange={handleChange}
                />
                {studentError.religion_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="aadhar_card_no">
              <FormLabel className="labelForm">Aadhar Card No</FormLabel>
              <Form.Control
                type="text"
                value={student.aadhar_card_no}
                name="aadhar_card_no"
                onChange={handleChange}
                />
                {studentError.aadhar_card_no_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="last_school_attended">
              <FormLabel className="labelForm">Last School Attended</FormLabel>
              <Form.Control
                type="text"
                value={student.last_school_attended}
                name="last_school_attended"
                onChange={handleChange}
                />
                {studentError.last_school_attended_error}
            </Form.Group>
            <Form.Group as={Col} lg="3" controlId="residence_country">
              <FormLabel className="labelForm">Residence Country</FormLabel>
              <Form.Control
                type="text"
                value={student.residence_address.country}
                onChange={(e) =>
                  setStudent({
                    ...student,
                    residence_address: { country: e.target.value },
                  })
                }
              />
            </Form.Group>
            </Row>

                <Row className="mb-3">

            <Form.Group as={Col} lg="3" controlId="copy_address_country">
              <FormLabel className="labelForm">Copy Address Country</FormLabel>
              <Form.Control
                type="text"
                value={student.copy_address.country}
                onChange={(e) =>
                  setStudent({
                    ...student,
                    copy_address: { country: e.target.value },
                  })
                }
              />
            </Form.Group>
            </Row>

            <Button onClick={handleSubmit}>
              {student._id ? "Update" : "Add"} Student
            </Button>
            </Form>
          </div>
        )}
        <Row>
          <Col>
            <div className="tableSheet">
            <h2>Student Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
            </div>
          </Col>
        </Row>
    
    </Container>
  );
};

export default StudentMasterPage;