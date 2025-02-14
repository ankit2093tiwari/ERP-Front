"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect, Table } from "react-bootstrap";

const SubjectMaster = () => {
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [data, setData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [compulsory, setCompulsory] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "ClassName",
      selector: (row) => row.class_name || "N/A",
      sortable: true,
    },
    {
      name: "SectionName",
      selector: (row) => row.section_name || "N/A",
      sortable: true,
    },
    {
      name: "Subject & Teacher",
      selector: (row) => row.section_name || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEditSubject(subject)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDeleteSubject(subject._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchClasses();
    fetchEmployees();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-employee");
      setEmployeeList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-subject");
      setSubjectList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    }
  };

  const handleAddOrUpdateSubject = async () => {
    if (!selectedClass || !subjectName || !selectedEmployee) {
      alert("Please fill all required fields");
      return;
    }

    const subjectData = {
      class_name: selectedClass,
      section_name: selectedSection || null, // Handle optional section
      subject_name: subjectName,
      compulsory,
      employee: selectedEmployee,
    };

    try {
      if (editingSubjectId) {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-subject/${editingSubjectId}`, subjectData);
      } else {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/create-subject", subjectData);
      }
      fetchSubjects();
      resetForm();
    } catch (error) {
      console.error("Error adding/updating subject", error);
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubjectId(subject._id);
    setSelectedClass(subject.class_name?._id || "");
    setSelectedSection(subject.section_name?._id || "");
    setSubjectName(subject.subject_details.subject_name);
    setCompulsory(subject.subject_details.compulsory);
    setSelectedEmployee(subject.subject_details.employee?._id || "");
    fetchSections(subject.class_name?._id);
  };

  const handleDeleteSubject = async (id) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-subject/${id}`);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject", error);
    }
  };

  const resetForm = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSubjectName("");
    setCompulsory(false);
    setSelectedEmployee("");
    setEditingSubjectId(null);
  };

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
            <Breadcrumb.Item active>Subject Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Add New Subject</h2>
          {/* <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button> */}
        </div>

        <Form className="formSheet">
          <Row className="mb-3">
            <Col>
              <FormLabel>Select Class</FormLabel>
              <FormSelect
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  fetchSections(e.target.value);
                }}
              >
                <option value="">Select Class</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.class_name}
                  </option>
                ))}
              </FormSelect>
            </Col>
            <Col>
              <FormLabel>Select Section (Optional)</FormLabel>
              <FormSelect
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select Section</option>
                {sectionList.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    {sec.section_name}
                  </option>
                ))}
              </FormSelect>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <FormLabel>Enter Subject Name</FormLabel>
              <Form.Control
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </Col>
            <Col>
              <FormLabel>Select Teacher</FormLabel>
              <FormSelect
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employeeList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employee_name}
                  </option>
                ))}
              </FormSelect>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Form.Check
                type="checkbox"
                label="Compulsory Subject"
                checked={compulsory}
                onChange={(e) => setCompulsory(e.target.checked)}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Button onClick={handleAddOrUpdateSubject}>
                {editingSubjectId ? "Update Subject" : "Add Subject"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="tableSheet">
        <h2>Subject Master</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Section Name</th>
              <th>Subject & Teacher</th>
              <th>Compulsory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjectList.length > 0 ? (
              subjectList.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.class_name?.class_name}</td>
                  <td>{subject.section_name?.section_name || "N/A"}</td>
                  <td>
                    {subject.subject_details.subject_name} -{" "}
                    {subject.subject_details.employee?.employee_name}
                  </td>
                  <td>{subject.subject_details.compulsory ? "Yes" : "No"}</td>
                  <td>
                    <button className="editButton" onClick={() => handleEditSubject(subject)}>
                      <FaEdit />
                    </button>
                    <button className="editButton btn-danger" onClick={() => handleDeleteSubject(subject._id)}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      {/* <Row>
        <Col>
          <div className="tableSheet">
            <h2>Subject Master</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table columns={columns} data={data} />
            )}
          </div>
        </Col>
      </Row> */}
    </Container>
  );
};

export default SubjectMaster;
