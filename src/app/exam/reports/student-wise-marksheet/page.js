"use client";

import React, { useState, useEffect, useCallback } from "react";

import dynamic from "next/dynamic";
import { Container, Row, Col, Form, FormLabel, Button, } from "react-bootstrap";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";
import axios from "axios";

import {
    getClasses,
    getSections,
    getExamMasterByClassId,
    getStudentsByClassAndSection,
    getAllSchoolAccounts,
    getAllRemarks,
    getStudentReport,
    // submitRemarksForStudents,
} from "@/Services";

const StudentRemarksEntry = () => {
    const { hasSubmitAccess } = usePagePermission();

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [remarks, setRemarks] = useState([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedExam, setSelectedExam] = useState("");
    const [remarkErrors, setRemarkErrors] = useState({});


    const breadcrumbItems = [
        { label: "Exams", link: "/exam/all-module" },
        { label: "Student Wise Remarks", link: null },
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



    const fetchSections = useCallback(async () => {
        try {
            const res = await getSections(selectedClass);
            setSections(res.data || []);
        } catch {
            toast.error("Failed to fetch sections.");
        }
    }, [selectedClass]);
    const fetchExams = useCallback(async () => {
        try {
            const res = await getExamMasterByClassId(selectedClass);
            setExams(res.data || []);
        } catch {
            toast.error("Failed to fetch exams.");
        }
    }, [selectedClass]);

    const fetchRemarks = useCallback(async () => {
        try {
            const response = await getAllRemarks();
            setRemarks(response.data || []);
        } catch (error) {
            console.error("Failed to fetch remarks:", error);
        }
    }, []);
    useEffect(() => {
        if (selectedClass) {
            fetchSections();
            fetchExams();
            fetchRemarks();
        } else {
            setSections([]);
            setExams([]);
            setRemarks([]);
        }
    }, [selectedClass, fetchSections, fetchExams, fetchRemarks]);


    const loadStudents = async () => {
        if (!selectedClass || !selectedSection || !selectedExam) {
            return toast.error("Please select Class, Section & Exam.");
        }
        try {
            const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
            const data = res.data || [];
            const initialized = data.map(stu => ({
                studentId: stu._id,
                studentName: stu.first_name + " " + stu.last_name,
                rollNo: stu.roll_no,
                remark: "",
            }));
            setStudents(initialized);
        } catch {
            toast.error("Failed to load students.");
        }
    };

    const handleRemarkChange = (id, value) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, remark: value } : s));
        setRemarkErrors(prev => ({ ...prev, [id]: false })); // Clear error
    };


    const handleSubmitRemarks = async () => {
        if (!selectedClass || !selectedSection || !selectedExam) {
            return toast.error("Class, Section & Exam are required.");
        }

        try {
            await submitRemarksForStudents({
                class: selectedClass,
                section: selectedSection,
                exam: selectedExam,
                remarks: students.map(s => ({ student: s.studentId, remark: s.remark }))
            });
            toast.success("Remarks updated successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit remarks.");
        }
    };
    const getSchoolinfo = async () => {
        const response = await getAllSchoolAccounts();
        console.log(response.data);
        if (response.data && response.data.length > 0) {
            const schoolInfo = response.data[0];
            return document.title = schoolInfo.school_account || "School Name";
        }
    }
    const handlePrintReport = async (studentId, studentName) => {
        const studentRow = students.find(s => s.studentId === studentId);

        if (!studentRow || !studentRow.remark?.trim()) {
            toast.warn("Please select a remark for this student before viewing the report.");
            setRemarkErrors(prev => ({ ...prev, [studentId]: true }));
            return;
        }

        setRemarkErrors(prev => ({ ...prev, [studentId]: false }));
        try {
            const schoolName = await getSchoolinfo();

            const res = await getStudentReport({ studentId, examId: selectedExam })
            const student = res?.student || {};
            const marks = res?.marks || [];
            const examName = selectedExamObj?.examName || "Exam";
            const studentRow = students.find(s => s.studentId === studentId);
            const overallRemark = studentRow?.remark || '-';


            // If you don't have max marks in your data, we can assume (example)
            const DEFAULT_MAX_MARKS = 100;

            const reportHtml = `
            <html>
            <head>
                <title>Report Card ${studentName}</title>
                <style>
                    body { font-family: 'Times New Roman', Times, serif; padding: 30px; }
                    h2, h3 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                    th { background-color: #e0e0e0; }
                    .details { margin-top: 20px; }
                    .details p { margin: 4px 0; }
                    .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                    .footer div { text-align: center; }
                </style>
            </head>
            <body>
                <h2>${schoolName}</h2>
                <h3>Progress Report Card (${examName}) </h3>
                <div class="details">
                    <p><strong>Scholar No:</strong> ${student.registrationId || '-'}</p>
                    <p><strong>Name:</strong> ${student.fullName || '-'}</p>
                    <p><strong>Father's Name:</strong> ${student.fatherName || '-'}</p>
                    <p><strong>Mother's Name:</strong> ${student.motherName || '-'}</p>
                    <p><strong>Class:</strong> ${student.class || '-'} &nbsp;&nbsp; <strong>Section:</strong> ${student.section || '-'}</p>
                    <p><strong>Roll No:</strong> ${student.rollNo || '-'}</p>
                    <p><strong>DOB:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</p>
                     <p><strong>Overall Remark:</strong> ${overallRemark}</p>
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
            </body>
            </html>
        `;

            // Open new window and print
            const printWindow = window.open('', '_blank');
            printWindow.document.write(reportHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();

        } catch (err) {
            console.error(err);
            toast.error("Failed to load report card.");
        }
    };


    const columns = [
        { name: "#", selector: (_, i) => i + 1, width: "60px" },
        { name: "Roll No", selector: row => row.rollNo },
        { name: "Name", selector: row => row.studentName },
        {
            name: "Remarks",
            cell: row => (
                <Form.Select
                    value={row.remark}
                    onChange={(e) => handleRemarkChange(row.studentId, e.target.value)}
                    isInvalid={remarkErrors[row.studentId]}
                >
                    <option value="">Select</option>
                    {remarks.map(remark => (
                        <option key={remark._id} value={remark.remarkName}>{remark.remarkName}</option>
                    ))}
                </Form.Select>
            )
        },
        {
            name: "Action",
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handlePrintReport(row.studentId, row.studentName)}
                >
                    View Report
                </Button>
            )
        }
    ];

    const selectedExamObj = exams.find(ex => ex._id === selectedExam);

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
                                <Col md={6}>
                                    <FormLabel>Class <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                                        <option value="">Select Class</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <FormLabel>Section <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                        <option value="">Select Section</option>
                                        {sections.map(sec => (
                                            <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>

                            </Row>
                            <Row>
                                <Col md={6}>
                                    <FormLabel>Exam Type <span className="text-danger">*</span></FormLabel>
                                    <Form.Select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                                        <option value="">Select Exam</option>
                                        {exams.map(ex => (
                                            <option key={ex._id} value={ex._id}>{ex.examName}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Button onClick={loadStudents} disabled={!selectedClass || !selectedSection || !selectedExam}>
                                Load Students
                            </Button>
                        </div>
                    </div>

                    <div className="cover-sheet">
                        {students.length > 0 && (
                            <>
                                <div className="tableSheet">
                                    <h2>Remarks Entry (Student Wise)</h2>
                                    {selectedExamObj && (
                                        <p><strong>Exam:</strong> {selectedExamObj.examName}</p>
                                    )}
                                    <Table columns={columns} data={students} />
                                </div>
                                {hasSubmitAccess && (
                                    <Button className="mt-3" onClick={handleSubmitRemarks}>
                                        Update Remarks
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(StudentRemarksEntry), { ssr: false });
