"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import useSessionId from "@/hooks/useSessionId";

import {
    addNewCopyCheck,
    getClasses,
    getSections,
    getStudentsByClassAndSection,
    getSubjectByClassId,
    // submitCopyCorrection,
} from "@/Services";
import { copyContent, printContent } from "@/app/utils";
import { useSelector } from "react-redux";

const CopyCorrection = () => {
    const user = useSelector((state) => state.auth.user)
    const userId = user?.userId;
    const selectedSessionId = useSessionId();
    const { hasSubmitAccess } = usePagePermission();

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [checkDate, setCheckDate] = useState(() =>
        new Date().toISOString().split("T")[0]
    );

    const [checkedStudentIds, setCheckedStudentIds] = useState([]);

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await getClasses();
                setClasses(res?.data || []);
            } catch {
                toast.error("Failed to load classes");
            }
        };
        fetchClasses();
    }, [selectedSessionId]);

    // Fetch Sections & Subjects when Class is selected
    useEffect(() => {
        const fetchSectionsAndSubjects = async () => {
            if (!selectedClass) return;
            try {
                const [secRes, subRes] = await Promise.all([
                    getSections(selectedClass),
                    getSubjectByClassId(selectedClass),
                ]);
                setSections(secRes?.data || []);
                setSubjects(subRes?.data || []);
            } catch {
                toast.error("Failed to load sections or subjects");
            }
        };
        fetchSectionsAndSubjects();
    }, [selectedClass]);

    const handleFetchStudents = async () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !checkDate) {
            toast.warning("Please fill all required fields");
            return;
        }
        try {
            const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
            setStudents(res?.data || []);
            setCheckedStudentIds([]);
        } catch {
            toast.error("Failed to fetch students");
        }
    };

    const handleSelectAll = () => {
        setCheckedStudentIds((prev) =>
            prev.length === students.length ? [] : students.map((s) => s._id)
        );
    };

    const handleStudentSelect = (studentId) => {
        setCheckedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSubmitCorrection = async () => {
        if (checkedStudentIds.length === 0) {
            toast.warning("Please select at least one student");
            return;
        }

        try {
            const payload = {
                studentIds: checkedStudentIds,
                classId: selectedClass,
                sectionId: selectedSection,
                subjectId: selectedSubject,
                checkDate,
                checkBy: userId

            };
            await addNewCopyCheck(payload);
            toast.success("Copy correction submitted");
            setCheckedStudentIds([]);
        } catch (error) {
            console.error('failed to submit copy correction', error)
            toast.error("Failed to submit correction");
        }
    };

    const columns = [
        {
            name: (
                <Form.Check
                    type="checkbox"
                    checked={checkedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                />
            ),
            cell: (row) => (
                <Form.Check
                    type="checkbox"
                    checked={checkedStudentIds.includes(row._id)}
                    onChange={() => handleStudentSelect(row._id)}
                />
            ),
            width: "50px",
        },
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: "60px",
        },
        {
            name: "Name",
            selector: (row) =>
                `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`.trim() || "N/A",
            sortable: true,
        },
        {
            name: "Father Name",
            selector: (row) => row.father_name || "N/A",
            sortable: true,
        },
        {
            name: "Roll No",
            selector: (row) => row.roll_no || "N/A",
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row) => row.gender_name || "N/A",
            sortable: true,
        },
    ];

    const handleCopy = () => {
        const headers = ["#", "Name", "Father Name", "Roll No", "Gender"];
        const rows = students.map((s, i) => {
            const fullName = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.trim();
            return `${i + 1}\t${fullName || "N/A"}\t${s.father_name || "N/A"}\t${s.roll_no || "N/A"}\t${s.gender_name || "N/A"}`;
        });
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Name", "Father Name", "Roll No", "Gender"]];
        const rows = students.map((s, i) => {
            const fullName = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.trim();
            return [
                i + 1,
                fullName || "N/A",
                s.father_name || "N/A",
                s.roll_no || "N/A",
                s.gender_name || "N/A"
            ];
        });
        printContent(headers, rows);
    };

    const breadcrumbItems = [
        { label: "Copy Correction", link: "/copycorrection/all-module" },
        { label: "Student Copy Check", link: "null" },
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
                            <h2>Search Students Class & Section Wise</h2>
                        </div>
                        <div className="formSheet">
                            <Row className="mb-2">
                                <Col lg={6}>
                                    <Form.Label>Class<span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSection("");
                                            setSelectedSubject("");
                                        }}
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.class_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col lg={6}>
                                    <Form.Label>Section<span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        disabled={!selectedClass}
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map((sec) => (
                                            <option key={sec._id} value={sec._id}>
                                                {sec.section_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={6}>
                                    <Form.Label>Subject<span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        disabled={!subjects.length}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((sub) => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.subject_details.subject_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col lg={6}>
                                    <Form.Label>Check Date<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={checkDate}
                                        onChange={(e) => setCheckDate(e.target.value)}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col lg={4}>
                                    <Button variant="primary" onClick={handleFetchStudents}>
                                        Fetch Students
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {students.length > 0 && (
                        <div className="cover-sheet">
                            <div className="formSheet">
                                <Row className="my-2">
                                    <Col>
                                        <h5>
                                            Students Checked: <strong>{checkedStudentIds.length}</strong> /{" "}
                                            <strong>{students.length}</strong>
                                        </h5>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button
                                            variant="success"
                                            onClick={handleSubmitCorrection}
                                            disabled={!hasSubmitAccess}
                                        >
                                            Submit Correction
                                        </Button>
                                    </Col>
                                </Row>
                            </div>

                            <div className="tableSheet">
                                <h2>Student List</h2>
                                <Table
                                    columns={columns}
                                    data={students}
                                    handleCopy={handleCopy}
                                    handlePrint={handlePrint}
                                />
                            </div>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(CopyCorrection), { ssr: false });
