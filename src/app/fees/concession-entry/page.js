"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, FormSelect } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";

const ConcessionEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [concessionType, setConcessionType] = useState("");
  const [feeGroup, setFeeGroup] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch student options based on search term
  useEffect(() => {
    const fetchStudents = async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/students/search?search_term=${searchTerm}`
          );
          
          if (response?.data?.success) {
            const options = response.data.data.map(student => ({
              value: student._id,
              label: `${student.first_name} ${student.last_name || ""} - ${student.father_name} (ID: ${student.registration_id})`
            }));
            setStudentOptions(options);
          }
        } catch (error) {
          console.error("Error searching students:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Fetch class options
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL}/api/all-classes`);
        setClassOptions(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleStudentSelect = (selectedOption) => {
    setSelectedStudent(selectedOption);
    // Here you would typically fetch the student's details
    // and pre-fill the class and other fields if available
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      student: selectedStudent,
      class: selectedStudent?.class || "",
      concessionType,
      feeGroup
    });
    // Add your API call here to submit the concession
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Concession Entry</h2>
      
      <Form onSubmit={handleSubmit}>
        {/* Search Student Section */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="searchStudent">
              <Form.Label>Search Student With StudentName/ FatherName/ FormNo/ StuID/ ParentID/ ScholarNo*</Form.Label>
              <Select
                options={studentOptions}
                onInputChange={(value) => setSearchTerm(value)}
                onChange={handleStudentSelect}
                isLoading={loading}
                placeholder="Type to search students..."
                isClearable
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Selected Student Info */}
        {selectedStudent && (
          <Row className="mb-3">
            <Col md={12}>
              <div className="p-3 bg-light rounded">
                <h5>{selectedStudent.label}</h5>
              </div>
            </Col>
          </Row>
        )}

        {/* Fee Group */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="feeGroup">
              <Form.Label>Fee Group</Form.Label>
              <Form.Control
                as="select"
                value={feeGroup}
                onChange={(e) => setFeeGroup(e.target.value)}
              >
                <option value="">Select Fee Group</option>
                <option value="PG to Prep">PG to Prep</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Class and Concession Type */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="class">
              <Form.Label>Class</Form.Label>
              <Form.Control
                as="select"
                value={selectedStudent?.class || ""}
                onChange={(e) => setSelectedStudent({
                  ...selectedStudent,
                  class: e.target.value
                })}
              >
                <option value="">Select Class</option>
                {classOptions.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.class_name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="concessionType">
              <Form.Label>Concession Type</Form.Label>
              <Form.Control
                as="select"
                value={concessionType}
                onChange={(e) => setConcessionType(e.target.value)}
              >
                <option value="">Select Concession Type</option>
                <option value="Half Concession">Half Concession</option>
                <option value="Full Concession">Full Concession</option>
                <option value="Special Concession">Special Concession</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Submit Button */}
        <Row className="mt-4">
          <Col>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ConcessionEntry;