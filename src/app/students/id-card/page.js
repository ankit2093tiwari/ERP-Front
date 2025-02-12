"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import styles from "@/app/students/assign-roll-no/page.module.css";

const GenerateIdCard = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    }
  }, [selectedClass]);

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

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select both Class and Section.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      setStudents(response.data.data || []);
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
    setLoading(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedStudents(selectAll ? [] : students.map(student => student._id)); // Store only IDs
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };
  const generatePDF = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
  
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text("Generated ID Cards", 10, 10);
  
    const cardWidth = 62;  // Width of each ID card
    const cardHeight = 70; // Height of each ID card
    const marginX = 10;    // Left margin
    const marginY = 20;    // Top margin
    const gapX = 3;       // Horizontal gap between ID cards
    const gapY = 3;       // Vertical gap between rows
    const cardsPerRow = 3; // Number of ID cards per row
  
    let xPosition = marginX;
    let yPosition = marginY;
  
    selectedStudents.forEach((studentId, index) => {
      const student = students.find(s => s._id === studentId);
      if (!student) return;
  
      // Draw the ID card box
      pdf.rect(xPosition, yPosition, cardWidth, cardHeight);
  
      // Add student details inside the box
      pdf.setFontSize(10);
      pdf.text(`Class: ${student.class_name?.class_name || "N/A"}`, xPosition + 5, yPosition + 10);
      pdf.text(`Section: ${student.section_name?.section_name || "N/A"}`, xPosition + 5, yPosition + 20);
      pdf.text(`Name: ${student.first_name} ${student.last_name}`, xPosition + 5, yPosition + 30);
      pdf.text(`Roll No: ${student.roll_no || "N/A"}`, xPosition + 5, yPosition + 40);
      pdf.text(`Father Name: ${student.father_name || "N/A"}`, xPosition + 5, yPosition + 50);
      pdf.text(`Mobile No: ${student.phone_no || "N/A"}`, xPosition + 5, yPosition + 60);
  
      // Move to next position
      xPosition += cardWidth + gapX;
  
      // If three ID cards are printed in a row, reset X position and move to the next row
      if ((index + 1) % cardsPerRow === 0) {
        xPosition = marginX;
        yPosition += cardHeight + gapY;
      }
  
      // If Y position exceeds page height, create a new page
      if (yPosition + cardHeight > 280) {
        pdf.addPage();
        yPosition = marginY;
        xPosition = marginX;
      }
    });
  
    pdf.save("Student_ID_Cards.pdf");
  };
  

  // const generatePDF = () => {
  //   if (selectedStudents.length === 0) {
  //     alert("Please select at least one student.");
  //     return;
  //   }

  //   const pdf = new jsPDF();
  //   pdf.setFontSize(12);
  //   pdf.text("Generated ID Cards", 10, 10);

  //   let yPosition = 20;
  //   selectedStudents.forEach((studentId) => {
  //     const student = students.find(s => s._id === studentId);
  //     if (!student) return;

  //     pdf.rect(10, yPosition, 180, 50);
  //     pdf.text(`Class: ${student.class_name?.class_name || "N/A"}`, 15, yPosition + 10);
  //     pdf.text(`Section: ${student.section_name?.section_name || "N/A"}`, 15, yPosition + 20);
  //     pdf.text(`Name: ${student.first_name} ${student.last_name}`, 15, yPosition + 30);
  //     pdf.text(`Roll No: ${student.roll_no || "N/A"}`, 15, yPosition + 40);
  //     pdf.text(`Father Name: ${student.father_name || "N/A"}`, 15, yPosition + 50);
  //     pdf.text(`Mobile No: ${student.phone_no || "N/A"}`, 15, yPosition + 60);
  //     yPosition += 70;
  //     if (yPosition > 250) {
  //       pdf.addPage();
  //       yPosition = 20;
  //     }
  //   });
  //   pdf.save("Student_ID_Cards.pdf");
  // };

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">Student</Breadcrumb.Item>
            <Breadcrumb.Item active>Generate ID Card</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <div className="cover-sheet">
        <div className="studentHeading">
          <h2>Search Students Class Wise</h2>
        </div>
        <Form className="formSheet">
          <Row>
            <Col>
              <FormLabel>Select Class</FormLabel>
              <FormSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                ))}
              </FormSelect>
            </Col>
            <Col>
              <FormLabel>Select Section</FormLabel>
              <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">Select Section</option>
                {sectionList.map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                ))}
              </FormSelect>
            </Col>
            <Row>
              <Col className="d-flex align-items-end">
                <Button variant="primary" onClick={fetchStudents}>Search Students</Button>
              </Col>
            </Row>
            <Row>
              <Col className="d-flex align-items-center">
                <Form.Check type="checkbox" checked={selectAll} onChange={handleSelectAll} /><span>Select All Students</span>
                <Button variant="primary" onClick={generatePDF}>Generate ID Card</Button>
              </Col>
            </Row>
          </Row>
        </Form>
      </div>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Students Details</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Father Name</th>
                  <th>Mobile No</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentSelect(student._id)}
                      />
                    </td>
                    <td>{student.class_name?.class_name || "N/A"}</td>
                    <td>{student.section_name?.section_name || "N/A"}</td>
                    <td>{student.roll_no || "N/A"}</td>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{student.father_name || "N/A"}</td>
                    <td>{student.phone_no || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default GenerateIdCard;
