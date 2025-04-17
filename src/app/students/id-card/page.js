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
      format: [85, 85]
    });

    selectedStudents.forEach((studentId, index) => {
      const student = students.find(s => s._id === studentId);
      if (student) {
        if (index !== 0) pdf.addPage();

        pdf.setFillColor(230, 230, 250);
        pdf.rect(0, 0, 85, 54, 'F');

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 128);
        pdf.text("SCHOOL NAME", 42, 5, { align: 'center' });
        pdf.text("123 School Street, City", 42, 10, { align: 'center' });

        pdf.setDrawColor(0, 0, 128);
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(5, 15, 25, 30, 2, 2, 'FD');
        pdf.text("Photo", 17, 30, { align: 'center' });

        const details = [
          `Name: ${student.first_name} ${student.last_name}`,
          `Class: ${student.class_name?.class_name || "N/A"}`,
          `Section: ${student.section_name?.section_name || "N/A"}`,
          `Roll No: ${student.roll_no || "N/A"}`,
          `Father: ${student.father_name || "N/A"}`,
          `Valid Until: 31/12/2024`
        ];

        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        details.forEach((text, i) => {
          pdf.text(text, 35, 15 + (i * 5));
        });

        pdf.setDrawColor(255, 0, 0);
        // pdf.circle(70, 45, 5, 'D');
        // pdf.text("SEAL", 70, 45, { align: 'center' });
      }
    });

    pdf.save(`Selected_ID_Cards.pdf`);
  };

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