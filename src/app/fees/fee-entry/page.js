"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
  FormGroup,
  Table
} from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FeeEntry = () => {
  const [receiptDate, setReceiptDate] = useState(new Date());
  const [receiptNo, setReceiptNo] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [selectedPayType, setSelectedPayType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [studentListData, setStudentListData] = useState([]);
  const [studentListOptions, setStudentListOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeGroups, setFeeGroups] = useState([]);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState("");
  const [feeDetails, setFeeDetails] = useState([]);

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "deposit-entry", link: "null" }
  ];

  // Mock data for dropdowns
  const accountTypes = [
    { value: "School", label: "School" },
    { value: "Bus", label: "Bus" },
    { value: "School & Bus", label: "School & Bus" }
  ];

  const payTypes = [
    { value: "installment", label: "Installment" },
    { value: "Multi installment", label: "Multi Installment" }
  ];

  // Fetch all students for search
  const getAllStudent = async () => {
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search`
      );
      if (response?.data?.success) {
        const searchStudentOptions = response?.data?.data?.map((item) => ({
          value: item?.registration_id,
          label: `${item?.first_name} - Father: ${item?.father_name} - ID: ${item?.registration_id}`,
          data: item // Store the entire student data
        }));
        setStudentListData(response?.data?.data);
        setStudentListOptions(searchStudentOptions);
      } else {
        setStudentListData([]);
        setStudentListOptions([]);
      }
    } catch (error) {
      console.error("Failed to search students", error);
    }
  };

  // Get student data when selected from dropdown
  const getStudentData = (selectedOption) => {
    if (!selectedOption) {
      setSelectedStudent(null);
      return;
    }

    const selectedStudentData = studentListData.find(
      item => item.registration_id === selectedOption.value
    );
    
    if (selectedStudentData) {
      setSelectedStudent(selectedStudentData);
      // You can auto-fill other fields here if needed
      setSelectedClass(selectedStudentData.class_name?._id || "");
    }
  };

  // Mock function to fetch fee groups
  const fetchFeeGroups = async () => {
    try {
      // In a real app, you would call your API here
      const mockFeeGroups = [
        { value: "tuition", label: "Tuition Fee" },
        { value: "transport", label: "Transport Fee" },
        { value: "library", label: "Library Fee" }
      ];
      setFeeGroups(mockFeeGroups);
    } catch (error) {
      console.error("Error fetching fee groups:", error);
    }
  };

  // Mock function to fetch fee details
  const fetchFeeDetails = async () => {
    if (!selectedStudent || !selectedFeeGroup) return;

    try {
      // In a real app, you would call your API here
      const mockFeeDetails = [
        { feeItem: "Tuition", amount: 5000, dueDate: "2025-04-15", status: "Pending" },
        { feeItem: "Books", amount: 1000, dueDate: "2025-04-15", status: "Pending" }
      ];
      setFeeDetails(mockFeeDetails);
    } catch (error) {
      console.error("Error fetching fee details:", error);
    }
  };

  useEffect(() => {
    getAllStudent();
    fetchFeeGroups();
  }, []);

  useEffect(() => {
    fetchFeeDetails();
  }, [selectedStudent, selectedFeeGroup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      receiptDate,
      receiptNo,
      selectedClass,
      selectedStudent,
      selectedAccountType,
      selectedPayType,
      selectedFeeGroup
    });
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
              <h2>Deposit Entry</h2>
            </div>

            <Form onSubmit={handleSubmit} className="formSheet">
              <Row className="mb-3">
                <Col md={12}>
                  <FormLabel>Search Student With StudentName/FatherName/FormNo/StuID/ParentID/ScholarNo*</FormLabel>
                  <Select
                    options={studentListOptions}
                    onChange={getStudentData}
                    onInputChange={setSearchTerm}
                    placeholder="Search student..."
                    isClearable
                    isSearchable
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Receipt Date</FormLabel>
                    <DatePicker
                      selected={receiptDate}
                      onChange={(date) => setReceiptDate(date)}
                      className="form-control"
                      dateFormat="MM/dd/yyyy"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Class</FormLabel>
                    <FormControl
                      type="text"
                      value={selectedStudent?.class_name?.class_name || ""}
                      readOnly
                      placeholder="Class"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Receipt No</FormLabel>
                    <FormControl
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      placeholder="Receipt No"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Collection</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option>R.D.School</option>
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>A/C Type</FormLabel>
                    <Select
                      options={accountTypes}
                      onChange={(option) => setSelectedAccountType(option?.value || "")}
                      placeholder="Select A/C Type"
                      isClearable
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <FormLabel>Pay Type</FormLabel>
                    <Select
                      options={payTypes}
                      onChange={(option) => setSelectedPayType(option?.value || "")}
                      placeholder="Select Pay Type"
                      isClearable
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <FormGroup>
                    <FormLabel>Fee Group</FormLabel>
                    <Select
                      options={feeGroups}
                      onChange={(option) => setSelectedFeeGroup(option?.value || "")}
                      placeholder="Select Fee Group"
                      isClearable
                    />
                  </FormGroup>
                </Col>
              </Row>

              {selectedFeeGroup && (
                <Row className="mb-3">
                  <Col md={12}>
                    <h4>Student Ledger Details</h4>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Fee Item</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeDetails.map((fee, index) => (
                          <tr key={index}>
                            <td>{fee.feeItem}</td>
                            <td>{fee.amount}</td>
                            <td>{fee.dueDate}</td>
                            <td>{fee.status}</td>
                            <td>
                              <FormControl
                                type="number"
                                placeholder="Enter amount"
                                style={{ width: "100px" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              )}

              <Row className="mb-3">
                <Col className="text-end">
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeeEntry;