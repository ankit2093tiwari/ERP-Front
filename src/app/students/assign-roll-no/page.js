"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  Button,
  Breadcrumb,
  FormSelect,
  Alert
} from "react-bootstrap";
import DataTable from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AssignRollNo = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prefixKey, setPrefixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const [tableKey, setTableKey] = useState(Date.now()); // Add this line

  // ... (keep all your existing useEffect hooks and fetch functions the same)
  // Fetch classes on first render
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch sections whenever class changes
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      // Reset section and students when class changes
      setSelectedSection("");
      setStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass]);

  // Auto-fetch students when both class and section are selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      // Reset students when section is cleared
      setStudents([]);
      setNoRecordsFound(false);
    }
  }, [selectedClass, selectedSection]);

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
      setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setNoRecordsFound(false);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      if (response.data.data && response.data.data.length > 0) {
        // Initialize roll numbers if they don't exist
        const studentsWithRollNo = response.data.data.map((student, index) => ({
          ...student,
          roll_no: student.roll_no || ""
        }));
        setStudents(studentsWithRollNo);
        setShowButtons(true);
      } else {
        setStudents([]);
        setNoRecordsFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
      setNoRecordsFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRollNo = () => {
    setIsEditing(true);
  };

  const handleAutoGenerate = () => {
    const updatedStudents = students.map((student, index) => ({
      ...student,
      roll_no: prefixKey ? `${prefixKey}-${index + 1}` : (index + 1).toString(),
    }));
    setStudents(updatedStudents);
    setTableKey(Date.now()); // Force table to re-render
  };

  const handleRollNoChange = (index, newRollNo) => {
    let formattedRollNo = newRollNo;

    // Only digits allowed after prefix
    if (prefixKey && /^\d+$/.test(newRollNo)) {
      formattedRollNo = `${prefixKey}-${newRollNo}`;
    }

    if (!prefixKey || newRollNo === "" || /^\d+$/.test(newRollNo.replace(`${prefixKey}-`, ""))) {
      const updatedStudents = [...students];
      updatedStudents[index] = { ...updatedStudents[index], roll_no: formattedRollNo };
      setStudents(updatedStudents);
    }
  };


  const handleSaveRollNo = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section");
      return;
    }

    if (students.length === 0) {
      alert("No students available to assign roll numbers.");
      return;
    }

    const hasEmptyRollNo = students.some((student) => !student.roll_no);
    if (hasEmptyRollNo) {
      alert("Please fill roll numbers for all students");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/students/roll-number-assigned-Students",
        {
          class_name: selectedClass,
          section_name: selectedSection,
          students: students.map((s) => ({
            _id: s._id,
            roll_no: s.roll_no,
          })),
          "prefix-key": prefixKey,
        }
      );

      if (response.data.success) {
        alert("Roll numbers updated successfully!");
        fetchStudents(); // refresh list
      } else {
        alert(response.data.message || "Failed to assign roll numbers.");
      }
    } catch (error) {
      console.error("Error assigning roll numbers:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
    setIsEditing(false);
  };

  const breadcrumbItems = [
    { label: "Students", link: "/students/all-module" },
    { label: "Assign-roll-no", link: "null" },
  ];


  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "50px",
    },
    {
      name: "Student Name",
      selector: (row) =>
        `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
    },
    {
      name: "Adm No",
      selector: (row) => row.registration_id || "N/A",
    },
    {
      name: "Gender",
      selector: (row) => row.gender_name || "N/A",
    },
    {
      name: "Roll No",
      cell: (row, index) => (
        <div key={`rollno-${index}-${row._id}`}>
          {isEditing ? (
            <input
              type="text"
              value={
                row.roll_no?.replace(`${prefixKey}-`, "") || "" // show only the numeric part in input
              }
              onChange={(e) => handleRollNoChange(index, e.target.value)}
              style={{ width: "80px" }}
              className="form-control"
            />
          ) : (
            row.roll_no || "N/A"
          )}
        </div>
      ),
    }

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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Assign Roll Numbers</h2>
            </div>

            <Form className="formSheet">
              <Row>
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
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
                  <FormLabel className="labelForm">Select Section</FormLabel>
                  <FormSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClass}
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
                <Col lg={6}>
                  <FormLabel className="labelForm">Prefix Key (Optional)</FormLabel>
                  <input
                    type="text"
                    className="form-control"
                    value={prefixKey}
                    onChange={(e) => setPrefixKey(e.target.value)}
                    placeholder="Enter Prefix (e.g., A)"
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  {showButtons && !isEditing && (
                    <Button
                      // variant="warning"
                      onClick={handleEditRollNo}
                      className="me-2"
                    >
                      Edit Roll Numbers
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleAutoGenerate}
                        className="me-2"
                      >
                        Auto Generate
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleSaveRollNo}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Roll Numbers"}
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students List</h2>
                {loading ? (
                  <p>Loading students...</p>
                ) : noRecordsFound ? (
                  <Alert variant="info">No students found for the selected class and section.</Alert>
                ) : (
                  <DataTable
                    columns={columns}
                    data={students}
                    key={tableKey} // Use the tableKey here
                  />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default AssignRollNo;