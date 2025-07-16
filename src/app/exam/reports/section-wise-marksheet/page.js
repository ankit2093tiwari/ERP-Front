"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, Form, FormLabel, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";

import {
    getClasses,
    getSections,
    getExamMasterByClassId,
    getStudentsByClassAndSection,
    getAllSchoolAccounts,
    getStudentReport
} from "@/Services";

const SectionWiseMarksheet = () => {
    const { hasSubmitAccess } = usePagePermission();

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedExam, setSelectedExam] = useState("");

    const breadcrumbItems = [
        { label: "Exams", link: "/exam/all-module" },
        { label: "Section Wise Marksheet", link: null },
    ];

    useEffect(() => {
        (async () => {
            try {
                const clsRes = await getClasses();
                setClasses(clsRes.data || []);
            } catch {
                toast.error("Failed to fetch classes.");
            }
        })();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections();
            fetchExams();
        } else {
            setSections([]);
            setExams([]);
        }
    }, [selectedClass]);

    const fetchSections = async () => {
        try {
            const res = await getSections(selectedClass);
            setSections(res.data || []);
        } catch {
            toast.error("Failed to fetch sections.");
        }
    };

    const fetchExams = async () => {
        try {
            const res = await getExamMasterByClassId(selectedClass);
            setExams(res.data || []);
        } catch {
            toast.error("Failed to fetch exams.");
        }
    };

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection || !selectedExam) {
            return toast.error("Please select Class, Section & Exam.");
        }
        try {
            const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
            setStudents(res.data || []);
        } catch {
            toast.error("Failed to load students.");
        }
    };

    const getSchoolinfo = async () => {
        const response = await getAllSchoolAccounts();
        if (response.data && response.data.length > 0) {
            return response.data[0].school_account || "School Name";
        }
        return "School Name";
    }

    const handlePrintAllReports = async () => {
        if (!selectedClass || !selectedSection || !selectedExam) {
            return toast.error("Please select Class, Section & Exam.");
        }

        try {
            const schoolName = await getSchoolinfo();
            const examObj = exams.find(ex => ex._id === selectedExam);
            const examName = examObj?.examName || "Exam";
            const DEFAULT_MAX_MARKS = 100;

            let allReportsHtml = `
                <html>
                <head>
                    <title>Section Wise Marksheet</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; padding: 20px; }
                        h2, h3 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
                        th { background-color: #e0e0e0; }
                        .details { margin-top: 10px; }
                        .details p { margin: 3px 0; }
                        .footer { margin-top: 30px; display: flex; justify-content: space-between; }
                        .footer div { text-align: center; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
            `;

            for (const stu of students) {
                const res = await getStudentReport({ studentId: stu._id, examId: selectedExam })

                const student = res?.student || {};
                const marks = res?.marks || [];

                let studentHtml = `
                    <div class="report">
                        <h2>${schoolName}</h2>
                        <h3>Progress Report Card (${examName})</h3>
                        <div class="details">
                            <p><strong>Scholar No:</strong> ${student.registrationId || '-'}</p>
                            <p><strong>Name:</strong> ${student.fullName || '-'}</p>
                            <p><strong>Father's Name:</strong> ${student.fatherName || '-'}</p>
                            <p><strong>Mother's Name:</strong> ${student.motherName || '-'}</p>
                            <p><strong>Class:</strong> ${student.class || '-'} &nbsp;&nbsp; <strong>Section:</strong> ${student.section || '-'}</p>
                            <p><strong>Roll No:</strong> ${student.rollNo || '-'}</p>
                            <p><strong>DOB:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Subject</th>
                                    <th>Max Marks</th>
                                    <th>Marks Obtained</th>
                                    <th>Practical Marks</th>
                                    <th>Total</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${marks.length > 0
                        ? marks.map((item, idx) => {
                            const maxMarks = item.maxMarks || DEFAULT_MAX_MARKS;
                            const totalMarks = (item.marks || 0) + (item.practicalMarks || 0);
                            return `
                                            <tr>
                                                <td>${idx + 1}</td>
                                                <td>${item.subjectName || '-'}</td>
                                                <td>${maxMarks}</td>
                                                <td>${item.marks || 0}</td>
                                                <td>${item.practicalMarks || 0}</td>
                                                <td>${totalMarks}</td>
                                                <td>${item.remarks || '-'}</td>
                                            </tr>`;
                        }).join("")
                        : `<tr><td colspan="7">No marks found.</td></tr>`
                    }
                            </tbody>
                        </table>

                        <div class="footer">
                            <div><br>_________________<br><strong>Teacher's Signature</strong></div>
                            <div><br>_________________<br><strong>Principal's Signature</strong></div>
                        </div>
                    </div>
                    <div class="page-break"></div>
                `;

                allReportsHtml += studentHtml;
            }

            allReportsHtml += `</body></html>`;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(allReportsHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();

        } catch (err) {
            console.error(err);
            toast.error("Failed to generate section wise marksheet.");
        }
    };

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
                        <div className="formSheet mb-3">
                            <Row className="mb-3">
                                <Col md={4}>
                                    <FormLabel>Class <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                        <option value="">Select Class</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <FormLabel>Section <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                        <option value="">Select Section</option>
                                        {sections.map(sec => (
                                            <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <FormLabel>Exam Type <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                                        <option value="">Select Exam</option>
                                        {exams.map(ex => (
                                            <option key={ex._id} value={ex._id}>{ex.examName}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Button className="mt-2 me-2" onClick={loadStudents}>
                                Load Students
                            </Button>
                            {hasSubmitAccess && (
                                <Button variant="success" onClick={handlePrintAllReports} disabled={students.length === 0}>
                                    Generate All Reports
                                </Button>
                            )}
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(SectionWiseMarksheet), { ssr: false });
