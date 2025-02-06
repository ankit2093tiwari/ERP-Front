"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";

const StudentBulkUpdate = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [updatedStudents, setUpdatedStudents] = useState([]);
  const [showUpdateButton, setShowUpdateButton] = useState(false);

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
      console.log('testttttnnn', response)
      setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
      console.log('testttttnnn', response.data)
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

      setStudents(response.data.data || []);
      setUpdatedStudents(response.data.data || []);
      setShowUpdateButton(true);
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

  const handleFieldChange = (index, field, value) => {
    const updatedList = [...updatedStudents];
    updatedList[index][field] = value;
    setUpdatedStudents(updatedList);
  };

  const handleUpdateStudents = async () => {
    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/students/bulkUpdate", { students: updatedStudents });
      if (response.data.success) {
        alert("Students updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update students", error);
      alert("Error updating students.");
    }
  };

  const columns = [
    { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },
    {
      name: "First Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.first_name || ""}
          onChange={(e) => handleFieldChange(index, "first_name", e.target.value)}
        />
      ),
    },
    {
      name: "Middle Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.middle_name || ""}
          onChange={(e) => handleFieldChange(index, "middle_name", e.target.value)}
        />
      ),
    },
    {
      name: "Last Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.last_name || ""}
          onChange={(e) => handleFieldChange(index, "last_name", e.target.value)}
        />
      ),
    },
    {
      name: "Father Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.father_name || ""}
          onChange={(e) => handleFieldChange(index, "father_name", e.target.value)}
        />
      ),
    },
    {
      name: "Mother Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.mother_name || ""}
          onChange={(e) => handleFieldChange(index, "mother_name", e.target.value)}
        />
      ),
    },
    {
      name: "Mobile No",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.phone_no || ""}
          onChange={(e) => handleFieldChange(index, "phone_no", e.target.value)}
        />
      ),
    },
    {
      name: "Gender",
      cell: (row, index) => (
        <select value={updatedStudents[index]?.gender || ""} onChange={(e) => handleFieldChange(index, "gender", e.target.value)}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      ),
    },
    {
      name: "Roll No",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.rollNo || ""}
          onChange={(e) => handleFieldChange(index, "rollNo", e.target.value)}
        />
      ),
    },
  ];

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">Student</Breadcrumb.Item>
            <Breadcrumb.Item active>Student Bulk Update</Breadcrumb.Item>
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
                {Array.isArray(sectionList) && sectionList.map((sec) => (
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
              {showUpdateButton && (
                <Button className="btn btn-success mt-3" onClick={handleUpdateStudents}>
                  Update Students
                </Button>
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
              <Table columns={columns} data={students} />
            ) : (
              <p className="text-center">No students found for the selected class and section.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentBulkUpdate;
