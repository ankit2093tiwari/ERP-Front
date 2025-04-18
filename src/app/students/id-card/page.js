"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import DataTable from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const GenerateIdCard = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);

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
    setNoRecordsFound(false);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      if (response.data.data && response.data.data.length > 0) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
        setNoRecordsFound(true);
      }
      setSelectedStudents([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
      setNoRecordsFound(true);
    }
    setLoading(false);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedStudents(selectAll ? [] : students.map(student => student._id));
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const generateAllSelectedInOnePDF = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
  
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [90, 90] // Standard ID card size
    });
  
    selectedStudents.forEach((studentId, index) => {
      const student = students.find(s => s._id === studentId);
      if (student) {
        if (index !== 0) pdf.addPage();
  
        // School header - centered
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text("R.D.S. MEMORIAL PUBLIC", 42.5, 7, { align: 'center' });
        pdf.text("SCHOOL (English Medium)", 42.5, 12, { align: 'center' });
  
        // Contact
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text("Delhi", 42.5, 17, { align: 'center' });
        pdf.text("9898989898", 42.5, 21, { align: 'center' });
  
        // ID card title
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("IDENTITY CARD", 42.5, 26, { align: 'center' });
  
        // Horizontal line
        pdf.setDrawColor(0, 0, 0);
        pdf.line(10, 28, 75, 28);
  
        // Image box on the left
        pdf.setDrawColor(150, 150, 150); // Light border
        pdf.setFillColor(230, 230, 230); // Light background
        pdf.roundedRect(10, 32, 20, 25, 2, 2, 'FD'); // x, y, width, height, rx, ry
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(6);
        pdf.text("Image not found", 20, 43, { align: 'center' });
        pdf.text("or type unknown", 20, 46, { align: 'center' });
  
        // Student details on the right of image
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
  
        const detailsX = 33; // starting X position (beside image)
        pdf.text(`STUDENT'S NAME: ${student.first_name} ${student.last_name}`, detailsX, 34);
        pdf.text(`FATHER'S NAME: ${student.father_name || "N/A"}`, detailsX, 39);
        pdf.text(`CLASS: ${student.class_name?.class_name || "N/A"}`, detailsX, 44);
        pdf.text(`SECTION: ${student.section_name?.section_name || "N/A"}`, detailsX, 49);
  
        // Principal sign
        pdf.setFontSize(8);
        pdf.text("PRINCIPAL SIGN", 70, 54, { align: 'right' });
  
        // Border around ID
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(5, 5, 75, 50); // added padding from top/bottom
      }
    });
  
    pdf.save(`Student_ID_Cards.pdf`);
  };
  

  // const generateAllSelectedInOnePDF = () => {
  //   if (selectedStudents.length === 0) {
  //     alert("Please select at least one student.");
  //     return;
  //   }
  
  //   const pdf = new jsPDF({
  //     orientation: 'portrait',
  //     unit: 'mm',
  //     format: [85, 85] // Standard ID card size
  //   });
  
  //   selectedStudents.forEach((studentId, index) => {
  //     const student = students.find(s => s._id === studentId);
  //     if (student) {
  //       if (index !== 0) pdf.addPage();
  
  //       // School header - centered and bold
  //       pdf.setFontSize(12);
  //       pdf.setTextColor(0, 0, 0);
  //       pdf.setFont("helvetica", "bold");
  //       pdf.text("R.D.S. MEMORIAL PUBLIC", 42.5, 5, { align: 'center' });
  //       pdf.text("SCHOOL (English Medium)", 42.5, 10, { align: 'center' });
  
  //       // School contact info
  //       pdf.setFontSize(8);
  //       pdf.setFont("helvetica", "normal");
  //       pdf.text("Delhi", 42.5, 15, { align: 'center' });
  //       pdf.text("9898989898", 42.5, 19, { align: 'center' });
  
  //       // ID Card title
  //       pdf.setFontSize(10);
  //       pdf.setFont("helvetica", "bold");
  //       pdf.text("IDENTITY CARD", 42.5, 24, { align: 'center' });
  
  //       // Horizontal divider line
  //       pdf.setDrawColor(0, 0, 0);
  //       pdf.line(10, 26, 75, 26);
  
  //       // Photo placeholder (right-aligned)
  //       pdf.setDrawColor(150, 150, 150); // Light gray border
  //       pdf.setFillColor(230, 230, 230); // Light gray background
  //       pdf.roundedRect(55, 30, 20, 25, 2, 2, 'FD');
  //       pdf.setTextColor(100, 100, 100);
  //       pdf.setFontSize(6);
  //       pdf.text("Image not found", 65, 42, { align: 'center' });
  //       pdf.text("or type unknown", 65, 45, { align: 'center' });
  
  //       // Student details (left-aligned)
  //       pdf.setFontSize(9);
  //       pdf.setTextColor(0, 0, 0);
  //       pdf.setFont("helvetica", "normal");
  //       pdf.text(`STUDENT'S NAME: ${student.first_name} ${student.last_name}`, 10, 32);
  //       pdf.text(`FATHER'S NAME: ${student.father_name || "N/A"}`, 10, 37);
        
  //       // Class/Section details
  //       pdf.text(`CLASS: ${student.class_name?.class_name || "N/A"}`, 10, 42);
  //       pdf.text(`SECTION: ${student.section_name?.section_name || "N/A"}`, 10, 47);
  
  //       // Border around the entire ID card
  //       pdf.setDrawColor(0, 0, 0);
  //       pdf.rect(5, 2, 75, 50);
  //     }
  //   });
  
  //   pdf.save(`Student_ID_Cards.pdf`);
  // };

 
  const generatePDF = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    // Generate individual PDFs for each selected student
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s._id === studentId);
      if (student) {
        generateSinglePDF(student);
      }
    });
  };

  const handlePrint = () => {
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
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class", "Section", "Roll No", "Student Name", "Father Name", "Mobile No"];
    const rows = students.map((row, index) =>
      [
        index + 1,
        row.class_name?.class_name || "N/A",
        row.section_name?.section_name || "N/A",
        row.roll_no || "N/A",
        `${row.first_name} ${row.last_name}`,
        row.father_name || "N/A",
        row.phone_no || "N/A",
      ]
    );
    copyContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px",
    },
    {
      name: "Select",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row._id)}
          onChange={() => handleStudentSelect(row._id)}
        />
      ),
      width: "70px",
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

  const breadcrumbItems = [
    { label: "students", link: "/students/all-module" },
    { label: "id-card", link: "null" }
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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Search Students Class Wise</h2>
            </div>
            <Form className="formSheet">
              <Row className="mb-3">
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                    ))}
                  </FormSelect>
                </Col>
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Section</FormLabel>
                  <FormSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                    ))}
                  </FormSelect>
                </Col>
                <Row>
                  <Col className="d-flex align-items-end mt-4">
                    <Button variant="primary" onClick={fetchStudents}>
                      Search Students
                    </Button>
                  </Col>
                </Row>
              </Row>
            </Form>
          </div>

          {students.length > 0 && (
            <div className="mt-3 mb-3">
              <Button
                variant="secondary"
                onClick={handleSelectAll}
                className="me-2"
              >
                {selectAll ? "Deselect All" : "Select All"}
              </Button>
              <Button
                variant="primary"
                onClick={generateAllSelectedInOnePDF}
                disabled={selectedStudents.length === 0}
              >
                Generate ID Cards ({selectedStudents.length} Selected)
              </Button>

            </div>
          )}

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
      </section>
    </>
  );
};

export default GenerateIdCard;