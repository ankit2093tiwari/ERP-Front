"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import styles from "@/app/students/assign-roll-no/page.module.css";

const PromoteStudentPage = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
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
      setSectionList(response.data.sections || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section");
      return;
    }
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    fetchSections(classId);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(students.map((student) => student.registrationId));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (registrationId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(registrationId)
        ? prevSelected.filter((id) => id !== registrationId)
        : [...prevSelected, registrationId]
    );
  };

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={students.length > 0 && selectedStudents.length === students.length}
        />
      ),
      selector: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.registrationId)}
          onChange={() => handleStudentSelect(row.registrationId)}
        />
      ),
      width: "80px",
    },
    { name: "Student Name", selector: (row) => `${row.firstName} ${row.middleName || ""} ${row.lastName}`, sortable: true },
    { name: "Father Name", selector: (row) => row.fatherName, sortable: true },
    { name: "Registration ID", selector: (row) => row.registrationId, sortable: true },
    { name: "Roll No", selector: (row) => row.rollNo, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
  ];

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">Student</Breadcrumb.Item>
            <Breadcrumb.Item active>Promote Students</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Promote Students</h2>
        </div>
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
              <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
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
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Students Records</h2>
            <Table columns={columns} data={students} />
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

export default dynamic(() => Promise.resolve(PromoteStudentPage), { ssr: false });
