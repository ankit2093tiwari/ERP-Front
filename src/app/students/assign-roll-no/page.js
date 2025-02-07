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
  const [showButtons, setShowButtons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      console.log('testingfff', response.data.data)
      setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
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
      const studentData = response.data.data || [];

      // Ensure roll numbers exist (if not already set)
      const updatedStudents = studentData.map((student, index) => ({
        ...student,
        roll_no: student.roll_no || null, // Initialize rollNo if missing
      }));

      setStudents(updatedStudents);
      setShowButtons(updatedStudents.length > 0);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    fetchSections(classId);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleEditRollNo = () => {
    setIsEditing(true);
  };

  const handleRollNoChange = (index, newRollNo) => {
    const updatedStudents = [...students];
    updatedStudents[index].roll_no = newRollNo;
    setStudents(updatedStudents);
  };

  const handleAutoFillRollNo = () => {
    if (students.length === 0) {
      alert("No students found to assign roll numbers.");
      return;
    }

    // Assign sequential roll numbers (starting from 1)
    const updatedStudents = students.map((student, index) => ({
      ...student,
      roll_no: index + 1, // Roll No starts from 1
    }));

    setStudents([...updatedStudents]); // Ensure state updates correctly
  };

  const handleSaveRollNo = () => {
    alert("Roll numbers saved successfully!");
    setIsEditing(false);
  };

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">Student</Breadcrumb.Item>
            <Breadcrumb.Item active>Assign Roll No</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Search Students</h2>
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
              {showButtons && !isEditing && (
                <Button className="btn btn-warning mt-3 ms-2" onClick={handleEditRollNo}>
                  Edit RollNo
                </Button>
              )}
              {isEditing && (
                <>
                  <Button className="btn btn-secondary mt-3 ms-2" onClick={handleAutoFillRollNo}>
                    AutoFill RollNo
                  </Button>
                  <Button className="btn btn-success mt-3 ms-2" onClick={handleSaveRollNo}>
                    Save RollNo
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Form>
      </div>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Students Records</h2>
            {students.length > 0 ? (
              <Table
                columns={[
                  { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(), sortable: true },
                  { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },
                  { name: "Gender", selector: (row) => row.gender || "N/A", sortable: true },
                  {
                    name: "Roll No",
                    cell: (row, index) =>
                      isEditing ? (
                        <input
                          type="number"
                          value={row.roll_no || ""}
                          onChange={(e) => handleRollNoChange(index, parseInt(e.target.value, 10) || 0)}
                          style={{ width: "60px" }}
                        />
                      ) : (
                        row.roll_no || "N/A"
                      ),
                    sortable: true,
                  },
                ]}
                data={students}
              />
            ) : (
              <p className="text-center">No students found for the selected class and section.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignRollNo;
