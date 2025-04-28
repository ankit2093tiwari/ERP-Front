"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AttendanceReport = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    // Set today's date as default in YYYY-MM-DD format (required by input type="date")
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setAttendanceDate(formattedDate);
  }, []);

  useEffect(() => {
    // Automatically fetch attendance when both class and section are selected
    if (selectedClass && selectedSection && attendanceDate) {
      fetchAttendanceReports();
    } else {
      // Clear reports if any selection is missing
      setAttendanceReports([]);
    }
  }, [selectedClass, selectedSection, attendanceDate]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
      alert("Failed to fetch classes. Please try again.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
      alert("Failed to fetch sections. Please try again.");
    }
  };

  const fetchAttendanceReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/attendance?class_name=${selectedClass}&section_name=${selectedSection}&attendance_date=${attendanceDate}`
      );
      setAttendanceReports(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance reports", error);
      alert("Failed to fetch attendance reports. Please try again.");
    }
    setLoading(false);
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

  const handleAttendanceDateChange = (event) => {
    setAttendanceDate(event.target.value);
  };

  const handleAction = async (attendanceId, status) => {
    try {
      // Optimistically update the UI
      const updatedReports = attendanceReports.map((report) =>
        report._id === attendanceId ? { ...report, status } : report
      );
      setAttendanceReports(updatedReports);

      // Make the API call
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/attendance/update`,
        { attendance_id: attendanceId, status }
      );

      if (!response.data.success) {
        // Revert if the API call fails
        alert("Failed to update attendance status");
        fetchAttendanceReports(); // Refresh data from server
      } else {
        alert("Attendance status updated successfully");
      }
    } catch (error) {
      console.error("Error updating attendance status", error);
      alert("Failed to update attendance status. Please try again.");
      fetchAttendanceReports(); // Refresh data from server
    }
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
                  <FormSelect 
                    value={selectedSection} 
                    onChange={handleSectionChange}
                    disabled={!selectedClass}
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
                    onChange={handleAttendanceDateChange}
                  />
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Attendance Report</h2>
                {loading ? (
                  <p className="text-center">Loading attendance data...</p>
                ) : attendanceReports.length > 0 ? (
                  <Table
                    columns={[
                      { name: "#", selector: (row, index) => index + 1, sortable: true },
                      { name: "Roll No", selector: (row) => row.student_id?.roll_no || "N/A", sortable: true },
                      { 
                        name: "Student Name", 
                        selector: (row) => `${row.student_id?.first_name} ${row.student_id?.last_name}`.trim(), 
                        sortable: true 
                      },
                      { name: "Father Name", selector: (row) => row.student_id?.father_name || "N/A", sortable: true },
                      { 
                        name: "Date", 
                        selector: (row) => new Date(row.attendance_date).toLocaleDateString(), 
                        sortable: true 
                      },
                      { 
                        name: "Status", 
                        selector: (row) => row.status || "N/A", 
                        sortable: true,
                        cell: (row) => (
                          <span style={{
                            color: row.status === "Present" ? "green" : 
                                  row.status === "Absent" ? "red" : 
                                  row.status === "Leave" ? "orange" : "black",
                            fontWeight: "bold"
                          }}>
                            {row.status || "N/A"}
                          </span>
                        )
                      },
                      { name: "Taken By", selector: (row) => row.taken_by || "N/A", sortable: true },
                      {
                        name: "Action",
                        cell: (row) => (
                          <div>
                            <Button 
                              variant={row.status === "Present" ? "success" : "outline-success"} 
                              size="sm" 
                              onClick={() => handleAction(row._id, "Present")}
                            >
                              Present
                            </Button>{" "}
                            <Button 
                              variant={row.status === "Absent" ? "danger" : "outline-danger"} 
                              size="sm" 
                              onClick={() => handleAction(row._id, "Absent")}
                            >
                              Absent
                            </Button>{" "}
                            <Button 
                              variant={row.status === "Leave" ? "warning" : "outline-warning"} 
                              size="sm" 
                              onClick={() => handleAction(row._id, "Leave")}
                            >
                              Leave
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={attendanceReports}
                  />
                ) : (
                  <p className="text-center">
                    {selectedClass && selectedSection && attendanceDate 
                      ? "No attendance records found for the selected criteria" 
                      : "Please select a class, section, and date"}
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default AttendanceReport;