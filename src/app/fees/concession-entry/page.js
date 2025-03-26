"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, FormSelect, Table } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";

const ConcessionEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [concessionType, setConcessionType] = useState("");
  const [feeGroup, setFeeGroup] = useState("PG to Prep");
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState([
    { month: "April", actualFee: 200, discountPercent: 0, discountAmount: 0, totalAmount: 200 },
    { month: "May", actualFee: 200, discountPercent: 0, discountAmount: 0, totalAmount: 200 },
    { month: "June", actualFee: 200, discountPercent: 0, discountAmount: 0, totalAmount: 200 },
  ]);
  const [studentDetails, setStudentDetails] = useState(null);

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
              label: `${student.first_name} ${student.last_name || ""} - ${student.father_name} (ID: ${student.registration_id})`,
              class: student.class_name?._id || student.class_name,
              className: student.class_name?.class_name || "",
              feeGroup: student.fee_group || "PG to Prep"
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

  const handleStudentSelect = async (selectedOption) => {
    setSelectedStudent(selectedOption);
    if (selectedOption) {
      try {
        // Fetch complete student details
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/students/${selectedOption.value}`
        );
        
        if (response?.data?.success) {
          const student = response.data.data;
          setStudentDetails(student);
          
          // Set class and fee group from student data
          setSelectedClass(student.class_name?._id || student.class_name);
          setFeeGroup(student.fee_group || "PG to Prep");
          
          // If class is populated, get the class name
          if (student.class_name?.class_name) {
            setSelectedClass({
              value: student.class_name._id,
              label: student.class_name.class_name
            });
          }
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    } else {
      setSelectedClass("");
      setFeeGroup("PG to Prep");
      setStudentDetails(null);
    }
  };

  const handleDiscountChange = (index, value) => {
    const newInstallments = [...installments];
    const discountPercent = parseFloat(value) || 0;
    
    newInstallments[index] = {
      ...newInstallments[index],
      discountPercent,
      discountAmount: (newInstallments[index].actualFee * discountPercent) / 100,
      totalAmount: newInstallments[index].actualFee - (newInstallments[index].actualFee * discountPercent) / 100
    };
    
    setInstallments(newInstallments);
  };

  const handleConcessionTypeChange = (value) => {
    setConcessionType(value);
    
    // Apply full or half concession automatically
    if (value === "Full Concession") {
      const updatedInstallments = installments.map(installment => ({
        ...installment,
        discountPercent: 100,
        discountAmount: installment.actualFee,
        totalAmount: 0
      }));
      setInstallments(updatedInstallments);
    } else if (value === "Half Concession") {
      const updatedInstallments = installments.map(installment => ({
        ...installment,
        discountPercent: 50,
        discountAmount: installment.actualFee * 0.5,
        totalAmount: installment.actualFee * 0.5
      }));
      setInstallments(updatedInstallments);
    } else if (value === "Custom Concession") {
      // Reset to no discount for custom
      const updatedInstallments = installments.map(installment => ({
        ...installment,
        discountPercent: 0,
        discountAmount: 0,
        totalAmount: installment.actualFee
      }));
      setInstallments(updatedInstallments);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student_id: selectedStudent.value,
        class_id: typeof selectedClass === 'object' ? selectedClass.value : selectedClass,
        concession_type: concessionType,
        fee_group: feeGroup,
        installments: installments,
        academic_year: new Date().getFullYear() // Add current academic year
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/concessions`,
        payload
      );

      if (response.data.success) {
        alert("Concession applied successfully!");
        // Reset form
        setSelectedStudent(null);
        setSelectedClass("");
        setConcessionType("");
        setFeeGroup("PG to Prep");
        setInstallments(installments.map(i => ({
          ...i,
          discountPercent: 0,
          discountAmount: 0,
          totalAmount: i.actualFee
        })));
      } else {
        alert("Failed to apply concession: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting concession:", error);
      alert("Error applying concession. Please try again.");
    }
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
                <h5>{selectedStudent.label.split(" - ")[0]}</h5>
                {studentDetails && (
                  <div className="mt-2">
                    <p><strong>Class:</strong> {studentDetails.class_name?.class_name || "N/A"}</p>
                    <p><strong>Section:</strong> {studentDetails.section_name?.section_name || "N/A"}</p>
                    <p><strong>Registration ID:</strong> {studentDetails.registration_id || "N/A"}</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}

        {/* Class and Fee Group */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="class">
              <Form.Label>Class</Form.Label>
              <Form.Control
                as="select"
                value={typeof selectedClass === 'object' ? selectedClass.value : selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                disabled={!!selectedStudent} // Disable if student is selected
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
            <Form.Group controlId="feeGroup">
              <Form.Label>Fee Group</Form.Label>
              <Form.Control
                as="select"
                value={feeGroup}
                onChange={(e) => setFeeGroup(e.target.value)}
                required
              >
                <option value="PG to Prep">PG to Prep</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
                <option value="Group C">Group C</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Concession Type */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group controlId="concessionType">
              <Form.Label>Concession Type</Form.Label>
              <Form.Control
                as="select"
                value={concessionType}
                onChange={(e) => handleConcessionTypeChange(e.target.value)}
                required
              >
                <option value="">Select Concession Type</option>
                <option value="Full Concession">Full Concession</option>
                <option value="Half Concession">Half Concession</option>
                <option value="Custom Concession">Custom Concession</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Installments Table (only shown for Custom Concession) */}
        {concessionType === "Custom Concession" && (
          <Row className="mb-4">
            <Col md={12}>
              <h5>Installments Amount</h5>
              <p>Enter Discount %</p>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Actual Tuition Fee</th>
                    <th>Discount %</th>
                    <th>Discount Amount</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((installment, index) => (
                    <tr key={index}>
                      <td>{installment.month}</td>
                      <td>{installment.actualFee}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={installment.discountPercent}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          min="0"
                          max="100"
                        />
                      </td>
                      <td>{installment.discountAmount}</td>
                      <td>{installment.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}

        {/* Submit Button */}
        <Row className="mt-4">
          <Col>
            <Button variant="primary" type="submit" disabled={!selectedStudent || !concessionType}>
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ConcessionEntry;