"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const PromoteStudentPage = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promotedClass, setPromotedClass] = useState("");
  const [promotedSection, setPromotedSection] = useState("");

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

  // const fetchSections = async (classId) => {
  //   try {
  //     const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
  //     setSectionList(response.data.sections || []);
  //   } catch (error) {
  //     console.error("Failed to fetch sections", error);
  //   }
  // };
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
      setSelectedStudents([]);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const handlePromote = async () => {
    if (!promotedClass || !promotedSection || selectedStudents.length === 0) {
      alert("Please select students, promoted class, and promoted section");
      return;
    }
    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/students/promote", {
        student_ids: selectedStudents,
        new_class_id: promotedClass,
        new_section_id: promotedSection,
      });
      alert("Students promoted successfully");
      setStudents([]);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Failed to promote students", error);
      alert("Failed to promote students");
    }
  };

  const columns = [
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row._id)}
          onChange={() =>
            setSelectedStudents((prevSelected) =>
              prevSelected.includes(row._id)
                ? prevSelected.filter((id) => id !== row._id)
                : [...prevSelected, row._id]
            )
          }
        />
      ),
    },
    { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(), sortable: true },
    { name: "Father Name", selector: (row) => row.father_name || "N/A", sortable: true },
    { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },
    { name: "Gender", selector: (row) => row.gender || "N/A", sortable: true },
    { name: "Roll No", selector: (row) => row.roll_no || "N/A", sortable: true },
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

      <div className="cover-sheet2">
        <h2>Promote Students</h2>
        <Form>
          <Row>
            <Col>
              <FormLabel>Select Class</FormLabel>
              <FormSelect value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); fetchSections(e.target.value); }}>
                <option value="">Select Class</option>
                {classList.map((cls) => <option key={cls._id} value={cls._id}>{cls.class_name}</option>)}
              </FormSelect>
            </Col>
            <Col>
              <FormLabel>Select Section</FormLabel>
              <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">Select Section</option>
                {sectionList.map((sec) => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
              </FormSelect>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <Button onClick={fetchStudents}>Search Students</Button>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <FormLabel>Select Promoted Class</FormLabel>
              <FormSelect value={promotedClass} onChange={(e) => { setPromotedClass(e.target.value); fetchSections(e.target.value); }}>
                <option value="">Select Class</option>
                {classList.map((cls) => <option key={cls._id} value={cls._id}>{cls.class_name}</option>)}
              </FormSelect>
            </Col>
            <Col>
              <FormLabel>Select Promoted Section</FormLabel>
              <FormSelect value={promotedSection} onChange={(e) => setPromotedSection(e.target.value)}>
                <option value="">Select Section</option>
                {sectionList.map((sec) => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
              </FormSelect>
            </Col>
            <Row>
              <Col>
                {/* <Button onClick={fetchStudents}>Search Students</Button> */}
                <Button onClick={handlePromote} disabled={!selectedStudents.length || !promotedClass || !promotedSection}>Promote Students</Button>
              </Col>
            </Row>
          </Row>
        </Form>
      </div>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Students Records</h2>
            {students.length > 0 ? <Table columns={columns} data={students} /> : <p className="text-center">No students found.</p>}

          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PromoteStudentPage;
