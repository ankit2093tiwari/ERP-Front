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
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
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

  // Fetch classes on first render
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch sections whenever class changes
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    }
  }, [selectedClass]);

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
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section");
      return;
    }

    setLoading(true);
    setStudents([]);
    setIsEditing(false);

    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      const studentData = response.data.data || [];
      setStudents(studentData);
      setShowButtons(studentData.length > 0);
    } catch (error) {
      console.error("Failed to fetch students", error);
      alert("Error fetching students. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    setStudents([]); // clear students when changing class
    setIsEditing(false);
    setShowButtons(false);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
    setStudents([]); // clear students when changing section
    setIsEditing(false);
    setShowButtons(false);
  };

  const handleEditRollNo = () => {
    const updatedStudents = students.map((student, index) => ({
      ...student,
      roll_no: prefixKey ? `${prefixKey}-${index + 1}` : (index + 1).toString(),
    }));
    setStudents(updatedStudents);
    setIsEditing(true);
  };

  const handleRollNoChange = (index, newRollNo) => {
    if (newRollNo === "" || /^\d+$/.test(newRollNo)) {
      setStudents((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], roll_no: newRollNo };
        return updated;
      });
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
              <h2>Search Students</h2>
            </div>

            <Form className="formSheet">
              <Row>
                <Col>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect value={selectedClass} onChange={handleClassChange}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>

                <Col>
                  <FormLabel className="labelForm">Select Section</FormLabel>
                  <FormSelect value={selectedSection} onChange={handleSectionChange}>
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
                  <Button onClick={fetchStudents} disabled={loading}>
                    {loading ? "Loading..." : "Search Students"}
                  </Button>
                  {showButtons && !isEditing && (
                    <Button className="ms-2 btn-warning" onClick={handleEditRollNo}>
                      Edit RollNo
                    </Button>
                  )}
                  {isEditing && (
                    <Button className="ms-2 btn-success" onClick={handleSaveRollNo} disabled={loading}>
                      {loading ? "Saving..." : "Save RollNo"}
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students Records</h2>
                {students.length > 0 ? (
                  <Table
                    columns={[
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
                        cell: (row, index) =>
                          isEditing ? (
                            <input
                              type="text"
                              value={row.roll_no || ""}
                              onChange={(e) => handleRollNoChange(index, e.target.value)}
                              style={{ width: "60px" }}
                            />
                          ) : (
                            row.roll_no || "N/A"
                          ),
                      },
                    ]}
                    data={students}
                  />
                ) : (
                  <p className="text-center">No students found.</p>
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
