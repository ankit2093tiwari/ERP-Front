"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { getClasses, getSections, getStudentsByClassAndSection } from "@/Services";

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
      const response = await getClasses()
      setClassList(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to fetch classes. Please try again.");
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId)
      setSectionList(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to fetch sections. Please try again.");
      console.error("Error fetching sections:", error);
    }
  };

  const fetchAttendanceReports = async () => {
    if (!selectedClass || !selectedSection || !attendanceDate) {
      toast.warn("Please select class, section, and attendance date");
      return;
    }
    setLoading(true);
    try {
      const response = await getStudentsByClassAndSection(selectedClass, selectedSection)
      if (response.success) {
        setAttendanceReports(response.data || []);
        generatePDF(response.data); // Pass the fetched data to generatePDF
      } else {
        toast.warn(response.message || "No attendance records found.");
      }
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to fetch attendance reports. Please try again.");
      console.error("Error fetching attendance reports:", error.response?.data.message || error.message);
    }
    setLoading(false);
  };
  const getClassName = (id) => {
    const found = classList.find((cls) => cls._id === id);
    return found ? found.class_name : "N/A";
  };

  const getSectionName = (id) => {
    const found = sectionList.find((sec) => sec._id === id);
    return found ? found.section_name : "N/A";
  };
  const generatePDF = (data) => {
    const doc = new jsPDF();

    const className = getClassName(selectedClass);
    const sectionName = getSectionName(selectedSection);
    const reportTitle = "Attendance Report";
    const secondLine = `Class: ${className} (${sectionName})  ||  Date: ${attendanceDate}`;

    const pageWidth = doc.internal.pageSize.getWidth();

    // ✅ Line 1 - Attendance Report (centered)
    doc.setFontSize(16);
    doc.text(reportTitle, pageWidth / 2, 15, { align: "center" });

    // ✅ Line 2 - Class & Date (centered)
    doc.setFontSize(12);
    doc.text(secondLine, pageWidth / 2, 25, { align: "center" });

    // ✅ Table Data
    const tableData = data.map((report, index) => [
      index + 1,
      report.student_id?.roll_no || "N/A",
      `${report.student_id?.first_name} ${report.student_id?.last_name}`.trim(),
      report.student_id?.father_name || "N/A",
      new Date(report.attendance_date).toLocaleDateString(),
      report.status || "N/A",
      // report.taken_by || "N/A", // 👈 Commented for future use
    ]);

    // ✅ Table
    doc.autoTable({
      head: [["#", "Roll No", "Student Name", "Father Name", "Date", "Status"]],
      body: tableData,
      startY: 35,
    });

    // ✅ Save PDF
    doc.save("Attendance_Report.pdf");
  };


  const breadcrumbItems = [{ label: "Student Attendance", link: "/studentAttendence/allModule" }, { label: "Monthly-Report", link: "null" }]

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