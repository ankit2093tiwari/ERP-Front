"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/students/assign-roll-no/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";

const AssignRollNumbers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Student Name",
      selector: (row) => row.studentName || "N/A",
      sortable: true,
    },
    {
      name: "Adm. No.",
      selector: (row) => row.adminNo || "N/A",
      sortable: true,
    },
    {
      name: "Gender",
      selector: (row) => row.gender || "N/A",
      sortable: true,
    },
    {
      name: "Roll No",
      selector: (row) => row.rollNo || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleUpdateRollNo(row._id, row.rollNo)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger" onClick={() => handleDeleteRollNo(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const fetchData = async () => {
    if (!selectedClass || !selectedSection) {
      alert("Please select both class and section to fetch students.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/roll-assignments`,
        {
          params: { class: selectedClass, section: selectedSection },
        }
      );
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRollNo = async () => {
    try {
      const rollAssignments = data.map((student) => ({
        student_id: student._id,
        class_id: selectedClass,
        section: selectedSection,
        academic_year: "2024-2025",
        roll_no: student.rollNo || "", // Default empty if not assigned
      }));

      await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/roll-assignments",
        { rollAssignments }
      );
      alert("Roll numbers assigned successfully!");
      fetchData();
    } catch (error) {
      setError("Failed to assign roll numbers.");
    }
  };

  const handleUpdateRollNo = async (id, rollNo) => {
    const updatedRollNo = prompt("Enter new roll number:", rollNo);
    if (updatedRollNo) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/roll-assignments/${id}`,
          { roll_no: updatedRollNo }
        );
        setData((prevData) =>
          prevData.map((row) => (row._id === id ? { ...row, rollNo: updatedRollNo } : row))
        );
      } catch (error) {
        setError("Failed to update roll number.");
      }
    }
  };

  const handleDeleteRollNo = async (id) => {
    if (confirm("Are you sure you want to delete this roll number?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/roll-assignments/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        setError("Failed to delete roll number.");
      }
    }
  };

  useEffect(() => {
    // Optional: Fetch default data on component mount
    // fetchData();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">
              Student
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Assign Roll No.</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>


      <div className="cover-sheet">
        <div className="studentHeading"><h2>Search Students</h2></div>
        <Form className="formSheet">
          <Row>
            <Col lg={6}>
              <FormLabel className="labelForm">Select Class</FormLabel>
              <FormSelect
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </FormSelect>
            </Col>
            <Col lg={6}>
              <FormLabel className="labelForm">Select Section</FormLabel>
              <FormSelect
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select Section</option>
                {["A", "B", "C"].map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </FormSelect>
            </Col>
          </Row>
         
          <Button className="btn btn-primary mt-4" onClick={fetchData} disabled={!selectedClass || !selectedSection}>
            Search Students
          </Button>
        </Form>
      </div>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Roll Numbers Assigner</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
            <div className={styles.buttons}>
              <Button onClick={handleAssignRollNo} className="editButton">
                Assign Roll Numbers
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AssignRollNumbers), { ssr: false });
