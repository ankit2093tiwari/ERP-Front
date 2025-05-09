"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

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
        // Set today's date as the default attendance date
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setAttendanceDate(formattedDate);
    }, []);

    useEffect(() => {
        // Automatically fetch students when both class and section are selected
        if (selectedClass && selectedSection) {
            fetchStudents();
        } else {
            // Clear students if either class or section is unselected
            setStudents([]);
            setAttendanceRecords([]);
        }
    }, [selectedClass, selectedSection]);

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

    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
            );
            const studentsData = response.data.data || [];
            setStudents(studentsData);

            // Initialize attendance records with default status "present"
            const initialAttendanceRecords = studentsData.map((student) => ({
                student_id: student._id,
                status: "present", // Default status
            }));
            setAttendanceRecords(initialAttendanceRecords);
        } catch (error) {
            console.error("Failed to fetch students", error);
            alert("Failed to fetch students. Please try again.");
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
        const sectionId = event.target.value;
        setSelectedSection(sectionId);
    };

    const handleDateChange = (event) => {
        setAttendanceDate(event.target.value);
    };

    const handleAttendanceChange = (studentId, status) => {
        const updatedRecords = attendanceRecords.map((record) =>
            record.student_id === studentId ? { ...record, status } : record
        );
        setAttendanceRecords(updatedRecords);
    };

    const submitAttendance = async () => {
        if (!selectedClass || !selectedSection || !attendanceDate) {
            alert("Please select class, section, and attendance date");
            return;
        }

        if (attendanceRecords.length === 0) {
            alert("No attendance records to submit.");
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
            const response = await axios.post(
                "https://erp-backend-fy3n.onrender.com/api/students/takeAttendance",
                payload
            );

            if (response.data.success) {
                alert(response.data.message); // Show success message from the backend
                console.log("Attendance response:", response.data);

                // Reset form and state after successful submission
                setSelectedClass("");
                setSelectedSection("");
                setAttendanceDate("");
                setStudents([]);
                setAttendanceRecords([]);
            } else {
                alert(response.data.message || "Failed to record attendance. Please try again.");
            }
        } catch (error) {
            console.error("Failed to submit attendance", error);
            alert(error.response?.data?.message || "Failed to record attendance. Please try again.");
        }
        setSubmitting(false);
    };

    const calculateAttendanceSummary = () => {
        const totalPresent = attendanceRecords.filter(record => record.status === "present").length;
        const totalAbsent = attendanceRecords.filter(record => record.status === "absent").length;
        const totalLeave = attendanceRecords.filter(record => record.status === "leave").length;

        return { totalPresent, totalAbsent, totalLeave };
    };

    const { totalPresent, totalAbsent, totalLeave } = calculateAttendanceSummary();

    const breadcrumbItems = [{ label: "Student Attendance", link: "/studentAttendence/allModule" }, { label: "Take-Attendence", link: "null" }]

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
                                        <Button className="btn btn-success" onClick={submitAttendance} disabled={submitting}>
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
                                            <p>Total Present: {totalPresent} & Total Absent: {totalAbsent} Total Leave: {totalLeave}</p>
                                        </div>
                                        <Table
                                            columns={[
                                                {
                                                    name: "#",
                                                    selector: (row, index) => index + 1,
                                                    sortable: false,
                                                    width: "50px",
                                                },
                                                { name: "Roll No", selector: (row) => row.roll_no || "N/A", sortable: true },
                                                {
                                                    name: "Attendance Status",
                                                    cell: (row) => (
                                                        <FormSelect
                                                            value={attendanceRecords.find((record) => record.student_id === row._id)?.status || "present"}
                                                            onChange={(e) => handleAttendanceChange(row._id, e.target.value)}
                                                        >
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                            <option value="leave">Leave</option>
                                                        </FormSelect>
                                                    ),
                                                },
                                                { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(), sortable: true },
                                                { name: "Father Name", selector: (row) => row.father_name || "N/A", sortable: true },
                                            ]}
                                            data={students}
                                        />
                                    </>
                                ) : (
                                    <p className="text-center">
                                        {selectedClass && selectedSection ? "No students found for this class and section" : "Please select a class and section"}
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