"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addNewExamGrade, BASE_URL, deleteExamGradeById, getAllExamGrades, updateExamGradeById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ExamGradeMaster = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    min_marks: "",
    max_marks: "",
    grade_name: "",
    grade_point: "",
    remarks: "",
  });

  const validateForm = (data) => {
    const errors = {};
    if (data.min_marks === "" || data.min_marks === null)
      errors.min_marks = "From marks is required";
    else if (isNaN(data.min_marks) || data.min_marks < 0 || data.min_marks > 100)
      errors.min_marks = "From marks must be between 0 and 100";

    if (data.max_marks === "" || data.max_marks === null)
      errors.max_marks = "To marks is required";
    else if (isNaN(data.max_marks) || data.max_marks < 0 || data.max_marks > 100)
      errors.max_marks = "To marks must be between 0 and 100";
    else if (Number(data.min_marks) >= Number(data.max_marks))
      errors.max_marks = "To marks must be greater than From marks";

    if (!data.grade_name || data.grade_name.trim() === "")
      errors.grade_name = "Grade name is required";

    if (data.grade_point === "" || data.grade_point === null)
      errors.grade_point = "Grade point is required";
    else if (isNaN(data.grade_point) || data.grade_point < 0 || data.grade_point > 10)
      errors.grade_point = "Grade point must be between 0 and 10";

    return errors;
  };

  const handlePrint = () => {
    const headers = [["#", "From", "To", "Grade", "Grade Point", "Remarks"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.min_marks,
      row.max_marks,
      row.grade_name,
      row.grade_point,
      row.remarks,
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "From", "To", "Grade", "Grade Point", "Remarks"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.min_marks}\t${row.max_marks}\t${row.grade_name}\t${row.grade_point}\t${row.remarks}`
    );
    copyContent(headers, rows);
  };

  const handleEdit = (row) => {
    setFormData({
      min_marks: row.min_marks,
      max_marks: row.max_marks,
      grade_name: row.grade_name,
      grade_point: row.grade_point,
      remarks: row.remarks,
    });
    setFormErrors({});
    setEditId(row._id);
    setIsEditMode(true);
    setIsPopoverOpen(true);
  };

  const handleSubmit = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      if (isEditMode && editId) {
        const res = await updateExamGradeById(editId, formData);
        toast.success("Grade updated successfully");
        fetchData()
      } else {
        const res = await addNewExamGrade(formData)
        toast.success("Grade added successfully");
        fetchData()
      }
      setFormData({ min_marks: "", max_marks: "", grade_name: "", grade_point: "", remarks: "" });
      setIsPopoverOpen(false);
      setFormErrors({});
      setIsEditMode(false);
      setEditId(null);
    } catch {
      toast.error(isEditMode ? "Failed to update grade" : "Failed to add grade");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure to delete?")) return;
    try {
      await deleteExamGradeById(id)
      toast.success("Grade deleted successfully");
      fetchData()
    } catch (err) {
      console.error("Failed to delete grade", err);
      toast.error(err.response.data.message || "Failed to delete grade");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllExamGrades()
      setData(res.data || []);
    } catch (err) {
      setError("Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    { name: "From", selector: (row) => row.min_marks || "N/A", sortable: true },
    { name: "To", selector: (row) => row.max_marks || "N/A" },
    { name: "Grade", selector: (row) => row.grade_name || "N/A" },
    { name: "Grade Point", selector: (row) => row.grade_point || "N/A", sortable: true },
    { name: "Remarks", selector: (row) => row.remarks || "N/A" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <>
          <Button variant="success" size="sm" className="me-2" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </>
      ),
    },
  ].filter(Boolean); // Filter out any undefined actions

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Exam Grade Master", link: null },
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
          {hasSubmitAccess && (
            <Button onClick={() => {
              setIsPopoverOpen(true);
              setFormErrors({});
              setIsEditMode(false);
              setFormData({ min_marks: "", max_marks: "", grade_name: "", grade_point: "", remarks: "" });
            }} className="btn-add">
              <CgAddR /> Add Exam Grade
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditMode ? "Edit" : "Add New"} Exam Grade</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormErrors({});
                    setIsEditMode(false);
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={4}>
                    <FormLabel className="labelForm">From<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      name="min_marks"
                      value={formData.min_marks}
                      onChange={handleInputChange}
                    />
                    {formErrors.min_marks && <p className="text-danger small">{formErrors.min_marks}</p>}
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">To<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      name="max_marks"
                      value={formData.max_marks}
                      onChange={handleInputChange}
                    />
                    {formErrors.max_marks && <p className="text-danger small">{formErrors.max_marks}</p>}
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Grade<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      name="grade_name"
                      value={formData.grade_name}
                      onChange={handleInputChange}
                    />
                    {formErrors.grade_name && <p className="text-danger small">{formErrors.grade_name}</p>}
                  </Col>
                  <Col lg={4} className="mt-3">
                    <FormLabel className="labelForm">Grade Point<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      name="grade_point"
                      value={formData.grade_point}
                      onChange={handleInputChange}
                    />
                    {formErrors.grade_point && <p className="text-danger small">{formErrors.grade_point}</p>}
                  </Col>
                  <Col lg={8} className="mt-3">
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl
                      type="text"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>
                <Button onClick={handleSubmit} className="btn btn-primary">
                  {isEditMode ? "Update Grade" : "Add Grade"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Exam Grade Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExamGradeMaster), { ssr: false });