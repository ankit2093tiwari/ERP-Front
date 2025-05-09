"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const PromoteStudentPage = () => {
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [promotedSectionList, setPromotedSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promotedClass, setPromotedClass] = useState("");
  const [promotedSection, setPromotedSection] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [promotionSessionId, setPromotionSessionId] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchSessions();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-session");
      setSessionList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const fetchSections = async (classId, setSectionState) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      setSectionState(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection || !currentSessionId) {
      alert("Please select class, section, and current session");
      return;
    }
    setStudents([]);
    setSelectedStudents([]);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}&session_id=${currentSessionId}`
      );
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const handlePromote = async () => {
    if (!promotedClass || !promotedSection || selectedStudents.length === 0 || !promotionSessionId) {
      alert("Please select students, promoted class, promoted section, and promotion session");
      return;
    }
    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/students/promote", {
        student_ids: selectedStudents,
        new_class_id: promotedClass,
        new_section_id: promotedSection,
        session_id: promotionSessionId
      });
      alert("Students promoted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Failed to promote students", error);
      alert(error.response?.data?.message || "Failed to promote students");
    }
  };

  // ... (other handler functions remain the same)
   const handlePrint = async () => {

    const tableHeaders = [["#", "Student Name", "Father Name", "Adm No", "Gender", "Roll No"]];

    const tableRows = students.map((row, index) => [

      index + 1,

      `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),

      row.father_name || "N/A",

      row.registration_id || "N/A",

      row.gender_name || "N/A",

      row.roll_no || "N/A",

    ]);

    printContent(tableHeaders, tableRows);

  };



  const handleCopy = () => {

    const headers = ["#", "Student Name", "Father Name", "Adm No", "Gender", "Roll No"];

    const rows = students.map((row, index) => [

      index + 1,

      `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),

      row.father_name || "N/A",

      row.registration_id || "N/A",

      row.gender_name || "N/A",

      row.roll_no || "N/A",

    ]);

    copyContent(headers, rows);

  };



  const handleSelectAll = () => {

    if (selectAll) {

      setSelectedStudents([]);

    } else {

      setSelectedStudents(students.map((student) => student._id));

    }

    setSelectAll(!selectAll);

  };



  const handleStudentSelect = (studentId) => {

    setSelectedStudents((prevSelected) =>

      prevSelected.includes(studentId)

        ? prevSelected.filter((id) => id !== studentId)

        : [...prevSelected, studentId]

    );

  };



  const columns = [

    {

      name: "#",

      selector: (row, index) => index + 1,

      sortable: false,

      width: "50px",

    },

    {

      name: (

        <>

          Select All{" "}

          <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />

        </>

      ),

      cell: (row) => (

        <input

          type="checkbox"

          checked={selectedStudents.includes(row._id)}

          onChange={() => handleStudentSelect(row._id)}

        />

      ),

    },

    { name: "Student Name", selector: (row) => `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(), sortable: true },

    { name: "Father Name", selector: (row) => row.father_name || "N/A", sortable: true },

    { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },

    { name: "Gender", selector: (row) => row.gender_name || "N/A", sortable: true },

    { name: "Roll No", selector: (row) => row.roll_no || "N/A", sortable: true },

  ];



  const breadcrumbItems = [

    { label: "students", link: "/students/all-module" },

    { label: "promote-student", link: "null" }

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
              <h2>Promote Students</h2>
            </div>
            <Form className="formSheet">
              {/* Current Information Section */}
              <div className="mb-4">
                <h5 className="mb-3">Current Information</h5>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Current Session</FormLabel>
                    <FormSelect 
                      value={currentSessionId} 
                      onChange={(e) => setCurrentSessionId(e.target.value)}
                    >
                      <option value="">Select Current Session</option>
                      {sessionList.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.sessionName}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Current Class</FormLabel>
                    <FormSelect 
                      value={selectedClass} 
                      onChange={(e) => { 
                        setSelectedClass(e.target.value); 
                        fetchSections(e.target.value, setSectionList); 
                      }}
                    >
                      <option value="">Select Current Class</option>
                      {classList.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Current Section</FormLabel>
                    <FormSelect 
                      value={selectedSection} 
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="">Select Current Section</option>
                      {sectionList.map((sec) => (
                        <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button onClick={fetchStudents}>Search Students</Button>
                  </Col>
                </Row>
              </div>

              {/* Promotion Information Section */}
              <div className="mb-4">
                <h5 className="mb-3">Promotion Information</h5>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Promotion Session</FormLabel>
                    <FormSelect 
                      value={promotionSessionId} 
                      onChange={(e) => setPromotionSessionId(e.target.value)}
                    >
                      <option value="">Select Promotion Session</option>
                      {sessionList.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.sessionName}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Promoted Class</FormLabel>
                    <FormSelect 
                      value={promotedClass} 
                      onChange={(e) => { 
                        setPromotedClass(e.target.value); 
                        fetchSections(e.target.value, setPromotedSectionList); 
                      }}
                    >
                      <option value="">Select Promoted Class</option>
                      {classList.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Promoted Section</FormLabel>
                    <FormSelect 
                      value={promotedSection} 
                      onChange={(e) => setPromotedSection(e.target.value)}
                    >
                      <option value="">Select Promoted Section</option>
                      {promotedSectionList.map((sec) => (
                        <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button 
                      onClick={handlePromote} 
                      disabled={
                        !selectedStudents.length || 
                        !promotedClass || 
                        !promotedSection || 
                        !promotionSessionId
                      }
                    >
                      Promote Students
                    </Button>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>

          {/* Students Table Section */}
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students Records</h2>
                {students.length > 0 ? (
                  <Table 
                    columns={columns} 
                    data={students} 
                    handlePrint={handlePrint} 
                    handleCopy={handleCopy} 
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

export default PromoteStudentPage;