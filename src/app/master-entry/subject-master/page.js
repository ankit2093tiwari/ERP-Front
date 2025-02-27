"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb,FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import axios from "axios";

const SubjectMaster = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [compulsory, setCompulsory] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [editId, setEditId] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Class Name",
      selector: (row) => row.class_name?.class_name || "N/A",
      sortable: true,
    },
    {
      name: "Section Name",
      selector: (row) => row.section_name?.section_name || "N/A",
      sortable: true,
    },
    {
      name: "Subject & Teacher",
      selector: (row) =>
        `${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}`,
      sortable: true,
    },
    {
      name: "Compulsory",
      selector: (row) => (row.subject_details.compulsory ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-employee");
      setEmployeeList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-subject");
      setSubjectList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      setError("Failed to fetch subjects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateSubject = async () => {
    if (!selectedClass || !subjectName || !selectedEmployee) {
      alert("Please fill all required fields");
      return;
    }

    const subjectData = {
      class_name: selectedClass,
      section_name: selectedSection || null,
      subject_name: subjectName,
      compulsory,
      employee: selectedEmployee,
    };

    try {
      if (editId) {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-subject/${editId}`, subjectData);
      } else {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/create-subject", subjectData);
      }
      fetchSubjects();
      resetForm();
    } catch (error) {
      console.error("Error adding/updating subject", error);
    }
  };

  const handleEdit = (subject) => {
    setEditId(subject._id);
    setSelectedClass(subject.class_name?._id || "");
    setSelectedSection(subject.section_name?._id || "");
    setSubjectName(subject.subject_details.subject_name);
    setCompulsory(subject.subject_details.compulsory);
    setSelectedEmployee(subject.subject_details.employee?._id || "");
    fetchSections(subject.class_name?._id);
  };

  const handleSave = async (id) => {
    await handleAddOrUpdateSubject();
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-subject/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject", error);
      }
    }
  };

  const resetForm = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSubjectName("");
    setCompulsory(false);
    setSelectedEmployee("");
    setEditId(null);
  };

  const handlePrint = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const tableHeaders = [["#", "Class Name", "Section Name", "Subject & Teacher", "Compulsory"]];
    const tableRows = subjectList.map((row, index) => [
      index + 1,
      row.class_name?.class_name || "N/A",
      row.section_name?.section_name || "N/A",
      `${row.subject_details.subject_name} - ${row.subject_details.employee?.employee_name}`,
      row.subject_details.compulsory ? "Yes" : "No",
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Section Name", "Subject & Teacher", "Compulsory"].join("\t");
    const rows = subjectList
      .map((row, index) =>
        `${index + 1}\t${row.class_name?.class_name || "N/A"}\t${row.section_name?.section_name || "N/A"}\t${
          row.subject_details.subject_name
        } - ${row.subject_details.employee?.employee_name}\t${row.subject_details.compulsory ? "Yes" : "No"}`
      )
      .join("\n");
    const fullData = `${headers}\n${rows}`;

    navigator.clipboard
      .writeText(fullData)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Failed to copy table data to clipboard."));
  };

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
            <Breadcrumb.Item active>Subject Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Button onClick={() => setShowAddForm(!showAddForm)} className="mb-4">
        <CgAddR /> {showAddForm ? "Close Form" : "Add Subject"}
      </Button>
      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add Subject</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col>
                <FormLabel>Select Class</FormLabel>
                <FormSelect
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
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
              <Col>
                <FormLabel>Select Section (Optional)</FormLabel>
                <FormSelect
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
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
            <Row className="mt-3">
              <Col>
                <FormLabel>Enter Subject Name</FormLabel>
                <FormControl
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </Col>
              <Col>
                <FormLabel>Select Teacher</FormLabel>
                <FormSelect
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employeeList.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.employee_name}
                    </option>
                  ))}
                </FormSelect>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="Compulsory Subject"
                  checked={compulsory}
                  onChange={(e) => setCompulsory(e.target.checked)}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Button onClick={handleAddOrUpdateSubject}>
                  {editId ? "Update Subject" : "Add Subject"}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Subject Master</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table columns={columns} data={subjectList} handleCopy={handleCopy} handlePrint={handlePrint} />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SubjectMaster;