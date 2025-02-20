"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";

const ClassMasterPage = () => {
  const [data, setData] = useState([]); // State for class data
  const [newClassName, setNewClassName] = useState(""); // New class name state
  const [newClassCode, setNewClassCode] = useState(""); // New class code state
  const [selectedClass, setSelectedClass] = useState(""); // Selected class state for section
  const [newSectionName, setNewSectionName] = useState(""); // New section name
  const [newSectionCode, setNewSectionCode] = useState(""); // New section code
  const [showAddForm, setShowAddForm] = useState(false); // Toggle add form visibility
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [formErrors, setFormErrors] = useState({}); // Field-specific errors
  const [editingClass, setEditingClass] = useState(null); // State to track the class being edited
  const [editingSection, setEditingSection] = useState(null); // State to track the section being edited

  const columns = [
  {
    name: "#",
    selector: (row, index) => index + 1,
    sortable: false,
    width: "80px",
  },
  {
    name: "Class Name",
    cell: (row) => (
      <div>
        {row.class_name || "N/A"}
        <button className="editButton ms-2" onClick={() => handleEdit(row)}>
          <FaEdit />
        </button>
        <button className="editButton btn-danger ms-2" onClick={() => handleDeleteClass(row._id)}>
          <FaTrashAlt />
        </button>
      </div>
    ),
    sortable: true,
  },
  {
    name: "Class Code",
    selector: (row) => row.class_code || "N/A",
    sortable: true,
  },
  {
    name: "Sections",
    cell: (row) => (
      <div>
        {row.sections.length > 0 ? (
          row.sections.map((section, index) => (
            <div key={index}>
              {section.section_code} - {section.section_name}
              <button className="editButton ms-2" onClick={() => handleEditSection(section)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger ms-2" onClick={() => handleDeleteSection(section._id)}>
                <FaTrashAlt />
              </button>
            </div>
          ))
        ) : (
          "No sections"
        )}
      </div>
    ),
    sortable: false,
  },
];

  // Fetch class data and sections together
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch classes
      const classResponse = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      const classes = classResponse.data.data;

      // Fetch all sections
      const sectionResponse = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-sections");
      const sections = sectionResponse.data.data;

      // Merge sections into corresponding classes
      const updatedData = classes.map((classItem) => {
        const classSections = sections
          .filter((section) => section.class._id === classItem._id)
          .map((section) => ({
            section_name: section.section_name,
            section_code: section.section_code,
            _id: section._id,
          }));

        return { ...classItem, sections: classSections };
      });

      setData(updatedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new class
  const handleAddClass = async () => {
    const errors = {};
    if (!newClassName.trim()) {
      errors.class_name = "Class name is required.";
    }
    if (!newClassCode.trim()) {
      errors.class_code = "Class code is required.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-class", {
        class_name: newClassName,
        class_code: newClassCode,
      });

      // Append the new class to the state array
      setData((prevData) => [...prevData, response.data]);
      setNewClassName(""); // Reset class name input
      setNewClassCode(""); // Reset class code input
      setFormErrors({});
      fetchData();
    } catch (err) {
      console.error("Error adding class:", err);
      setError("Failed to add class. Please try again later.");
    }
  };

  // Handle updating an existing class
  const handleUpdateClass = async () => {
    if (!editingClass) return;

    const errors = {};
    if (!newClassName.trim()) {
      errors.class_name = "Class name is required.";
    }
    if (!newClassCode.trim()) {
      errors.class_code = "Class code is required.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-class/${editingClass._id}`, {
        class_name: newClassName,
        class_code: newClassCode,
      });

      const updatedData = data.map((classItem) =>
        classItem._id === editingClass._id ? response.data : classItem
      );
      setData(updatedData);
      setEditingClass(null);
      setNewClassName(""); // Reset class name input
      setNewClassCode(""); // Reset class code input
      setFormErrors({});
      fetchData();
    } catch (err) {
      console.error("Error updating class:", err);
      setError("Failed to update class. Please try again later.");
    }
  };

  // Handle deleting a class
  const handleDeleteClass = async (id) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-class/${id}`);
      setData(data.filter((classItem) => classItem._id !== id));
    } catch (err) {
      console.error("Error deleting class:", err);
      setError("Failed to delete class. Please try again later.");
    }
  };

  // Handle adding a new section to the selected class
  const handleAddSection = async () => {
    const errors = {};
    if (!newSectionName.trim()) {
      errors.section_name = "Section name is required.";
    }
    if (!newSectionCode.trim()) {
      errors.section_code = "Section code is required.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-sections", {
        class_name: selectedClass,
        section_name: newSectionName,
        section_code: newSectionCode,
      });

      // Clear inputs and update section list
      setNewSectionName("");
      setNewSectionCode("");
      fetchData(); // Fetch updated class data
    } catch (err) {
      console.error("Error adding section:", err);
      setError("Failed to add section. Please try again later.");
    }
  };

  // Handle editing a section
  const handleEditSection = (section) => {
    setEditingSection(section);
    setNewSectionName(section.section_name);
    setNewSectionCode(section.section_code);
  };

  // Handle updating a section
  const handleUpdateSection = async () => {
    if (!editingSection) return;

    const errors = {};
    if (!newSectionName.trim()) {
      errors.section_name = "Section name is required.";
    }
    if (!newSectionCode.trim()) {
      errors.section_code = "Section code is required.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-sections/${editingSection._id}`, {
        section_name: newSectionName,
        section_code: newSectionCode,
      });

      // Update the section in the state
      const updatedData = data.map((classItem) => {
        const updatedSections = classItem.sections.map((section) =>
          section._id === editingSection._id ? response.data : section
        );
        return { ...classItem, sections: updatedSections };
      });

      setData(updatedData);
      setEditingSection(null);
      setNewSectionName("");
      setNewSectionCode("");
      setFormErrors({});
      fetchData();
    } catch (err) {
      console.error("Error updating section:", err);
      setError("Failed to update section. Please try again later.");
    }
  };

  // Handle deleting a section
  const handleDeleteSection = async (id) => {
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-sections/${id}`);
      fetchData(); // Fetch updated class data
    } catch (err) {
      console.error("Error deleting section:", err);
      setError("Failed to delete section. Please try again later.");
    }
  };

  // Edit functionality for class
  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setNewClassName(classItem.class_name);
    setNewClassCode(classItem.class_code);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/master-entry/all-module">Master Entry</Breadcrumb.Item>
            <Breadcrumb.Item active>Class Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Tabs id="uncontrolled-tab-example" className="mb-3 TabButton" defaultActiveKey={null}>
        <Tab eventKey="home" title={<span><CgAddR /> {editingClass ? "Update Class" : "New Class"}</span>} className="cover-sheet">
          <div className="studentHeading">
            <h2> {editingClass ? "Update Class" : "Add New Class"} </h2>
          </div>
          <div className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Class Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Class Name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
                {formErrors.class_name && <div className="text-danger">{formErrors.class_name}</div>}
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Class Code</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Enter Class Code"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                />
                {formErrors.class_code && <div className="text-danger">{formErrors.class_code}</div>}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Button onClick={editingClass ? handleUpdateClass : handleAddClass} className="btn btn-primary mt-4">
                  {editingClass ? "Update Class" : "Add Class"}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>

        <Tab eventKey="profile" title={<span><CgAddR /> New Section </span>} className="cover-sheet">
          <div className="studentHeading">
            <h2> Add New Section </h2>
          </div>
          <div className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel className="labelForm">Select Class</FormLabel>
                <FormControl
                  as="select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {data.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </FormControl>
              </Col>
            </Row>

            <Row>
              <Col lg={6}>
                <FormLabel className="labelForm">Section Code</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Section Code"
                  value={newSectionCode}
                  onChange={(e) => setNewSectionCode(e.target.value)}
                />
                {formErrors.section_code && <div className="text-danger">{formErrors.section_code}</div>}
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Section Name</FormLabel>
                <FormControl
                  required
                  type="text"
                  placeholder="Section Name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                />
                {formErrors.section_name && <div className="text-danger">{formErrors.section_name}</div>}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Button onClick={editingSection ? handleUpdateSection : handleAddSection} className="btn btn-primary mt-4">
                  {editingSection ? "Update Section" : "Add Section"}
                </Button>
              </Col>
            </Row>
          </div>
        </Tab>
      </Tabs>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Class Records</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ClassMasterPage;