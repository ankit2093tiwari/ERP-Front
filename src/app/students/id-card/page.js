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
      // Reset section and students when class changes
      setSelectedSection("");
      setStudents([]);
      setSelectedStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      // Reset students when section is cleared
      setStudents([]);
      setSelectedStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass, selectedSection]);

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

  const generateAllSelectedInOnePDF = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
  
    try {
      // Fetch school data
      const schoolResponse = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");
      const schoolData = schoolResponse.data.data || [];
      const schoolName = schoolData.length > 0 ? schoolData[0].school_name : "R.D.S. MEMORIAL PUBLIC SCHOOL (English Medium)";
  
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [90, 90] // ID card size
      });
  
      selectedStudents.forEach((studentId, index) => {
        const student = students.find(s => s._id === studentId);
        if (student) {
          if (index !== 0) pdf.addPage();
  
          const marginX = 8;
          const marginY = 8;
          const cardWidth = 90 - 2 * marginX;
          const cardHeight = 90 - 2 * marginY;
  
          const contentPadding = 3;
          const centerX = marginX + cardWidth / 2;
  
          // Outer Border
          pdf.setDrawColor(0);
          pdf.rect(marginX, marginY, cardWidth, cardHeight);
  
          // Header - Use dynamic school name
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0);
          
          // Split school name into parts if needed
          const schoolNameParts = schoolName.split('(');
          pdf.text(schoolNameParts[0].trim(), centerX, marginY + contentPadding + 4, { align: 'center' });
          if (schoolNameParts[1]) {
            pdf.text(`(${schoolNameParts[1].trim()}`, centerX, marginY + contentPadding + 9, { align: 'center' });
          }
  
          // Contact
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.text("Delhi", centerX, marginY + contentPadding + 14, { align: 'center' });
          pdf.text("9898989898", centerX, marginY + contentPadding + 18, { align: 'center' });
  
          // Title
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("IDENTITY CARD", centerX, marginY + contentPadding + 24, { align: 'center' });
  
          // Divider
          pdf.setDrawColor(0);
          pdf.line(marginX + 2, marginY + contentPadding + 26, marginX + cardWidth - 2, marginY + contentPadding + 26);
  
          // Image box
          const imgX = marginX + 4;
          const imgY = marginY + contentPadding + 30;
          const imgW = 22;
          const imgH = 28;
          pdf.setDrawColor(150);
          pdf.setFillColor(230, 230, 230);
          pdf.roundedRect(imgX, imgY, imgW, imgH, 2, 2, 'FD');
          pdf.setTextColor(100);
          pdf.setFontSize(6);
          pdf.text("Image not found", imgX + imgW / 2, imgY + 12, { align: 'center' });
          pdf.text("or type unknown", imgX + imgW / 2, imgY + 16, { align: 'center' });
  
          // Student details to the right of image
          const detailsX = imgX + imgW + 4;
          let detailsY = imgY;
  
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7.5);
          pdf.setTextColor(0);
  
          // Detail lines with spacing
          pdf.text("STUDENT'S NAME:", detailsX, detailsY);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${student.first_name} ${student.last_name}`, detailsX, detailsY + 4);
  
          detailsY += 10;
          pdf.setFont("helvetica", "normal");
          pdf.text("FATHER'S NAME:", detailsX, detailsY);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${student.father_name || "N/A"}`, detailsX, detailsY + 4);
  
          detailsY += 10;
          pdf.setFont("helvetica", "normal");
          pdf.text("CLASS:", detailsX, detailsY);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${student.class_name?.class_name || "N/A"}`, detailsX, detailsY + 4);
  
          detailsY += 10;
          pdf.setFont("helvetica", "normal");
          pdf.text("SECTION:", detailsX, detailsY);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${student.section_name?.section_name || "N/A"}`, detailsX, detailsY + 4);
  
          // Principal Sign
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.text("PRINCIPAL SIGN", marginX + cardWidth - 3, marginY + cardHeight - 2, {
            align: 'right'
          });
        }
      });
  
      pdf.save(`Student_ID_Cards.pdf`);
    } catch (error) {
      console.error("Error fetching school data:", error);
      alert("Failed to fetch school information. Using default school name.");
    }
  };
  
  const generatePDF = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

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
                    disabled={!selectedClass}
                  >
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                    ))}
                  </FormSelect>
                </Col>
              </Row>
            </Form>
          </div>

          {students.length > 0 && (
            <div className="mt-3 mb-3">
              <Button
                variant="primary"
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