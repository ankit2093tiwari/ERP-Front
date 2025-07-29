"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Container, Row, Col, FormLabel, Form, Button, Alert } from "react-bootstrap";
import { addNewExamMaster, getAllEmployee, getAllExamTypes, getClasses, getSubjectByClassId } from "@/Services";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";

const timeOptions = [...Array(12)].map((_, i) => String(i + 1).padStart(2, "0"));
const minuteOptions = ["00", "15", "30", "45"];
const amPmOptions = ["AM", "PM"];

const ExamMaster = () => {
  const { hasSubmitAccess } = usePagePermission()

  const [examTypes, setExamTypes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examDetails, setExamDetails] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Exam Master", link: null },
  ];

  useEffect(() => {
    (async () => {
      try {
        const [etRes, clsRes, tchRes] = await Promise.all([
          getAllExamTypes(),
          getClasses(),
          getAllEmployee(),
        ]);
        setExamTypes(etRes.data || []);
        setClasses(clsRes.data || []);
        setTeachers(tchRes.data || []);
      } catch {
        toast.error("Failed to fetch dropdown data.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjectsByClass = async () => {
      try {
        const res = await getSubjectByClassId(selectedClass);
        const subjectsData = res.data || [];
        setSubjects(subjectsData);
        const initialized = subjectsData.map((sub) => ({
          subjectId: sub._id,
          subjectName: sub.subject_details?.subject_name || "N/A",
          examDate: "",
          fromTime: { hour: "09", minute: "00", ampm: "AM" },
          toTime: { hour: "12", minute: "00", ampm: "PM" },
          maxMarks: "",
          minMarks: "",
          practicalMax: "",
          practicalMin: "",
          examHolder: "",
        }));
        setExamDetails(initialized);
      } catch {
        toast.error("Failed to fetch subjects.");
      }
    };

    fetchSubjectsByClass();
  }, [selectedClass]);


  const handleDetailChange = (index, field, value) => {
    const updated = [...examDetails];
    if (field.includes("-")) {
      const [section, part] = field.split("-");
      updated[index][`${section}Time`] = {
        ...updated[index][`${section}Time`],
        [part]: value,
      };
    } else {
      updated[index][field] = value;
    }
    setExamDetails(updated);
  };

  const handleSubmit = async () => {
    if (!selectedExamType || !selectedClass) {
      return toast.error("Exam Type and Class are required.");
    }

    // Validate examDetails
    for (let i = 0; i < examDetails.length; i++) {
      const d = examDetails[i];
      if (!d.examDate || d.examDate.trim() === "") {
        return toast.error(`Exam Date is required for subject #${i + 1} (${d.subjectName}).`);
      }
      if (!d.maxMarks || !d.minMarks) {
        return toast.error(`Marks are required for subject #${i + 1} (${d.subjectName}).`);
      }
    }

    // Lookup names
    const classObj = classes.find(c => c._id === selectedClass);
    const className = classObj?.class_name || "Class";

    const examTypeObj = examTypes.find(e => e._id === selectedExamType);
    const examTypeName = examTypeObj?.examTypeName || "Exam";
    // Build payload to match your backend
    const payload = {
      examName: `${className}-${examTypeName}`,
      examType: selectedExamType,
      class: selectedClass,
      examDetails: examDetails.map((d) => ({
        subject: d.subjectId, // renamed to match backend schema
        examDate: d.examDate,
        fromTime: `${d.fromTime.hour}:${d.fromTime.minute} ${d.fromTime.ampm}`,
        toTime: `${d.toTime.hour}:${d.toTime.minute} ${d.toTime.ampm}`,
        maxMarks: Number(d.maxMarks),
        minMarks: Number(d.minMarks),
        practicalMaxMarks: Number(d.practicalMax || 0),
        practicalMinMarks: Number(d.practicalMin || 0),
        examHolder: d.examHolder || undefined,
      })),
    };

    try {
      await addNewExamMaster(payload);
      toast.success("Exam saved successfully.");
      // reset
      setExamDetails([]);
      setSelectedClass("");
      setSelectedExamType("");
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error(error.response.data.message || "Failed to save exam.");
    }
  };



  const columns = [
    {
      name: "#",
      selector: (_, i) => i + 1,
      width: "60px",
    },
    {
      name: "Subject",
      selector: (row) => row.subjectName,
    },
    {
      name: "Date",
      cell: (row, index) => (
        <input
          type="date"
          className="form-control"
          value={row.examDate}
          onChange={(e) => handleDetailChange(index, "examDate", e.target.value)}
        />
      ),
      width: "180px",
    },
    {
      name: "From",
      cell: (row, index) => (
        <div className="d-flex flex-column gap-1">
          <select className="form-select" value={row.fromTime.hour} onChange={(e) => handleDetailChange(index, "from-hour", e.target.value)}>
            {timeOptions.map((h) => <option key={h}>{h}</option>)}
          </select>
          <select className="form-select" value={row.fromTime.minute} onChange={(e) => handleDetailChange(index, "from-minute", e.target.value)}>
            {minuteOptions.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select className="form-select" value={row.fromTime.ampm} onChange={(e) => handleDetailChange(index, "from-ampm", e.target.value)}>
            {amPmOptions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      ),
    },
    {
      name: "To",
      cell: (row, index) => (
        <div className="d-flex flex-column gap-1">
          <select className="form-select" value={row.toTime.hour} onChange={(e) => handleDetailChange(index, "to-hour", e.target.value)}>
            {timeOptions.map((h) => <option key={h}>{h}</option>)}
          </select>
          <select className="form-select" value={row.toTime.minute} onChange={(e) => handleDetailChange(index, "to-minute", e.target.value)}>
            {minuteOptions.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select className="form-select" value={row.toTime.ampm} onChange={(e) => handleDetailChange(index, "to-ampm", e.target.value)}>
            {amPmOptions.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      ),
    },
    {
      name: "Max",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.maxMarks}
          onChange={(e) => handleDetailChange(index, "maxMarks", e.target.value)}
        />
      ),
    },
    {
      name: "Min",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.minMarks}
          onChange={(e) => handleDetailChange(index, "minMarks", e.target.value)}
        />
      ),
    },
    {
      name: "P-Max",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.practicalMax}
          onChange={(e) => handleDetailChange(index, "practicalMax", e.target.value)}
        />
      ),
    },
    {
      name: "P-Min",
      cell: (row, index) => (
        <input
          type="number"
          className="form-control"
          value={row.practicalMin}
          onChange={(e) => handleDetailChange(index, "practicalMin", e.target.value)}
        />
      ),
    },
    {
      name: "Exam Holder",
      cell: (row, index) => (
        <select
          className="form-select"
          value={row.examHolder}
          onChange={(e) => handleDetailChange(index, "examHolder", e.target.value)}
        >
          <option value="">Select</option>
          {teachers.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.employee_name}
            </option>
          ))}
        </select>
      ),
      width: "150px",
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
                  <FormLabel>Exam Type *</FormLabel>
                  <Form.Select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((et) => (
                      <option key={et._id} value={et._id}>
                        {et.examTypeName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <FormLabel>Class *</FormLabel>
                  <Form.Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              {hasSubmitAccess && (
                <Button onClick={handleSubmit} disabled={!selectedClass || !selectedExamType}>Submit</Button>
              )}
            </div>
          </div>
          {!selectedExamType || !selectedClass ? (
            <Alert variant="info">Please select an Exam Type and Class to view or add exam details.</Alert>
          ) : (
            <div className="tableSheet">
              <h5>Exam Details (Subject Wise)</h5>
              <Table
                columns={columns}
                data={examDetails}
                handlePrint={() => { }}
                handleCopy={() => { }}
              />
            </div>
          )}
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExamMaster), { ssr: false });
