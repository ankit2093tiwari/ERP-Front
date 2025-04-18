"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
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

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
      setClassList(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
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
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section");
      return;
    }
    setStudents([]); // Clear previous students before fetching
    setSelectedStudents([]);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const handlePromote = async () => {
    if (!promotedClass || !promotedSection || selectedStudents.length === 0) {
      alert("Please select students, promoted class, and promoted section");
      return;
    }
    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/students/promote", {
        student_ids: selectedStudents,
        new_class_id: promotedClass,
        new_section_id: promotedSection,
      });
      alert("Students promoted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Failed to promote students", error);
      alert("Failed to promote students");
    }
  };

  const handlePrint = async () => {

    // doc.text("Promote Students Report", 14, 10);

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
    const rows = students
      .map((row, index) =>
        [
          index + 1,
          `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
          row.father_name || "N/A",
          row.registration_id || "N/A",
          row.gender_name || "N/A",
          row.roll_no || "N/A",
        ]
      )
    copyContent(headers, rows)
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
    // {
    //   name: "Select",
    //   cell: (row) => (
    //     <input
    //       type="checkbox"
    //       checked={selectedStudents.includes(row._id)}
    //       onChange={() =>
    //         setSelectedStudents((prevSelected) =>
    //           prevSelected.includes(row._id)
    //             ? prevSelected.filter((id) => id !== row._id)
    //             : [...prevSelected, row._id]
    //         )
    //       }
    //     />
    //   ),
    // },
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

  const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "promote-student", link: "null" }]


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
              <Row>
                <Col lg={6}>
                  <FormLabel className="labelForm">Select Class</FormLabel>
                  <FormSelect value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); fetchSections(e.target.value, setSectionList); }}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => <option key={cls._id} value={cls._id}>{cls.class_name}</option>)}
                  </FormSelect>
                </Col>
                <Col>
                  <FormLabel className="labelForm">Select Section</FormLabel>
                  <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                    <option value="">Select Section</option>
                    {sectionList.map((sec) => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
                  </FormSelect>
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <Button onClick={fetchStudents}>Search Students</Button>
                </Col>
              </Row>
              <br />
              <Row>
                <Col>
                  <FormLabel className="labelForm">Select Promoted Class</FormLabel>
                  <FormSelect value={promotedClass} onChange={(e) => { setPromotedClass(e.target.value); fetchSections(e.target.value, setPromotedSectionList); }}>
                    <option value="">Select Class</option>
                    {classList.map((cls) => <option key={cls._id} value={cls._id}>{cls.class_name}</option>)}
                  </FormSelect>
                </Col>
                <Col>
                  <FormLabel className="labelForm">Select Promoted Section</FormLabel>
                  <FormSelect value={promotedSection} onChange={(e) => setPromotedSection(e.target.value)}>
                    <option value="">Select Section</option>
                    {promotedSectionList.map((sec) => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
                  </FormSelect>
                </Col>
                <Row>
                  <Col>
                    <Button onClick={handlePromote} disabled={!selectedStudents.length || !promotedClass || !promotedSection}>Promote Students</Button>
                  </Col>
                </Row>
              </Row>
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students Records</h2>
                {students.length > 0 ? <Table columns={columns} data={students} handlePrint={handlePrint} handleCopy={handleCopy} /> : <p className="text-center">No students found.</p>}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default PromoteStudentPage;
