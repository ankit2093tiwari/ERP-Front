"use client";

import React, { useState, useEffect,useCallback } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  Button,
  Breadcrumb,
  FormSelect,
  Alert,
} from "react-bootstrap";
import DataTable from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import {
  assignStudentsRollNo,
  getClasses,
  getSections,
  getStudentsByClassAndSection,
} from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const AssignRollNo = () => {

const {hasEditAccess}=usePagePermission()

  const selectedSessionId = useSessionId()
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
  const [tableKey, setTableKey] = useState(Date.now());

  useEffect(() => {
    fetchClasses();
  }, [selectedSessionId]);
const fetchStudents = useCallback(async () => {
  setLoading(true);
  setNoRecordsFound(false);
  try {
    const response = await getStudentsByClassAndSection(selectedClass, selectedSection);
    if (response.data && response.data.length > 0) {
      const sortedStudents = [...response.data].sort((a, b) =>
        a.first_name.localeCompare(b.first_name)
      );
      const studentsWithRollNo = sortedStudents.map((student) => ({
        ...student,
        roll_no: student.roll_no || "",
      }));
      setStudents(studentsWithRollNo);
      setShowButtons(true);
    } else {
      setStudents([]);
      setNoRecordsFound(true);
      setShowButtons(false);
    }
  } catch (error) {
    console.error("Failed to fetch students", error);
    setStudents([]);
    setNoRecordsFound(true);
  } finally {
    setLoading(false);
  }
}, [selectedClass, selectedSection]);
  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      setSelectedSection("");
      setStudents([]);
      setShowButtons(false);
      setIsEditing(false);
      setNoRecordsFound(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
      setShowButtons(false);
      setIsEditing(false);
      setNoRecordsFound(false);
    }
  }, [selectedClass, selectedSection,fetchStudents]);

  const fetchClasses = async () => {
    try {
      const response = await getClasses();
      setClassList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await getSections(classId);
      setSectionList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };


  const handleEditRollNo = () => {
    setIsEditing(true);
  };
  const handleAutoGenerate = () => {
    const updatedStudents = students.map((student, index) => ({
      ...student,
      roll_no: prefixKey ? `${prefixKey}-${index + 1}` : `${index + 1}`,
    }));
    setStudents(updatedStudents);
    setTableKey(Date.now());
  };


  const handleRollNoChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const updatedStudents = [...students];
    const formattedRollNo = prefixKey ? `${prefixKey}-${value}` : value;

    updatedStudents[index] = { ...updatedStudents[index], roll_no: formattedRollNo };
    setStudents(updatedStudents);
  };


  const handleSaveRollNo = async () => {
    if (!selectedClass || !selectedSection) {
      toast.warn("Please select both class and section");
      return;
    }

    if (students.length === 0) {
      toast.warn("No students available to assign roll numbers.");
      return;
    }

    const hasEmptyRollNo = students.some((student) => !student.roll_no);
    if (hasEmptyRollNo) {
      toast.warn("Please fill roll numbers for all students");
      return;
    }

    setLoading(true);
    try {
      const response = await assignStudentsRollNo({
        class_name: selectedClass,
        section_name: selectedSection,
        students: students.map((s) => ({
          _id: s._id,
          roll_no: s.roll_no,
        })),
        "prefix-key": prefixKey,
      });

      if (response.success) {
        toast.success("Roll numbers updated successfully!");
        fetchStudents();
        setIsEditing(false);
        setPrefixKey("");
      } else {
        toast.error(response.message || "Failed to assign roll numbers.");
      }
    } catch (error) {
      console.error("Error assigning roll numbers:", error);
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
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
        `${row.first_name} ${row.middle_name || ""} ${row.last_name || ""}`.trim(),
      sortable:true
    },
    {
      name: "Adm No",
      selector: (row) => row.registration_id || "N/A",
      sortable:true
    },
    {
      name: "Gender",
      selector: (row) => row.gender_name || "N/A",
      sortable:true
    },
    {
      name: "Roll No",
      cell: (row, index) => (
        <div key={`rollno-${index}-${row._id}`}>
          {isEditing ? (
            <input
              type="text"
              value={
                prefixKey && row.roll_no?.startsWith(`${prefixKey}-`)
                  ? row.roll_no.replace(`${prefixKey}-`, "")
                  : row.roll_no
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
    },
  ];
  const handlePrint = () => {
    const headers = [["#", "Student Name", "Adm No", "Gender", "Roll No"]];
    const rows = students.map((row, index) => [
      index + 1,
      `${row.first_name} ${row.middle_name || ""} ${row.last_name || ""}`.trim(),
      row.registration_id || "N/A",
      row.gender_name || "N/A",
      row.roll_no || "N/A",
    ]);
    printContent(headers, rows);
  };
  const handleCopy = () => {
    const headers = ["#", "Student Name", "Adm No", "Gender", "Roll No"];
    const rows = students.map((row, index) =>
      `${index + 1}\t${`${row.first_name} ${row.middle_name || ""} ${row.last_name || ""}`.trim()}\t${row.registration_id || "N/A"}\t${row.gender_name || "N/A"}\t${row.roll_no || "N/A"}`
    );
    copyContent(headers, rows);
  };

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
                  {showButtons && !isEditing && hasEditAccess && (
                    <Button onClick={handleEditRollNo} className="me-2">
                      Edit Roll Numbers
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button variant="primary" onClick={handleAutoGenerate} className="me-2">
                        Auto Generate
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleSaveRollNo}
                        disabled={loading || students.some((s) => !s.roll_no)}
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
                  <DataTable columns={columns} data={students} key={tableKey} handleCopy={handleCopy}
                    handlePrint={handlePrint} />
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
