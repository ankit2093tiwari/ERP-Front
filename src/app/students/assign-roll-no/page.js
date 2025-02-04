"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";

const AssignRollNo = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  // Fetch sections for the selected class
  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(response.data.sections || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  // Fetch students based on class and section selection
  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section");
      return;
    }
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );

      console.log("API Response:", response.data); // Debugging response

      // Ensure we are correctly handling the API response
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  // Handle class selection
  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    setSelectedSection(""); // Reset section when class changes
    fetchSections(classId);
  };

  // Handle section selection
  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  // Handle select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(students.map((student) => student.registration_id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle individual student selection
  const handleStudentSelect = (registration_id) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(registration_id)
        ? prevSelected.filter((id) => id !== registration_id)
        : [...prevSelected, registration_id]
    );
  };

  // Table columns
  const columns = [
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.registration_id)}
          onChange={() => handleStudentSelect(row.registration_id)}
        />
      ),
    },
    {
      name: "Student Name",
      selector: (row) =>
        `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`.trim(),
      sortable: true,
    },
    // {
    //   name: "Father Name",
    //   selector: (row) => (row.father_name ? String(row.father_name) : "N/A"),
    //   sortable: true,
    // },
    {
      name: "Adm No",
      selector: (row) => (row.registration_id ? String(row.registration_id) : "N/A"),
      sortable: true,
    },
    {
      name: "Gender",
      selector: (row) => (row.gender ? String(row.gender) : "N/A"),
      sortable: true,
    },
    {
      name: "Roll No",
      selector: (row) => (row.rollNo ? String(row.rollNo) : "N/A"),
      sortable: true,
    },
  ];

  return (
    <Container>
      {/* Breadcrumb Navigation */}
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">Student</Breadcrumb.Item>
            <Breadcrumb.Item active>Assign Roll No</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Page Heading */}
      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Search Students</h2>
        </div>

        {/* Class and Section Selection Form */}
        <Form className="formSheet">
          <Row>
            <Col>
              <FormLabel className="labelForm">Select Class</FormLabel>
              <FormSelect value={selectedClass} onChange={handleClassChange}>
                <option value="">Select Class</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.class_name}
                  </option>
                ))}
              </FormSelect>
            </Col>
            <Col>
              <FormLabel className="labelForm">Select Section</FormLabel>
              <FormSelect value={selectedSection} onChange={handleSectionChange}>
                <option value="">Select Section</option>
                {sectionList.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    {sec.section_name}
                  </option>
                ))}
              </FormSelect>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <Button className="btn btn-primary" onClick={fetchStudents}>
                Search Students
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Students Data Table */}
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Roll No Assigner</h2>
            {students.length > 0 ? (
              <Table columns={columns} data={students} />
            ) : (
              <p className="text-center">No students found for the selected class and section.</p>
            )}
            <div className={styles.buttons}>
              <button type="button" className="editButton">
                Previous
              </button>
              <button type="button" className="editButton">
                Next
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignRollNo;
