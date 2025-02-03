"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";

const ClassMasterPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionCode, setNewSectionCode] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [editClass, setEditClass] = useState(null);
  const [editSection, setEditSection] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/class/fetch");
      setClasses(response.data.data || []);
      console.log('teste',response.data )
    } catch (err) {
      setError("Failed to fetch class data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/sections/fetch");
      setSections(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch section data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  const handleAddClass = async () => {
    if (!newClassName.trim() || !newClassCode.trim()) {
      setFormErrors({ class_name: "Class name is required", class_code: "Class code is required" });
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/class/create", {
        class_name: newClassName,
        class_code: newClassCode,
      });
      fetchClasses();
      setNewClassName("");
      setNewClassCode("");
    } catch (err) {
      setError("Failed to add class.");
    }
  };

  const handleAddSection = async () => {
    if (!selectedClass || !newSectionName.trim() || !newSectionCode.trim()) {
      setFormErrors({ section_name: "Section name is required", section_code: "Section code is required" });
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/sections/create", {
        class_id: selectedClass,
        section_name: newSectionName,
        section_code: newSectionCode,
      });
      fetchSections();
      setNewSectionName("");
      setNewSectionCode("");
      setSelectedClass("");
    } catch (err) {
      setError("Failed to add section.");
    }
  };

  const handleEditClass = (cls) => {
    setEditClass(cls);
    setNewClassName(cls.class_name);
    setNewClassCode(cls.class_code);
  };

  const handleEditSection = (section) => {
    setEditSection(section);
    setNewSectionName(section.section_name);
    setNewSectionCode(section.section_code);
    setSelectedClass(section.class_id);
  };

  const handleUpdateClass = async () => {
    if (!newClassName.trim() || !newClassCode.trim()) {
      setFormErrors({ class_name: "Class name is required", class_code: "Class code is required" });
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/class/update/${id}`, {
        class_name: newClassName,
        class_code: newClassCode,
      });
      fetchClasses();
      setEditClass(null);
      setNewClassName("");
      setNewClassCode("");
    } catch (err) {
      setError("Failed to update class.");
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedClass || !newSectionName.trim() || !newSectionCode.trim()) {
      setFormErrors({ section_name: "Section name is required", section_code: "Section code is required" });
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/sections/update/${id}`, {
        class_id: selectedClass,
        section_name: newSectionName,
        section_code: newSectionCode,
      });
      fetchSections();
      setEditSection(null);
      setNewSectionName("");
      setNewSectionCode("");
      setSelectedClass("");
    } catch (err) {
      setError("Failed to update section.");
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/class/delete/${id}`);
      fetchClasses();
    } catch (err) {
      setError("Failed to delete class.");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/sections/delete/${id}`);
      fetchSections();
    } catch (err) {
      setError("Failed to delete section.");
    }
  };

  // Merging class and section data
  const mergedData = sections.map((section) => {
    const cls = classes.find((classData) => classData._id === section.class_id);
    return cls ? { ...section, class_name: cls.class_name, class_code: cls.class_code } : section;
  });

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
        <Breadcrumb.Item active>Class & Section Master</Breadcrumb.Item>
      </Breadcrumb>

      <Tabs className="mb-3" defaultActiveKey="class">
        <Tab eventKey="class" title={<span><CgAddR /> New Class</span>}>
          <Row>
            <Col>
              <FormLabel>Class Name</FormLabel>
              <FormControl value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
              {formErrors.class_name && <div className="text-danger">{formErrors.class_name}</div>}
            </Col>
            <Col>
              <FormLabel>Class Code</FormLabel>
              <FormControl value={newClassCode} onChange={(e) => setNewClassCode(e.target.value)} />
              {formErrors.class_code && <div className="text-danger">{formErrors.class_code}</div>}
            </Col>
          </Row>
          {editClass ? (
            <Button onClick={handleUpdateClass} className="mt-3">Update Class</Button>
          ) : (
            <Button onClick={handleAddClass} className="mt-3">Add Class</Button>
          )}
        </Tab>
        <Tab eventKey="section" title={<span><CgAddR /> New Section</span>}>
          <Row>
            <Col>
              <FormLabel>Select Class</FormLabel>
              <FormControl as="select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                ))}
              </FormControl>
            </Col>
            <Col>
              <FormLabel>Section Name</FormLabel>
              <FormControl value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
              {formErrors.section_name && <div className="text-danger">{formErrors.section_name}</div>}
            </Col>
            <Col>
              <FormLabel>Section Code</FormLabel>
              <FormControl value={newSectionCode} onChange={(e) => setNewSectionCode(e.target.value)} />
              {formErrors.section_code && <div className="text-danger">{formErrors.section_code}</div>}
            </Col>
          </Row>
          {editSection ? (
            <Button onClick={handleUpdateSection} className="mt-3">Update Section</Button>
          ) : (
            <Button onClick={handleAddSection} className="mt-3">Add Section</Button>
          )}
        </Tab>
      </Tabs>

      <h2>Class & Section Records</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {mergedData.length === 0 && !loading && <p>No class & section records available.</p>}
      <Table
        columns={[
          { name: "Class Name", selector: (row) => row.class_name },
          { name: "Class Code", selector: (row) => row.class_code },
          { name: "Section Name", selector: (row) => row.section_name },
          { name: "Section Code", selector: (row) => row.section_code },
          {
            name: "Actions", cell: (row) => (
              <>
                <FaEdit onClick={() => handleEditSection(row)} className="mr-2" />
                <FaTrashAlt onClick={() => handleDeleteSection(row._id)} />
              </>
            )
          }
        ]}
        data={mergedData}
      />
    </Container>
  );
};

export default dynamic(() => Promise.resolve(ClassMasterPage), { ssr: false });
