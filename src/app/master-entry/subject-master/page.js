"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import axios from "axios";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { CgAddR } from 'react-icons/cg';

const SubjectMasterPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject_name: "", teacher_in_charge: "", class_name: "", section_name: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/subjects");
      setSubjects(response.data);
    } catch (err) {
      setError("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClasses(response.data.data);
    } catch (err) {
      setError("Failed to fetch classes");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };


  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setNewSubject({ ...newSubject, class_name: selectedClass, section_name: "" });
    fetchSections(selectedClass);
  };

  const handleAddSubject = async () => {
    if (newSubject.subject_name && newSubject.teacher_in_charge && newSubject.class_name && newSubject.section_name) {
      try {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/subjects", newSubject);
        fetchSubjects();
        setNewSubject({ subject_name: "", teacher_in_charge: "", class_name: "", section_name: "" });
        setShowAddForm(false);
      } catch (err) {
        setError("Failed to add subject");
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  const columns = [
    { name: "#", selector: (_, index) => index + 1, width: "80px" },
    { name: "Class Name", selector: (row) => row.class_name || "N/A" },
    { name: "Section Name", selector: (row) => row.section_name || "N/A" },
    { name: "Subject Name", selector: (row) => row.subject_name || "N/A" },
    { name: "Teacher In Charge", selector: (row) => row.teacher_in_charge || "N/A" },
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

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
        <Breadcrumb.Item active>Subject Master</Breadcrumb.Item>
      </Breadcrumb>

      <Button onClick={() => setShowAddForm(!showAddForm)} className={styles.search}>
        <CgAddR /> Add Subject
      </Button>

      {showAddForm && (
        <Form>
          <Row>
            <Col lg={6}>
              <FormLabel>Subject Name</FormLabel>
              <FormControl value={newSubject.subject_name} onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })} />
            </Col>
            <Col lg={6}>
              <FormLabel>Teacher In Charge</FormLabel>
              <FormControl value={newSubject.teacher_in_charge} onChange={(e) => setNewSubject({ ...newSubject, teacher_in_charge: e.target.value })} />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormLabel>Class Name</FormLabel>
              <FormControl as="select" value={newSubject.class_name} onChange={handleClassChange}>
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </FormControl>
            </Col>
            <Col lg={6}>
              <FormLabel>Section Name</FormLabel>
              <FormControl as="select" value={newSubject.section_name} onChange={(e) => setNewSubject({ ...newSubject, section_name: e.target.value })}>
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec._id} value={sec._id}>{sec.name}</option>
                ))}
              </FormControl>
            </Col>
          </Row>
          <Button onClick={handleAddSubject} className={styles.search}>Add Subject</Button>
        </Form>
      )}

      <Table columns={columns} data={subjects} />
    </Container>
  );
};

export default dynamic(() => Promise.resolve(SubjectMasterPage), { ssr: false });
