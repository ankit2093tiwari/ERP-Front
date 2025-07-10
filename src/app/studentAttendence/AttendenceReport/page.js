"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  Button,
  FormSelect,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { BASE_URL, getClasses, getSections } from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const AttendanceReport = () => {
  const { hasEditAccess } = usePagePermission()
  const selectedSessionId = useSessionId()
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceId, setAttendanceId] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    const today = new Date().toISOString().split("T")[0];
    setAttendanceDate(today);
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedClass && selectedSection && attendanceDate) {
      fetchAttendanceReports();
    } else {
      setAttendanceRecords([]);
      setAttendanceId(null);
    }
  }, [selectedClass, selectedSection, attendanceDate]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClassList(res.data || []);
    } catch {
      toast.error("Failed to fetch classes");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const res = await getSections(classId);
      setSectionList(res.data || []);
    } catch {
      toast.error("Failed to fetch sections");
    }
  };

  const fetchAttendanceReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/attendance?class_name=${selectedClass}&section_name=${selectedSection}&attendance_date=${attendanceDate}`
      );

      if (res.data.success && res.data.data?._id) {
        setAttendanceId(res.data.data._id); // ✅ Save for update
        setAttendanceRecords(res.data.data.students || []); // ✅ Save students array
      } else {
        setAttendanceRecords([]);
        setAttendanceId(null); // Clear attendanceId
        toast.error("No attendance found for the selected date/class/section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch attendance");
      setAttendanceId(null);
      setAttendanceRecords([]);
    }
    setLoading(false);
  };



  const handleClassChange = (e) => {
    const id = e.target.value;
    setSelectedClass(id);
    setSelectedSection("");
    fetchSections(id);
  };

  const handleSectionChange = (e) => setSelectedSection(e.target.value);
  const handleDateChange = (e) => setAttendanceDate(e.target.value);

  const handleStatusChange = (studentId, newStatus) => {
    const updated = attendanceRecords.map((rec) =>
      rec.student_id._id === studentId || rec.student_id === studentId
        ? { ...rec, status: newStatus }
        : rec
    );
    setAttendanceRecords(updated);
  };

  const handleSaveUpdate = async () => {
    if (!attendanceId) {
      toast.error("No valid attendance record ID found.");
      return;
    }

    try {
      const payload = {
        attendance_records: attendanceRecords.map((r) => ({
          student_id: r.student_id?._id || r.student_id,
          status: r.status,
        })),
      };

      const res = await axios.put(`${BASE_URL}/api/attendance/update/${attendanceId}`, payload);

      if (res.data.success) {
        toast.success("Attendance updated successfully");
        fetchAttendanceReports(); // Refresh the data
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const breadcrumbItems = [
    { label: "Student Attendance", link: "/studentAttendence/allModule" },
    { label: "Attendance Report", link: "null" },
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
              <h2>Search Attendance</h2>
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
                  <FormLabel className="labelForm">Date</FormLabel>
                  <Form.Control type="date" value={attendanceDate} onChange={handleDateChange} />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  {attendanceRecords.length > 0 && hasEditAccess && (
                    <Button variant="primary" onClick={handleSaveUpdate}>
                      Save Changes
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Attendance Records</h2>
                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : attendanceRecords.length > 0 ? (
                  <Table
                    columns={[
                      { name: "#", selector: (_, i) => i + 1, sortable: true },
                      { name: "Roll No", selector: (row) => row.student_id?.roll_no || "N/A", sortable: true },
                      {
                        name: "Student Name",
                        selector: (row) =>
                          `${row.student_id?.first_name || ""} ${row.student_id?.last_name || ""}`.trim(),
                      },
                      { name: "Father Name", selector: (row) => row.student_id?.father_name || "N/A" },
                      {
                        name: "Status",
                        cell: (row) => (
                          <FormSelect
                            value={row.status}
                            onChange={(e) => handleStatusChange(row.student_id._id || row.student_id, e.target.value)}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </FormSelect>
                        ),
                      },
                    ]}
                    data={attendanceRecords}
                  />
                ) : (
                  <p className="text-center">No attendance found</p>
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
