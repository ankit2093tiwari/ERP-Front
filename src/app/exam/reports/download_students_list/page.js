"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import {
    getClasses,
    getSections,
    getStudentsByClassAndSection
} from "@/Services";

const DownloadStudentList = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await getClasses();
            if (res.success) {
                setClasses(res.data || []);
            } else {
                toast.error(res.message || "Failed to load classes");
            }
        } catch {
            toast.error("Server error while fetching classes");
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await getSections(classId);
            if (res.success) {
                setSections(res.data || []);
            } else {
                toast.error(res.message || "Failed to load sections");
            }
        } catch {
            toast.error("Server error while fetching sections");
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedSection("");
        setSections([]);
        if (classId) fetchSections(classId);
    };

    const handleFetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            toast.error("Please select both class and section");
            return;
        }
        setLoading(true);
        try {
            const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
            if (res.success) {
                setStudents(res.data || []);
            } else {
                toast.error(res.message || "Failed to load students");
            }
        } catch {
            toast.error("Server error while fetching students");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = () => {
        if (!students.length) {
            return toast.error("No students to download.");
        }

        const data = students.map((stu, index) => ({
            "S.No": index + 1,
            "Enrollment No": stu.enrollment_no || "-",
            "Full Name": `${stu.first_name || ""} ${stu.middle_name || ""} ${stu.last_name || ""}`.trim(),
            "Father Name": stu.father_name || "-",
            "Mother Name": stu.mother_name || "-",
            "DOB": stu.date_of_birth ? new Date(stu.date_of_birth).toLocaleDateString() : "-",
            "Gender": stu.gender_name || "-",
            "Class": stu.class_name?.class_name || "-",
            "Section": stu.section_name?.section_name || "-",
            "Father Mobile": stu.father_mobile_no || "-",
            "Student Phone": stu.phone_no || "-",
            "Religion": stu.religion_name?.religion_name || "-"
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, `Student_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleCopy = () => {
        const headers = ["S.No", "Enrollment No", "Full Name", "Father Name", "Mother Name", "DOB", "Gender", "Class", "Section", "Father Mobile", "Student Phone", "Religion"];
        const rows = students.map((stu, idx) =>
            `${idx + 1}\t${stu.enrollment_no || "-"}\t${stu.first_name || ""} ${stu.middle_name || ""} ${stu.last_name || ""}\t${stu.father_name || "-"}\t${stu.mother_name || "-"}\t${stu.date_of_birth ? new Date(stu.date_of_birth).toLocaleDateString() : "-"}\t${stu.gender_name || "-"}\t${stu.class_name?.class_name || "-"}\t${stu.section_name?.section_name || "-"}\t${stu.father_mobile_no || "-"}\t${stu.phone_no || "-"}\t${stu.religion_name?.religion_name || "-"}`
        );
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["S.No", "Enrollment No", "Full Name", "Father Name", "Mother Name", "DOB", "Gender", "Class", "Section", "Father Mobile", "Student Phone", "Religion"]];
        const rows = students.map((stu, idx) => [
            idx + 1,
            stu.enrollment_no || "-",
            `${stu.first_name || ""} ${stu.middle_name || ""} ${stu.last_name || ""}`.trim(),
            stu.father_name || "-",
            stu.mother_name || "-",
            stu.date_of_birth ? new Date(stu.date_of_birth).toLocaleDateString() : "-",
            stu.gender_name || "-",
            stu.class_name?.class_name || "-",
            stu.section_name?.section_name || "-",
            stu.father_mobile_no || "-",
            stu.phone_no || "-",
            stu.religion_name?.religion_name || "-"
        ]);
        printContent(headers, rows);
    };

    const columns = [
        { name: "S.No", selector: (row, idx) => idx + 1, width: "80px" },
        // { name: "Enrollment No", selector: row => row.enrollment_no },
        { name: "Full Name", selector: row => `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`.trim() },
        { name: "Father Name", selector: row => row.father_name },
        { name: "Mother Name", selector: row => row.mother_name },
        { name: "DOB", selector: row => row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString() : "-" },
        { name: "Gender", selector: row => row.gender_name },
        { name: "Class", selector: row => row.class_name?.class_name },
        { name: "Section", selector: row => row.section_name?.section_name },
        { name: "Father Mobile", selector: row => row.father_mobile_no },
        { name: "Student Phone", selector: row => row.phone_no },
        { name: "Religion", selector: row => row.religion_name?.religion_name },
    ];

    const breadcrumbItems = [
        { label: "Student", link: "/student/all-module" },
        { label: "Download Student List", link: null }
    ];

    return (
        <>
            <div className="breadcrumbSheet">
                <Container>
                    <Row>
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
                            <h2>Download Student List</h2>
                        </div>
                        <div className="formSheet">
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>Class <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedClass}
                                        onChange={handleClassChange}
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.class_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Section <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        disabled={!sections.length}
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map(sec => (
                                            <option key={sec._id} value={sec._id}>
                                                {sec.section_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                            </Row>
                            <Row>
                                <Col md={4} >
                                    <Button onClick={handleFetchStudents} disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : "Load Students"}
                                    </Button>
                                    <Button className="ms-2" variant="success" onClick={handleDownloadExcel} disabled={!students.length}>
                                        Download Excel
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                    </div>

                    {students.length > 0 ? (
                        <div className="tableSheet">
                            {loading ? (
                                <p>Loading students...</p>
                            ) : (
                                <Table
                                    columns={columns}
                                    data={students}
                                    handleCopy={handleCopy}
                                    handlePrint={handlePrint}
                                />
                            )}
                        </div>
                    ) :
                        (
                            <p className="text-center mt-4">No Student Found</p>
                        )}
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(DownloadStudentList), { ssr: false });
