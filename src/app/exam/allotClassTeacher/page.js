"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import axios from "axios";

import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import {
  addNewClassTeacherAllotment,
  deleteClassTeacherAllotmentById,
  getAllEmployee,
  getClasses,
  getClassTecherAllotments,
  getSections
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ClassTeacherAllotment = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allotments, setAllotments] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [allotDate, setAllotDate] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchAllotments();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection("");
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data || []);
    } catch {
      toast.error("Failed to load classes");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const res = await getSections(classId);
      setSections(res.data || []);
    } catch {
      toast.error("Failed to load sections");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await getAllEmployee();
      setTeachers(res.data || []);
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  const fetchAllotments = async () => {
    setFetching(true);
    try {
      const res = await getClassTecherAllotments();
      setAllotments(res.data || []);
    } catch {
      toast.error("Failed to load allotments");
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedClass) newErrors.class = "Class is required";
    if (!selectedSection) newErrors.section = "Section is required";
    if (!selectedTeacher) newErrors.teacher = "Teacher is required";
    if (!allotDate) newErrors.date = "Allotment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await addNewClassTeacherAllotment({
        class: selectedClass,
        section: selectedSection,
        teacher: selectedTeacher,
        allotDate,
      });
      toast.success("Allotment saved");
      resetForm();
      fetchAllotments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSelectedTeacher("");
    setAllotDate("");
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      await deleteClassTeacherAllotmentById(id);
      toast.success("Deleted successfully");
      fetchAllotments();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Class", "Section", "Teacher", "Date"];
    const rows = allotments.map((item, idx) =>
      `${idx + 1}\t${item.class?.class_name || "N/A"}\t${item.section?.section_name || "N/A"}\t${item.teacher?.employee_name || "N/A"}\t${new Date(item.allotDate).toLocaleDateString()}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Class", "Section", "Teacher", "Date"]];
    const rows = allotments.map((item, idx) => [
      idx + 1,
      item.class?.class_name || "N/A",
      item.section?.section_name || "N/A",
      item.teacher?.employee_name || "N/A",
      new Date(item.allotDate).toLocaleDateString()
    ]);
    printContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px"
    },
    {
      name: "Class",
      selector: row => row.class?.class_name || "N/A",
      sortable: true
    },
    {
      name: "Section",
      selector: row => row.section?.section_name || "N/A",
      sortable: true
    },
    {
      name: "Teacher",
      selector: row => row.teacher?.employee_name || "N/A",
      sortable: true
    },
    {
      name: "Date",
      selector: row => row.allotDate ? new Date(row.allotDate).toLocaleDateString() : "N/A",
      sortable: true
    },
    hasEditAccess && {
      name: "Action",
      cell: row => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(row._id)}
        >
          Delete
        </Button>
      )
    }
  ];

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Allot Class-Teacher", link: null },
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

      <Container className="cover-sheet mt-4">
        <div className="formSheet mb-4">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Class <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setErrors({ ...errors, class: "" });
                }}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                ))}
              </Form.Select>
              {errors.class && <div className="text-danger small mt-1">{errors.class}</div>}
            </Col>
            <Col md={6}>
              <Form.Label>Section <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setErrors({ ...errors, section: "" });
                }}
                disabled={!selectedClass}
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                ))}
              </Form.Select>
              {errors.section && <div className="text-danger small mt-1">{errors.section}</div>}
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Label>Teacher <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedTeacher}
                onChange={(e) => {
                  setSelectedTeacher(e.target.value);
                  setErrors({ ...errors, teacher: "" });
                }}
              >
                <option value="">Select Teacher</option>
                {teachers.map(tch => (
                  <option key={tch._id} value={tch._id}>{tch.employee_name}</option>
                ))}
              </Form.Select>
              {errors.teacher && <div className="text-danger small mt-1">{errors.teacher}</div>}
            </Col>
            <Col md={6}>
              <Form.Label>Allot Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                value={allotDate}
                onChange={(e) => {
                  setAllotDate(e.target.value);
                  setErrors({ ...errors, date: "" });
                }}
              />
              {errors.date && <div className="text-danger small mt-1">{errors.date}</div>}
            </Col>
          </Row>
          {
            hasSubmitAccess && (
              <Button className="mt-3" onClick={handleSubmit} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
              </Button>
            )
          }
        </div>

        <div className="tableSheet">
          {fetching ? (
            <p>Loading...</p>
          ) : (
            <Table
              columns={columns}
              data={allotments}
              handleCopy={handleCopy}
              handlePrint={handlePrint}
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(ClassTeacherAllotment), { ssr: false });
