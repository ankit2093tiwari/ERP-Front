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
  FormSelect,
  FormCheck,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import {
  addNewSubject,
  deleteSubjectById,
  getAllEmployee,
  getAllSubjects,
  getClasses,
  getSections,
  updateSubjectById,
} from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const SubjectMaster = () => {
  const selectedSessionId = useSessionId();
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [fieldsError, setFieldsError] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState(null);

  const [formData, setFormData] = useState({
    class_name: "",
    section_name: "",
    subject_name: "",
    compulsory: false,
    employee: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchEmployees();
    fetchSubjects();
  }, [selectedSessionId]);

  const fetchClasses = async () => {
    try {
      const response = await getClasses();
      setClassList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId);
      setSectionList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getAllEmployee();
      setEmployeeList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllSubjects();
      setSubjectList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setError("Failed to fetch subjects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.class_name.trim()) errors.class_name = "Class is required";
    if (!formData.subject_name.trim()) errors.subject_name = "Subject name is required";
    if (!formData.employee.trim()) errors.employee = "Teacher is required";
    if (!formData.section_name.trim()) errors.section_name = "Section name is required";
    setFieldsError(errors);
    if (Object.keys(errors).length > 0) return;

    const subjectData = {
      class_name: formData.class_name,
      section_name: formData.section_name || null,
      subject_name: formData.subject_name,
      compulsory: formData.compulsory,
      employee: formData.employee,
    };

    try {
      if (isEditing) {
        await updateSubjectById(editSubjectId, subjectData);
        toast.success("Subject updated successfully!");
      } else {
        await addNewSubject(subjectData);
        toast.success("Subject added successfully!");
      }
      fetchSubjects();
      resetForm();
      setIsPopoverOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error processing subject");
      console.error("Error submitting subject", error);
      setError("Failed to process subject. Please try again later.");
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      class_name: subject.class_name?._id || "",
      section_name: subject.section_name?._id || "",
      subject_name: subject.subject_details.subject_name,
      compulsory: subject.subject_details.compulsory,
      employee: subject.subject_details.employee?._id || "",
    });
    fetchSections(subject.class_name?._id);
    setIsEditing(true);
    setEditSubjectId(subject._id);
    setIsPopoverOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubjectById(id);
        toast.success("Subject deleted successfully.");
        fetchSubjects();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error deleting subject");
        console.error("Error deleting subject", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      class_name: "",
      section_name: "",
      subject_name: "",
      compulsory: false,
      employee: "",
    });
    setFieldsError({});
    setIsEditing(false);
    setEditSubjectId(null);
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Section Name", "Subject & Teacher", "Compulsory"]];
    const tableRows = subjectList.map((row, index) => [
      index + 1,
      row.class_name?.class_name || "N/A",
      row.section_name?.section_name || "N/A",
      `${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}`,
      row.subject_details.compulsory ? "Yes" : "No",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Section Name", "Subject & Teacher", "Compulsory"];
    const rows = subjectList.map((row, index) =>
      `${index + 1}\t${row.class_name?.class_name || "N/A"}\t${row.section_name?.section_name || "N/A"}\t${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}\t${row.subject_details.compulsory ? "Yes" : "No"}`
    );
    copyContent(headers, rows);
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Class Name",
      selector: (row) => row.class_name?.class_name || "N/A",
      sortable:true
    },
    {
      name: "Section Name",
      selector: (row) => row.section_name?.section_name || "N/A",
    },
    {
      name: "Subject & Teacher",
      selector: (row) =>
        `${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}`,
    },
    {
      name: "Compulsory",
      selector: (row) => (row.subject_details.compulsory ? "Yes" : "No"),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "subject-master", link: null },
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
            <Button onClick={() => { resetForm(); setIsPopoverOpen(true); }} className="btn-add">
              <CgAddR /> Add Subject
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? "Edit Subject" : "Add New Subject"}</h2>
                <button className="closeForm" onClick={() => { setIsPopoverOpen(false); resetForm(); }}>
                  X
                </button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Select Class<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.class_name}
                      onChange={(e) => {
                        setFormData({ ...formData, class_name: e.target.value });
                        fetchSections(e.target.value);
                        setFieldsError({ ...fieldsError, class_name: "" });
                      }}
                      isInvalid={!!fieldsError.class_name}
                    >
                      <option value="">Select Class</option>
                      {classList.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </FormSelect>
                    {fieldsError.class_name && <div className="text-danger">{fieldsError.class_name}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel>Select Section<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.section_name}
                      onChange={(e) => {
                        setFormData({ ...formData, section_name: e.target.value });
                        setFieldsError({ ...fieldsError, section_name: "" });
                      }}
                      isInvalid={!!fieldsError.section_name}
                    >
                      <option value="">Select Section</option>
                      {sectionList.map((sec) => (
                        <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                      ))}
                    </FormSelect>
                    {fieldsError.section_name && <div className="text-danger">{fieldsError.section_name}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Subject Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={formData.subject_name}
                      onChange={(e) => {
                        setFormData({ ...formData, subject_name: e.target.value });
                        setFieldsError({ ...fieldsError, subject_name: "" });
                      }}
                      isInvalid={!!fieldsError.subject_name}
                    />
                    {fieldsError.subject_name && <div className="text-danger">{fieldsError.subject_name}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel>Teacher<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.employee}
                      onChange={(e) => {
                        setFormData({ ...formData, employee: e.target.value });
                        setFieldsError({ ...fieldsError, employee: "" });
                      }}
                      isInvalid={!!fieldsError.employee}
                    >
                      <option value="">Select Teacher</option>
                      {employeeList.map((emp) => (
                        <option key={emp._id} value={emp._id}>{emp.employee_name}</option>
                      ))}
                    </FormSelect>
                    {fieldsError.employee && <div className="text-danger">{fieldsError.employee}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col>
                    <FormCheck
                      type="checkbox"
                      label="Compulsory Subject"
                      checked={formData.compulsory}
                      onChange={(e) => setFormData({ ...formData, compulsory: e.target.checked })}
                    />
                  </Col>
                </Row>

                <Button onClick={handleSubmit} className="btn btn-primary">
                  {isEditing ? "Update Subject" : "Add Subject"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Subject Master</h2>
            {error && <p className="text-danger">{error}</p>}
            {loading ? <p>Loading...</p> : (
              <Table
                columns={columns}
                data={subjectList}
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

export default dynamic(() => Promise.resolve(SubjectMaster), { ssr: false });
