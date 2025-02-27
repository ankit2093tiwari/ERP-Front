"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import DataTable from "@/app/component/DataTable"; // Adjust the import path as needed
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
  const [noRecordsFound, setNoRecordsFound] = useState(false); // New state for no records

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
    setNoRecordsFound(false); // Reset no records flag
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      if (response.data.data && response.data.data.length > 0) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
        setNoRecordsFound(true); // Set no records flag if no data is found
      }
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
      setNoRecordsFound(true); // Set no records flag on error
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

  const handlePrint = async () => {
    if (typeof window !== "undefined") {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.text("Student ID Cards Report", 14, 10);

      const tableHeaders = [["#", "Class", "Section", "Roll No", "Student Name", "Father Name", "Mobile No"]];
      const tableRows = students.map((row, index) => [
        index + 1,
        row.class_name?.class_name || "N/A",
        row.section_name?.section_name || "N/A",
        row.roll_no || "N/A",
        `${row.first_name} ${row.last_name}`,
        row.father_name || "N/A",
        row.phone_no || "N/A",
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Class", "Section", "Roll No", "Student Name", "Father Name", "Mobile No"].join("\t");
    const rows = students
      .map((row, index) =>
        [
          index + 1,
          row.class_name?.class_name || "N/A",
          row.section_name?.section_name || "N/A",
          row.roll_no || "N/A",
          `${row.first_name} ${row.last_name}`,
          row.father_name || "N/A",
          row.phone_no || "N/A",
        ].join("\t")
      )
      .join("\n");

    const fullData = `${headers}\n${rows}`;

    navigator.clipboard
      .writeText(fullData)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px",
    },
    {
      name: "Class",
      selector: (row) => row.class_name?.class_name || "N/A",
      sortable: true,
    },
    {
      name: "Section",
      selector: (row) => row.section_name?.section_name || "N/A",
      sortable: true,
    },
    {
      name: "Roll No",
      selector: (row) => row.roll_no || "N/A",
      sortable: true,
    },
    {
      name: "Student Name",
      selector: (row) => `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      name: "Father Name",
      selector: (row) => row.father_name || "N/A",
      sortable: true,
    },
    {
      name: "Mobile No",
      selector: (row) => row.phone_no || "N/A",
      sortable: true,
    },
  ];

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
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel>Select Class</FormLabel>
              <FormSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                ))}
              </FormSelect>
            </Col>
            <Col lg={6}>
              <FormLabel>Select Section</FormLabel>
              <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                <option value="">Select Section</option>
                {sectionList.map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                ))}
              </FormSelect>
            </Col>
            <Row>
              <Col className="d-flex align-items-end mt-4">
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
            {loading ? (
              <p>Loading...</p>
            ) : noRecordsFound ? (
              <Alert variant="info">There is no record to display.</Alert>
            ) : (
              <DataTable
                columns={columns}
                data={students}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default GenerateIdCard;