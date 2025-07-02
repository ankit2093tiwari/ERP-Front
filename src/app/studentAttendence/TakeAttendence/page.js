"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, Button, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { createStudentsAttendance, getClasses, getSections, getStudentsByClassAndSection } from "@/Services";
import { toast } from "react-toastify";

const TakeAttendence = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    const today = new Date().toISOString().split("T")[0];
    setAttendanceDate(today);
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
      setAttendanceRecords([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClassList(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch classes");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const res = await getSections(classId);
      setSectionList(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch sections");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
      const studentsData = res.data || [];
      setStudents(studentsData);

      const initialRecords = studentsData.map((s) => ({
        student_id: s._id,
        status: "Present", // Initial value (uppercase)
      }));
      setAttendanceRecords(initialRecords);
    } catch (err) {
      toast.error("Failed to fetch students");
    }
    setLoading(false);
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    fetchSections(classId);
  };

  const handleSectionChange = (e) => setSelectedSection(e.target.value);
  const handleDateChange = (e) => setAttendanceDate(e.target.value);

  const handleAttendanceChange = (studentId, status) => {
    const updated = attendanceRecords.map((record) =>
      record.student_id === studentId ? { ...record, status } : record
    );
    setAttendanceRecords(updated);
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedSection || !attendanceDate) {
      toast.warning("Class, Section and Date are required");
      return;
    }

    const payload = {
      class_name: selectedClass,
      section_name: selectedSection,
      attendance_date: attendanceDate,
      attendance_records: attendanceRecords,
    };

    setSubmitting(true);
    try {
      const res = await createStudentsAttendance(payload);
      if (res.success) {
        toast.success(res.message);
        setSelectedClass("");
        setSelectedSection("");
        setStudents([]);
        setAttendanceRecords([]);
        const today = new Date().toISOString().split("T")[0];
        setAttendanceDate(today);
      } else {
        toast.error(res.message || "Attendance failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting attendance");
    }
    setSubmitting(false);
  };

  const calculateSummary = () => {
    return {
      totalPresent: attendanceRecords.filter((r) => r.status === "Present").length,
      totalAbsent: attendanceRecords.filter((r) => r.status === "Absent").length,
      totalLeave: attendanceRecords.filter((r) => r.status === "Leave").length,
    };
  };

  const { totalPresent, totalAbsent, totalLeave } = calculateSummary();
  const breadcrumbItems = [
    { label: "Student Attendance", link: "/studentAttendence/allModule" },
    { label: "Take-Attendence", link: "null" },
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
              <h2>Search Students</h2>
            </div>
            <Form className="formSheet">
              <Row>
                <Col>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect value={selectedClass} onChange={handleClassChange}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.class_name}</option>
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
                      <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                    ))}
                  </FormSelect>
                </Col>
                <Col>
                  <FormLabel className="labelForm">Select Date</FormLabel>
                  <Form.Control
                    type="date"
                    value={attendanceDate}
                    onChange={handleDateChange}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  {students.length > 0 && (
                    <Button variant="success" onClick={submitAttendance} disabled={submitting}>
                      {submitting ? "Submitting..." : "Take Attendance"}
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Take Student Attendance</h2>
                {loading ? (
                  <p className="text-center">Loading students...</p>
                ) : students.length > 0 ? (
                  <>
                    <div className="attendance-summary">
                      <p>Total Present: {totalPresent} | Total Absent: {totalAbsent} | Total Leave: {totalLeave}</p>
                    </div>
                    <Table
                      columns={[
                        { name: "#", selector: (row, index) => index + 1, width: "50px" },
                        { name: "Roll No", selector: (row) => row.roll_no || "N/A" },
                        {
                          name: "Status",
                          cell: (row) => (
                            <FormSelect
                              value={
                                attendanceRecords.find((r) => r.student_id === row._id)?.status || "Present"
                              }
                              onChange={(e) =>
                                handleAttendanceChange(row._id, e.target.value)
                              }
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Leave">Leave</option>
                            </FormSelect>
                          ),
                        },
                        { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim() },
                        { name: "Father Name", selector: (row) => row.father_name || "N/A" },
                      ]}
                      data={students}
                    />
                  </>
                ) : (
                  <p className="text-center">
                    {selectedClass && selectedSection ? "No students found" : "Please select class and section"}
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

export default TakeAttendence;
