"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import {
    getClasses,
    getSections,
    getStudentsByClassAndSection,
    // sendSmsToStudents,
} from "@/Services";
import { copyContent, printContent } from "@/app/utils";

const SendStudentSMS = () => {
    const { hasSubmitAccess } = usePagePermission();

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [message, setMessage] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

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
    }, []);

    useEffect(() => {
        const fetchSections = async () => {
            if (!selectedClass) return;
            try {
                const res = await getSections(selectedClass);
                setSections(res?.data || []);
            } catch {
                toast.error("Failed to load sections");
            }
        };
        fetchSections();
    }, [selectedClass]);

    const handleFetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            toast.warning("Please select both class and section");
            return;
        }
        try {
            const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
            setStudents(res?.data || []);
            setSelectedStudentIds([]);
        } catch {
            toast.error("Failed to fetch students");
        }
    };
    const handleSelectAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map((student) => student._id));
        }
    };


    const handleStudentSelect = (studentId) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };


    const handleSendSMS = async () => {
        if (!message.trim()) {
            toast.warning("Message cannot be empty");
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.warning("Please select at least one student");
            return;
        }

        try {
            const payload = {
                message,
                studentIds: selectedStudentIds,
            };
            // const res = await sendSmsToStudents(payload);
            toast.success("SMS sent successfully");
            setMessage("");
            setSelectedStudentIds([]);
        } catch {
            toast.error("Failed to send SMS");
        }
    };

    const columns = [
        {
            name: (
                <Form.Check
                    type="checkbox"
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                />
            ),
            cell: (row) => (
                <Form.Check
                    type="checkbox"
                    checked={selectedStudentIds.includes(row._id)}
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
            selector: (row) =>
                `${row.father_name || ""} `.trim() || "N/A",
            sortable: true,
        },
        {
            name: "Roll No",
            selector: (row) => row.roll_no || "N/A",
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row) => row.phone_no || "N/A",
            sortable: true,
        },
    ];


    const handleCopy = () => {
        const headers = ["#", "Name", "Father Name", "Roll No", "Phone"];
        const rows = students.map((s, i) => {
            const fullName = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.trim() || "N/A";
            return `${i + 1}\t${fullName}\t${s.father_name || "N/A"}\t${s.roll_no || "N/A"}\t${s.phone_no || "N/A"}`;
        });
        copyContent(headers, rows);
    };


    const handlePrint = () => {
        const headers = [["#", "Name", "Father Name", "Roll No", "Phone"]];
        const rows = students.map((s, i) => {
            const fullName = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.trim() || "N/A";
            return [
                i + 1,
                fullName,
                s.father_name || "N/A",
                s.roll_no || "N/A",
                s.phone_no || "N/A"
            ];
        });
        printContent(headers, rows);
    };

    const breadcrumbItems = [
        { label: "Send Bulk SMS", link: "/sendsms/all-module" },
        { label: "Send SMS to Students", link: "null" },
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
                            <Row>
                                <Col lg={6}>
                                    <Form.Label>Class<span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={selectedClass}
                                        onChange={(e) => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSection("");
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
                                    <Col lg={12}>
                                        <Form.Label>Short Message<span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Enter message to send..."
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button
                                            variant="success"
                                            onClick={handleSendSMS}
                                            disabled={!hasSubmitAccess}
                                        >
                                            Send SMS
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

export default dynamic(() => Promise.resolve(SendStudentSMS), { ssr: false });
