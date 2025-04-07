"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "@/app/students/assign-roll-no/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const MonthlyReport = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      alert("Failed to fetch classes. Please try again.");
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(response.data.data || []);
    } catch (error) {
      alert("Failed to fetch sections. Please try again.");
      console.error("Error fetching sections:", error);
    }
  };

  const fetchAttendanceReports = async () => {
    if (!selectedClass || !selectedSection || !attendanceDate) {
      alert("Please select class, section, and attendance date");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/attendance?class_name=${selectedClass}&section_name=${selectedSection}&attendance_date=${attendanceDate}`
      );
      if (response.data.success) {
        setAttendanceReports(response.data.data || []);
        generatePDF(response.data.data); // Pass the fetched data to generatePDF
      } else {
        alert(response.data.message || "No attendance records found.");
      }
    } catch (error) {
      alert("Failed to fetch attendance reports. Please try again.");
      console.error("Error fetching attendance reports:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 10);
    doc.text(`Date: ${attendanceDate}`, 14, 20);

    const tableData = data.map((report, index) => [
      index + 1,
      report.student_id?.roll_no || "N/A",
      `${report.student_id?.first_name} ${report.student_id?.last_name}`.trim(),
      report.student_id?.father_name || "N/A",
      new Date(report.attendance_date).toLocaleDateString(),
      report.status || "N/A",
      report.taken_by || "N/A",
    ]);

    doc.autoTable({
      head: [["#", "Roll No", "Student Name", "Father Name", "Date", "Status", "Taken By"]],
      body: tableData,
      startY: 30,
    });

    doc.save("Attendance_Report.pdf");
  };

  const breadcrumbItems = [{ label: "Student Attendance", link: "/studentAttendence/allModule" }, { label: "Attendence-Report", link: "null" }]

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
              <h2>Search Students</h2>
            </div>

            <Form className="formSheet">
              <Row>
                <Col>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      fetchSections(e.target.value);
                    }}
                  >
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
                  <FormSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.section_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>
                <Col>
                  <FormLabel className="labelForm">Attendance Date</FormLabel>
                  <Form.Control
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <Button
                    className="btn btn-primary"
                    onClick={fetchAttendanceReports}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Search & Download PDF"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default MonthlyReport;