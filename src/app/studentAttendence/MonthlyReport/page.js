"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  Button,
  Breadcrumb,
  FormSelect,
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  getClasses,
  getSections,
  getStudentsByClassAndSectionAndDateRange, //  your service
} from "@/Services";

const MonthlyReport = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // e.g., "2025-06"
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await getClasses();
      setClassList(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to fetch classes.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId);
      setSectionList(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to fetch sections.");
    }
  };

  const fetchAttendanceReports = async () => {
    if (!selectedClass || !selectedSection || !selectedMonth) {
      toast.warn("Please select class, section, and month");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    setLoading(true);
    try {
      const response = await getStudentsByClassAndSectionAndDateRange({
        classId: selectedClass,
        sectionId: selectedSection,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      console.log("Attendance API response:", response);

      if (response.success) {
        if (response.data.length > 0) {
          setAttendanceReports(response.data);
          generatePDF(response.data, startDate, endDate);
          toast.success("Attendance report fetched & PDF generated.");
        } else {
          toast.info("No attendance records found for this period.");
        }
      } else {
        toast.error(response.message || "Failed to fetch attendance reports.");
      }
    } catch (error) {
      console.error("Error fetching attendance reports:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch attendance reports. Please try again."
      );
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

  const generatePDF = (data, startDate, endDate) => {
    const doc = new jsPDF();
    const className = getClassName(selectedClass);
    const sectionName = getSectionName(selectedSection);
    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();
    const reportTitle = "Monthly Attendance Report";
    const secondLine = `Class: ${className} (${sectionName}) || Period: ${formattedStartDate} - ${formattedEndDate}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    doc.text(reportTitle, pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(secondLine, pageWidth / 2, 25, { align: "center" });

    const tableData = data.map((report, index) => {
      return [
        index + 1,
        report.roll_no || "N/A",
        `${report.first_name || ""} ${report.last_name || ""}`.trim() || "N/A",
        report.father_name || "N/A",
        new Date(report.attendance_date).toLocaleDateString(),
        report.status || "N/A"
      ];
    });

    doc.autoTable({
      head: [["#", "Roll No", "Student Name", "Father Name", "Date", "Status"]],
      body: tableData,
      startY: 35,
    });

    doc.save("Monthly_Attendance_Report.pdf");
  };



  const breadcrumbItems = [
    { label: "Student Attendance", link: "/studentAttendence/allModule" },
    { label: "Monthly-Report", link: "null" },
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
              <h2>Monthly Attendance Report</h2>
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
                  <FormLabel className="labelForm">Select Month</FormLabel>
                  <Form.Control
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
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
