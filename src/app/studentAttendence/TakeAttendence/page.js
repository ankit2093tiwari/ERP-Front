"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";

const TakeAttendence = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [attendanceDate, setAttendanceDate] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

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
            setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error("Failed to fetch sections", error);
        }
    };

    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection || !attendanceDate) {
            alert("Please select class, section, and attendance date");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}&attendance_date=${attendanceDate}`
            );
            setStudents(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch students", error);
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

    const handleDateChange = (event) => {
        setAttendanceDate(event.target.value);
    };

    return (
        <Container>
            <Row className="mt-1 mb-1">
                <Col>
                    <Breadcrumb>
                        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href="/students/all-module">Student Attendance</Breadcrumb.Item>
                        <Breadcrumb.Item active>Take Attendance</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>

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
                            <FormSelect value={selectedSection} onChange={handleSectionChange}>
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
                            <Button className="btn btn-primary" onClick={fetchStudents} disabled={loading}>
                                {loading ? "Loading..." : "Search Students"}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Row>
                <Col>
                    <div className="tableSheet">
                        <h2>Take Student Attendance</h2>
                        {students.length > 0 ? (
                            <Table
                                columns={[
                                    { name: "Roll No", selector: (row) => row.roll_no || "N/A", sortable: true },
                                    { name: "Mark Leave", selector: (row) => row.mark_leave || "N/A", sortable: true },
                                    { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(), sortable: true },
                                    { name: "Father Name", selector: (row) => row.father_name || "N/A", sortable: true },
                                    { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },
                                    { name: "Gender", selector: (row) => row.gender_name || "N/A", sortable: true },
                                ]}
                                data={students}
                            />
                        ) : (
                            <p className="text-center">No students found.</p>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default TakeAttendence;
