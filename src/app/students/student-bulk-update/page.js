"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb, FormSelect, Alert } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/students/assign-roll-no/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getClasses, getSections, getStudentsByClassAndSection, updateBulkStudents } from "@/Services";
import { toast } from 'react-toastify'
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
const StudentBulkUpdate = () => {
  const selectedSessionId = useSessionId();
  const { hasEditAccess } = usePagePermission()

  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [updatedStudents, setUpdatedStudents] = useState([]);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchClasses();
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      // Reset section and students when class changes
      setSelectedSection("");
      setStudents([]);
      setUpdatedStudents([]);
      setShowUpdateButton(false);
      setNoRecordsFound(false);
    }
  }, [selectedClass]);




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
      const response = await getSections(classId)
      setSectionList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };
  const handleUpdateStudents = useCallback(async () => {
    try {
      const response = await updateBulkStudents({ students: updatedStudents });

      if (response?.success) {
        toast.success(response?.message);
        setSelectedClass("");
        setSelectedSection("");
        setStudents([]);
        setUpdatedStudents([]);
        setShowUpdateButton(false);
        setNoRecordsFound(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Failed to update students", error);
      toast.error("Error updating students.");
    }
  }, [updatedStudents]);
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setNoRecordsFound(false);
    try {
      const response = await getStudentsByClassAndSection(selectedClass, selectedSection)
      if (response.data && response.data.length > 0) {
        setStudents(response.data);
        setUpdatedStudents(response.data);
        setShowUpdateButton(true);
      } else {
        setStudents([]);
        setUpdatedStudents([]);
        setShowUpdateButton(false);
        setNoRecordsFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
      setUpdatedStudents([]);
      setShowUpdateButton(false);
      setNoRecordsFound(true);
    }
    setLoading(false);
  }, [selectedClass, selectedSection]);
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
      setUpdatedStudents([]);
      setShowUpdateButton(false);
      setNoRecordsFound(false);
    }
  }, [selectedClass, selectedSection, fetchStudents]);
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", transcript);

      if (transcript.includes("update students") && showUpdateButton) {
        handleUpdateStudents(); // ✅ safe now since it's wrapped in useCallback
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening, showUpdateButton, handleUpdateStudents]); // ✅ added handleUpdateStudents


  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
  };

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedList = [...updatedStudents];
    updatedList[index][field] = value;
    setUpdatedStudents(updatedList);
  };





  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px",
    },
    { name: "Adm No", selector: (row) => row.registration_id || "N/A", sortable: true },
    {
      name: "First Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.first_name || ""}
          onChange={(e) => handleFieldChange(index, "first_name", e.target.value)}
        />
      ),
    },
    {
      name: "Middle Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.middle_name || ""}
          onChange={(e) => handleFieldChange(index, "middle_name", e.target.value)}
        />
      ),
    },
    {
      name: "Last Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.last_name || ""}
          onChange={(e) => handleFieldChange(index, "last_name", e.target.value)}
        />
      ),
    },
    {
      name: "Father Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.father_name || ""}
          onChange={(e) => handleFieldChange(index, "father_name", e.target.value)}
        />
      ),
    },
    {
      name: "Mother Name",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.mother_name || ""}
          onChange={(e) => handleFieldChange(index, "mother_name", e.target.value)}
        />
      ),
    },
    {
      name: "Mobile No",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.phone_no || ""}
          onChange={(e) => handleFieldChange(index, "phone_no", e.target.value)}
        />
      ),
    },
    {
      name: "Gender",
      cell: (row, index) => (
        <select value={updatedStudents[index]?.gender_name || ""} onChange={(e) => handleFieldChange(index, "gender_name", e.target.value)}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      ),
    },
    {
      name: "Roll No",
      cell: (row, index) => (
        <input
          type="text"
          value={updatedStudents[index]?.roll_no || ""}
          onChange={(e) => handleFieldChange(index, "roll_no", e.target.value)}
        />
      ),
    },
  ];

  const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "student-bulk-update", link: "null" }]

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
                  <FormLabel className="labelForm">Select Class<span className="text-danger">*</span></FormLabel>
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
                  <FormLabel className="labelForm">Select Section<span className="text-danger">*</span></FormLabel>
                  <FormSelect
                    value={selectedSection}
                    onChange={handleSectionChange}
                    disabled={!selectedClass}
                  >
                    <option value="">Select Section</option>
                    {Array.isArray(sectionList) && sectionList.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.section_name}
                      </option>
                    ))}
                  </FormSelect>
                </Col>
              </Row>
              <br />
              {showUpdateButton && hasEditAccess && (
                <Row>
                  <Col>
                    <Button variant="success" onClick={handleUpdateStudents}>
                      Update Students
                    </Button>
                  </Col>
                </Row>
              )}
            </Form>
          </div>

          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Students Records</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : noRecordsFound ? (
                  <Alert variant="info">There is no record to display.</Alert>
                ) : students.length > 0 ? (
                  <Table columns={columns} data={students} />
                ) : (
                  <Alert variant="primary">Please select both class and section to view students.</Alert>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default StudentBulkUpdate;