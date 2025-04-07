"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
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
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const SubjectMaster = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    class_name: "",
    section_name: "",
    subject_name: "",
    compulsory: false,
    employee: "",
  });

  // Editable states
  const [editedData, setEditedData] = useState({
    class_name: "",
    section_name: "",
    subject_name: "",
    compulsory: false,
    employee: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Class Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedData.class_name}
            onChange={(e) =>
              setEditedData({ ...editedData, class_name: e.target.value })
            }
          >
            <option value="">Select Class</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.class_name}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.class_name?.class_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Section Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedData.section_name}
            onChange={(e) =>
              setEditedData({ ...editedData, section_name: e.target.value })
            }
          >
            <option value="">Select Section</option>
            {sectionList.map((sec) => (
              <option key={sec._id} value={sec._id}>
                {sec.section_name}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.section_name?.section_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Subject & Teacher",
      cell: (row) =>
        editingId === row._id ? (
          <div>
            <FormControl
              type="text"
              value={editedData.subject_name}
              onChange={(e) =>
                setEditedData({ ...editedData, subject_name: e.target.value })
              }
              placeholder="Subject Name"
              className="mb-2"
            />
            <FormSelect
              value={editedData.employee}
              onChange={(e) =>
                setEditedData({ ...editedData, employee: e.target.value })
              }
            >
              <option value="">Select Teacher</option>
              {employeeList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.employee_name}
                </option>
              ))}
            </FormSelect>
          </div>
        ) : (
          `${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}`
        ),
      sortable: true,
    },
    {
      name: "Compulsory",
      cell: (row) =>
        editingId === row._id ? (
          <FormCheck
            type="checkbox"
            label="Compulsory"
            checked={editedData.compulsory}
            onChange={(e) =>
              setEditedData({ ...editedData, compulsory: e.target.checked })
            }
          />
        ) : (
          row.subject_details.compulsory ? "Yes" : "No"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchClasses();
    fetchEmployees();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-classes"
      );
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`
      );
      setSectionList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-employee"
      );
      setEmployeeList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-subject"
      );
      setSubjectList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setError("Failed to fetch subjects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.class_name || !formData.subject_name || !formData.employee) {
      alert("Please fill all required fields");
      return;
    }

    const subjectData = {
      class_name: formData.class_name,
      section_name: formData.section_name || null,
      subject_name: formData.subject_name,
      compulsory: formData.compulsory,
      employee: formData.employee,
    };

    try {
      await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/create-subject",
        subjectData
      );
      fetchSubjects();
      resetForm();
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error adding subject", error);
      setError("Failed to add subject. Please try again later.");
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setEditedData({
      class_name: subject.class_name?._id || "",
      section_name: subject.section_name?._id || "",
      subject_name: subject.subject_details.subject_name,
      compulsory: subject.subject_details.compulsory,
      employee: subject.subject_details.employee?._id || "",
    });
    fetchSections(subject.class_name?._id);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/update-subject/${id}`,
        {
          class_name: editedData.class_name,
          section_name: editedData.section_name || null,
          subject_name: editedData.subject_name,
          compulsory: editedData.compulsory,
          employee: editedData.employee,
        }
      );
      fetchSubjects();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating subject", error);
      setError("Failed to update subject. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-subject/${id}`
        );
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject", error);
        setError("Failed to delete subject. Please try again later.");
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
  };

  const handlePrint = async () => {
    const tableHeaders = [
      ["#", "Class Name", "Section Name", "Subject & Teacher", "Compulsory"],
    ];
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
      `${index + 1}\t${row.class_name?.class_name || "N/A"}\t${
        row.section_name?.section_name || "N/A"
      }\t${row.subject_details.subject_name} - ${
        row.subject_details.employee?.employee_name
      }\t${row.subject_details.compulsory ? "Yes" : "No"}`
    );

    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "subject-master", link: "null" },
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
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Subject
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Subject</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Select Class</FormLabel>
                    <FormSelect
                      value={formData.class_name}
                      onChange={(e) => {
                        setFormData({ ...formData, class_name: e.target.value });
                        fetchSections(e.target.value);
                      }}
                    >
                      <option value="">Select Class</option>
                      {classList.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.class_name}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Select Section (Optional)</FormLabel>
                    <FormSelect
                      value={formData.section_name}
                      onChange={(e) =>
                        setFormData({ ...formData, section_name: e.target.value })
                      }
                    >
                      <option value="">Select Section</option>
                      {sectionList.map((sec) => (
                        <option key={sec._id} value={sec._id}>
                          {sec.section_name}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Subject Name</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.subject_name}
                      onChange={(e) =>
                        setFormData({ ...formData, subject_name: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Teacher</FormLabel>
                    <FormSelect
                      value={formData.employee}
                      onChange={(e) =>
                        setFormData({ ...formData, employee: e.target.value })
                      }
                    >
                      <option value="">Select Teacher</option>
                      {employeeList.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.employee_name}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <FormCheck
                      type="checkbox"
                      label="Compulsory Subject"
                      checked={formData.compulsory}
                      onChange={(e) =>
                        setFormData({ ...formData, compulsory: e.target.checked })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Subject
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Subject Master</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
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