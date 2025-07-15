"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { addNewExamType, deleteExamTypeById, getAllExamTypes, updateExamTypeById } from "@/Services";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const ExamTypeMaster = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    examTypeName: ''
  });
  const validate = (value) => {
    if (!value || value.trim() === "") return "Exam type name is required";
    if (value.length < 3) return "Name should be at least 3 characters";
    return "";
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Exam Type Name",
      cell: (row) => (
        row.examTypeName || "N/A"
      ),
      sortable: true,
    },
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
    }

  ];

  const handlePrint = () => {
    const tableHeaders = [["#", "Exam Type Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.examTypeName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Exam Type Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.examTypeName || "N/A"}`);
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllExamTypes()
      setData(response.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch exam types.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setFormData({ examTypeName: row.examTypeName });
    setIsPopoverOpen(true);
    setIsEditMode(true);
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this exam type?")) return;
    try {
      await deleteExamTypeById(id)
      setData(prev => prev.filter(row => row._id !== id));
      toast.success("Exam type deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete exam type.");
    }
  };

  const handleSubmit = async () => {
    const errMsg = validate(formData.examTypeName);
    if (errMsg) {
      setFormErrors({ examTypeName: errMsg });
      return;
    }
    setFormErrors({});

    try {
      if (isEditMode) {
        // update mode
        const res = await updateExamTypeById(editingId, {
          examTypeName: formData.examTypeName,
        })
        toast.success("Exam type updated successfully");
        fetchData()
      } else {
        // add mode
        const res = await addNewExamType({
          examTypeName: formData.examTypeName,
        })
        toast.success("Exam type added successfully");
        fetchData()
      }

      // Reset after success
      setFormData({ examTypeName: '' });
      setEditingId(null);
      setIsEditMode(false);
      setIsPopoverOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || (isEditMode ? "Failed to update exam type." : "Failed to add exam type."));
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" },
    { label: "Exam Type Master", link: null }
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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Exam Type
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditMode ? "Edit" : "Add New"} Exam Type</h2>

                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormData({ examTypeName: '' });
                    setEditingId(null);
                    setIsEditMode(false);
                    setFormErrors({});
                  }}

                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Exam Type Name</FormLabel>
                    <FormControl
                      type="text"
                      name="examTypeName"
                      placeholder="Enter Exam Type Name"
                      value={formData.examTypeName}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormErrors({ ...formErrors, examTypeName: "" }); // hide error on change
                      }}
                    />
                    {formErrors.examTypeName && (
                      <small className="text-danger">{formErrors.examTypeName}</small>
                    )}

                  </Col>
                </Row>
                <Button onClick={handleSubmit} className="btn btn-primary">
                  {isEditMode ? "Update Exam Type" : "Add Exam Type"}
                </Button>

              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Exam Type Records</h2>
            {loading && <p>Loading...</p>}
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

export default dynamic(() => Promise.resolve(ExamTypeMaster), { ssr: false });
