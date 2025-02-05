"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import axios from "axios";
import styles from "@/app/medical/routine-check-up/page.module.css"; // Use the same styles as in the Category page
import { CgAddR } from 'react-icons/cg';

const SubjectMasterPage = () => {
  const [subjects, setSubjects] = useState([]); // State for subjects
  const [newSubject, setNewSubject] = useState({ subject_name: "", teacher_in_charge: "", class_name: "", section_name: "" }); // New subject state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for add form
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [classes, setClasses] = useState([]); // State for classes
  const [sections, setSections] = useState([]); // State for sections

  // Table columns configuration
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Subject Name",
      selector: (row) => row.subject_name || "N/A",
      sortable: true,
    },
    {
      name: "Teacher In Charge",
      selector: (row) => row.teacher_in_charge || "N/A",
      sortable: false,
    },
    {
      name: "Class Name",
      selector: (row) => row.class_name || "N/A",
      sortable: false,
    },
    {
      name: "Section Name",
      selector: (row) => row.section_name || "N/A",
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch subjects from API
  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/subjects");
      const fetchedSubjects = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.data) ? response.data.data : [];
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to fetch subjects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes from API
  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      const fetchedClasses = Array.isArray(response.data) ? response.data : [];
      setClasses(fetchedClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to fetch classes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch sections based on selected class
  const fetchSections = async (classId) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections?classId=${classId}`);
      const fetchedSections = Array.isArray(response.data) ? response.data : [];
      setSections(fetchedSections);
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError("Failed to fetch sections. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new subject
  const handleAddSubject = async () => {
    if (newSubject.subject_name.trim() && newSubject.teacher_in_charge.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/subjects", newSubject);
        setSubjects((prevSubjects) => [...prevSubjects, response.data]);
        setNewSubject({ subject_name: "", teacher_in_charge: "", class_name: "", section_name: "" }); // Reset input fields
        setShowAddForm(false); // Hide the form
      } catch (err) {
        console.error("Error adding subject:", err);
        setError("Failed to add subject. Please try again later.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  // Handle editing a subject
  const handleEdit = async (id) => {
    const item = subjects.find((row) => row._id === id);
    const updatedName = prompt("Enter new subject name:", item?.subject_name || "");
    const updatedTeacherInCharge = prompt("Enter new teacher in charge:", item?.teacher_in_charge || "");
    const updatedClassName = prompt("Enter new class name:", item?.class_name || "");
    const updatedSectionName = prompt("Enter new section name:", item?.section_name || "");

    if (updatedName && updatedTeacherInCharge && updatedClassName && updatedSectionName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/subjects/${id}`, {
          subject_name: updatedName,
          teacher_in_charge: updatedTeacherInCharge,
          class_name: updatedClassName,
          section_name: updatedSectionName,
        });

        setSubjects((prevSubjects) =>
          prevSubjects.map((row) =>
            row._id === id ? { ...row, subject_name: updatedName, teacher_in_charge: updatedTeacherInCharge, class_name: updatedClassName, section_name: updatedSectionName } : row
          )
        );
        alert("Subject updated successfully!");
      } catch (err) {
        console.error("Error updating subject:", err);
        setError("Failed to update subject. Please try again later.");
      }
    }
  };

  // Handle deleting a subject
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/subjects/${id}`);
        setSubjects((prevSubjects) => prevSubjects.filter((row) => row._id !== id));
        alert("Subject deleted successfully!");
      } catch (err) {
        console.error("Error deleting subject:", err);
        setError("Failed to delete subject. Please try again later.");
      }
    }
  };

  // Fetch subjects and classes on component mount
  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  // Handle class change and fetch sections based on selected class
  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setNewSubject({ ...newSubject, class_name: selectedClass, section_name: "" }); // Reset section
    fetchSections(selectedClass);
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

      <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
        <CgAddR /> Add Subject
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add Subject</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)} style={{ fontSize: "24px", border: "none", background: "transparent", cursor: "pointer" }}>X</button>
          </div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Subject Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Subject Name"
                  value={newSubject.subject_name}
                  onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Teacher In Charge</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Teacher Name"
                  value={newSubject.teacher_in_charge}
                  onChange={(e) => setNewSubject({ ...newSubject, teacher_in_charge: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Class Name</FormLabel>
                <FormControl
                  as="select"
                  required
                  value={newSubject.class_name}
                  onChange={handleClassChange}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </FormControl>
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Section Name</FormLabel>
                <FormControl
                  as="select"
                  required
                  value={newSubject.section_name}
                  onChange={(e) => setNewSubject({ ...newSubject, section_name: e.target.value })}
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec._id} value={sec._id}>{sec.name}</option>
                  ))}
                </FormControl>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Button onClick={handleAddSubject} className={styles.search}>
                  Add Subject
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Subject Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={subjects} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(SubjectMasterPage), { ssr: false });
