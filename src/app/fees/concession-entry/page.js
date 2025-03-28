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
  const [concessionTypeOptions, setConcessionTypeOptions] = useState([]);
  const [feeGroups, setFeeGroups] = useState([]);
  const [feeGroup, setFeeGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);

  // Fetch student options based on search term
  // useEffect(() => {
  //   const fetchStudents = async () => {
  //     if (searchTerm.length >= 2) {
  //       setLoading(true);
  //       try {
  //         const response = await axios.get(
  //           `${process.env.NEXT_PUBLIC_SITE_URL}/api/students/search?search_term=${searchTerm}`
  //         );
          
  //         if (response?.data?.success) {
  //           const options = response.data.data.map(student => ({
  //             value: student._id,
  //             label: `${student.first_name} ${student.last_name || ""} - ${student.father_name} (ID: ${student.registration_id})`,
  //             class: student.class_name?._id || student.class_name,
  //             className: student.class_name?.class_name || "",
  //             feeGroup: student.fee_group || ""
  //           }));
  //           setStudentOptions(options);
  //         }
  //       } catch (error) {
  //         console.error("Error searching students:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //   };

  //   const debounceTimer = setTimeout(() => {
  //     fetchStudents();
  //   }, 500);

  //   return () => clearTimeout(debounceTimer);
  // }, [searchTerm]);
  useEffect(() => {
    const fetchStudents = async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/students/search`, {
            params: {
              name: searchTerm,
              father_name: "",  // Add filters dynamically if needed
              registration_id: "",
              class_name: selectedClass || "",
              section_name: "",
              religion_name: "",
              caste_name: "",
            },
          });
  
          if (response?.data?.success) {
            const options = response.data.data.map(student => ({
              value: student._id,
              label: `${student.first_name} ${student.last_name || ""} - ${student.father_name} (ID: ${student.registration_id})`,
              class: student.class_name?._id || student.class_name,
              className: student.class_name?.class_name || "",
              feeGroup: student.fee_group || ""
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
  }, [searchTerm, selectedClass]);
  

  // Fetch class options
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-classes`);
        if (response.data?.data) {
          setClassOptions(response.data.data);
          // If there's only one class, select it by default
          if (response.data.data.length === 1) {
            setSelectedClass(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  // Fetch fee groups
  useEffect(() => {
    const fetchFeeGroups = async () => {
      try {
        const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-fee-groups`);
        if (response.data?.data) {
          setFeeGroups(response.data.data);
          // If there's only one fee group, select it by default
          if (response.data.data.length === 1) {
            setFeeGroup(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching fee groups:", error);
      }
    };

    fetchFeeGroups();
  }, []);

  // Fetch concession types
  useEffect(() => {
    const fetchConcessionTypes = async () => {
      try {
        const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-concessions`);
        if (response.data?.data) {
          setConcessionTypeOptions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching concession types:", error);
      }
    };

    fetchConcessionTypes();
  }, []);

  // Fetch installments when class or fee group changes
  useEffect(() => {
    const fetchInstallments = async () => {
      if (selectedClass && feeGroup) {
        try {
          const classId = typeof selectedClass === 'object' ? selectedClass.value : selectedClass;
          const response = await axios.get(
            `https://erp-backend-fy3n.onrender.com/api/installments?class_id=${classId}&fee_group=${feeGroup}`
          );
          
          if (response?.data?.success) {
            const fetchedInstallments = response.data.data.map(installment => ({
              month: installment.name,
              actualFee: installment.amount,
              discountPercent: 0,
              discountAmount: 0,
              totalAmount: installment.amount
            }));
            setInstallments(fetchedInstallments);
          }
        } catch (error) {
          console.error("Error fetching installments:", error);
        }
      }
    };

    fetchInstallments();
  }, [selectedClass, feeGroup]);

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
          setFeeGroup(student.fee_group || "");
          
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
      setFeeGroup("");
      setStudentDetails(null);
    }
  };

  const handleDiscountChange = (index, value) => {
    const newInstallments = [...installments];
    const discountPercent = parseFloat(value) || 0;
    
    // Ensure discount is between 0 and 100
    const validatedDiscount = Math.min(100, Math.max(0, discountPercent));
    
    newInstallments[index] = {
      ...newInstallments[index],
      discountPercent: validatedDiscount,
      discountAmount: (newInstallments[index].actualFee * validatedDiscount) / 100,
      totalAmount: newInstallments[index].actualFee - (newInstallments[index].actualFee * validatedDiscount) / 100
    };
    
    setInstallments(newInstallments);
  };

  const handleConcessionTypeChange = (value) => {
    setConcessionType(value);
    
    // Find the selected concession type details
    const selectedConcession = concessionTypeOptions.find(ct => ct._id === value);
    
    if (selectedConcession) {
      // Apply concession based on type
      if (selectedConcession.type === "full") {
        const updatedInstallments = installments.map(installment => ({
          ...installment,
          discountPercent: 100,
          discountAmount: installment.actualFee,
          totalAmount: 0
        }));
        setInstallments(updatedInstallments);
      } else if (selectedConcession.type === "half") {
        const updatedInstallments = installments.map(installment => ({
          ...installment,
          discountPercent: 50,
          discountAmount: installment.actualFee * 0.5,
          totalAmount: installment.actualFee * 0.5
        }));
        setInstallments(updatedInstallments);
      } else if (selectedConcession.type === "custom") {
        // For custom concession, keep the existing values or set to 0 if first time
        const updatedInstallments = installments.map(installment => ({
          ...installment,
          discountPercent: installment.discountPercent || 0,
          discountAmount: installment.discountAmount || 0,
          totalAmount: installment.totalAmount || installment.actualFee
        }));
        setInstallments(updatedInstallments);
      }
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
        academic_year: new Date().getFullYear()
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
        setFeeGroup("");
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

  // Calculate totals for the table footer
  const totals = installments.reduce((acc, installment) => {
    return {
      actualFee: acc.actualFee + installment.actualFee,
      discountAmount: acc.discountAmount + installment.discountAmount,
      totalAmount: acc.totalAmount + installment.totalAmount
    };
  }, { actualFee: 0, discountAmount: 0, totalAmount: 0 });

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
                value={selectedStudent}
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
                disabled={!!selectedStudent}
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
                <option value="">Select Fee Group</option>
                {feeGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
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
                {concessionTypeOptions.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.type})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Installments Table (only shown for custom concession) */}
        {concessionType && concessionTypeOptions.find(ct => 
          ct._id === concessionType && ct.type === "custom"
        ) && installments.length > 0 && (
          <Row className="mb-4">
            <Col md={12}>
              <h5>Installments Amount</h5>
              <p>Enter Discount % (0-100)</p>
              <Table bordered striped>
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
                      <td>{installment.actualFee.toFixed(2)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={installment.discountPercent}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </td>
                      <td>{installment.discountAmount.toFixed(2)}</td>
                      <td>{installment.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>{totals.actualFee.toFixed(2)}</th>
                    <th></th>
                    <th>{totals.discountAmount.toFixed(2)}</th>
                    <th>{totals.totalAmount.toFixed(2)}</th>
                  </tr>
                </tfoot>
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