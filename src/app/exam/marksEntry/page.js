"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, Form, FormLabel, Button, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";
import {
  getClasses,
  getSections,
  getExamMasterByClassId,
  getSubjectByClassId,
  getStudentsByClassAndSection,
  addExamMarksEntry,
} from "@/Services";
import useSessionId from "@/hooks/useSessionId";

const MarksEntry = () => {
  const { hasSubmitAccess } = usePagePermission();
  const selectedSessionId = useSessionId()

  // Data States
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  // Selected values
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Bulk inputs
  const [bulkMarks, setBulkMarks] = useState("");
  const [bulkPractical, setBulkPractical] = useState("");
  const [bulkRemarks, setBulkRemarks] = useState("");

  // Input refs for auto focus
  const inputRefs = useRef([]);

  // Breadcrumb
  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Marks Entry", link: null },
  ];

  // Load initial classes
  useEffect(() => {
    (async () => {
      try {
        const clsRes = await getClasses();
        setClasses(clsRes.data || []);
      } catch {
        toast.error("Failed to fetch classes.");
      }
    })();
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
      fetchSubjects();
      fetchExams();
    } else {
      setSections([]);
      setSubjects([]);
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

  const fetchSubjects = async () => {
    try {
      const res = await getSubjectByClassId(selectedClass);
      setSubjects(res.data || []);
    } catch {
      toast.error("Failed to fetch subjects.");
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
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) {
      return toast.error("Please select all fields before loading students.");
    }

    try {
      const res = await getStudentsByClassAndSection(selectedClass, selectedSection);
      const data = res.data || [];
      const initialized = data.map(stu => ({
        studentId: stu._id,
        studentName: stu.first_name + " " + stu.last_name,
        rollNo: stu.roll_no,
        marksObtained: "",
        practicalMarksObtained: "",
        remarks: "",
        errors: {}
      }));
      setStudents(initialized);
    } catch {
      toast.error("Failed to load students.");
    }
  };

  // Validation
  const validateStudents = () => {
    let isValid = true;
    const updated = students.map(stu => {
      let errors = {};
      if (stu.marksObtained === "" || stu.marksObtained < 0 || stu.marksObtained > 100) {
        errors.marksObtained = "Marks should be between 0 and 100.";
        isValid = false;
      }
      if (stu.practicalMarksObtained !== "" && (stu.practicalMarksObtained < 0 || stu.practicalMarksObtained > 100)) {
        errors.practicalMarksObtained = "Practical marks should be between 0 and 100.";
        isValid = false;
      }
      return { ...stu, errors };
    });
    setStudents(updated);
    return isValid;
  };

  const handleMarkChange = (id, field, value) => {
    setStudents(prev =>
      prev.map(s => s.studentId === id ? {
        ...s,
        [field]: field.includes("Marks") ? Number(value) : value,
        errors: { ...s.errors, [field]: "" }
      } : s)
    );
  };

  // Enter key to focus next
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Bulk fills
  const applyBulkMarks = (val) => {
    let num = Number(val);
    if (isNaN(num) || num < 0 || num > 100) {
      return toast.error("Marks must be between 0 and 100.");
    }
    setStudents(prev => prev.map(s => ({ ...s, marksObtained: num, errors: { ...s.errors, marksObtained: "" } })));
  };

  const applyBulkPractical = (val) => {
    let num = Number(val);
    if (isNaN(num) || num < 0 || num > 100) {
      return toast.error("Practical marks must be between 0 and 100.");
    }
    setStudents(prev => prev.map(s => ({ ...s, practicalMarksObtained: num, errors: { ...s.errors, practicalMarksObtained: "" } })));
  };

  const applyBulkRemarks = (val) => {
    setStudents(prev => prev.map(s => ({ ...s, remarks: val })));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) {
      return toast.error("All selection fields are required.");
    }

    if (!validateStudents()) {
      return toast.error("Fix validation errors before submitting.");
    }

    const payload = {
      exam: selectedExam,
      subject: selectedSubject,
      class: selectedClass,
      section: selectedSection,
      marks: students.map(s => ({
        student: s.studentId,
        marksObtained: Number(s.marksObtained),
        practicalMarksObtained: s.practicalMarksObtained ? Number(s.practicalMarksObtained) : 0,
        remarks: s.remarks
      }))
    };

    try {
      await addExamMarksEntry(payload);
      toast.success("Marks saved successfully.");
      setStudents([]);
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error(error.response?.data?.message || "Failed to save marks.");
    }
  };

  // Table columns
  const columns = [
    { name: "#", selector: (_, i) => i + 1, width: "60px" },
    { name: "Roll No", selector: (row) => row.rollNo, sortable: true },
    { name: "Name", selector: (row) => row.studentName },
    {
      name: "Marks",
      cell: (row, index) => (
        <div>
          <input
            ref={el => inputRefs.current[index] = el}
            type="number"
            className={`form-control ${row.errors?.marksObtained ? "is-invalid" : ""}`}
            min={0}
            max={100}
            value={row.marksObtained}
            onChange={(e) => handleMarkChange(row.studentId, "marksObtained", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
          {row.errors?.marksObtained && (
            <div className="invalid-feedback">{row.errors.marksObtained}</div>
          )}
        </div>
      )
    },
    {
      name: "Practical",
      cell: (row) => (
        <div>
          <input
            type="number"
            className={`form-control ${row.errors?.practicalMarksObtained ? "is-invalid" : ""}`}
            min={0}
            max={100}
            value={row.practicalMarksObtained}
            onChange={(e) => handleMarkChange(row.studentId, "practicalMarksObtained", e.target.value)}
          />
          {row.errors?.practicalMarksObtained && (
            <div className="invalid-feedback">{row.errors.practicalMarksObtained}</div>
          )}
        </div>
      )
    },
    {
      name: "Remarks",
      cell: (row) => (
        <input
          type="text"
          className="form-control"
          value={row.remarks}
          onChange={(e) => handleMarkChange(row.studentId, "remarks", e.target.value)}
        />
      )
    },
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
                  <FormLabel>Subject <span className="text-danger">*</span></FormLabel>
                  <Form.Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subject_details?.subject_name || "N/A"}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <FormLabel>Exam <span className="text-danger">*</span></FormLabel>
                  <Form.Select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                    <option value="">Select Exam</option>
                    {exams.map(ex => (
                      <option key={ex._id} value={ex._id}>{ex.examName}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <Button onClick={loadStudents} disabled={!selectedClass || !selectedSection || !selectedSubject || !selectedExam}>
                Load Students
              </Button>
            </div>
          </div>

          {students.length > 0 ? (
            <div className="cover-sheet">
              <div className="tableSheet">
                <h2>Marks Entry (Student Wise)</h2>
                <div className="mb-3">
                  <Row>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder="Fill same marks for all"
                        value={bulkMarks}
                        onChange={(e) => setBulkMarks(e.target.value)}
                      />
                      <Button className="mt-2" onClick={() => applyBulkMarks(bulkMarks)}>Apply Marks</Button>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="number"
                        placeholder="Fill same practical marks for all"
                        value={bulkPractical}
                        onChange={(e) => setBulkPractical(e.target.value)}
                      />
                      <Button className="mt-2" onClick={() => applyBulkPractical(bulkPractical)}>Apply Practical</Button>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        placeholder="Fill same remarks for all"
                        value={bulkRemarks}
                        onChange={(e) => setBulkRemarks(e.target.value)}
                      />
                      <Button className="mt-2" onClick={() => applyBulkRemarks(bulkRemarks)}>Apply Remarks</Button>
                    </Col>
                  </Row>
                </div>
                <Table
                  columns={columns}
                  data={students}
                />
              </div>
              {hasSubmitAccess && (
                <Button className="mt-3" onClick={handleSubmit}>
                  Submit Marks
                </Button>
              )}
            </div>
          ) :
            <Alert variant="info">Please select an Exam , Subject, Class and Section to load students details.</Alert>
          }
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(MarksEntry), { ssr: false });
