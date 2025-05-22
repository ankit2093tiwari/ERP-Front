"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Button, Table as BootstrapTable, FormGroup, FormLabel, FormControl, FormSelect } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from "react-icons/cg";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { FaPrint } from "react-icons/fa";

const FeeEntryy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      // Reset section and students when class changes
      setSelectedSection("");
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    } else {
      // Reset students when section is cleared
      setStudents([]);
      setSelectedStudent(null);
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/all-classes`);
      const resp = response.data;
      setClassList(resp?.data || []);
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
      if (response?.data?.success) {
        setSectionList(response?.data?.data);
      } else {
        setSectionList([]);
      }
    } catch (err) {
      setError("Failed to fetch sections.");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://erp-backend-fy3n.onrender.com/api/students/search?class_name=${selectedClass}&section_name=${selectedSection}`
      );
      if (response.data.data && response.data.data.length > 0) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
      }
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to fetch students", error);
      setStudents([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (!searchKeyword) return;

    const filtered = students.filter(student =>
      student.first_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      student.roll_no?.toString().includes(searchKeyword) ||
      student.admission_no?.toString().includes(searchKeyword)
    );

    setStudents(filtered);
  };

  const handleResetSearch = () => {
    setSearchKeyword("");
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    // { name: "ADMISSION NO.", selector: (row) => row.admission_no || "N/A" },
    {
      name: "Admission No",
      selector: (row) => row.registration_id || "N/A",
    },
    { name: "ROLL NUMBER", selector: (row) => row.roll_no || "N/A" },
    { name: "STUDENT NAME", selector: (row) => `${row.first_name} ${row.last_name}` || "N/A" },
    { name: "FATHER NAME", selector: (row) => row.father_name || "N/A" },
    {
      name: "CLASS/SECTION", selector: (row) =>
        `${row.class_name?.class_name || "N/A"} (${row.section_name?.section_name || "N/A"})`
    },
    {
      name: "Actions",
      cell: (row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleStudentSelect(row)}
        >
          Select
        </Button>
      ),
    },
  ];

  const feeColumns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "RECEIPT NO", selector: (row) => row.receipt_no || "N/A" },
    { name: "FEE GROUP", selector: (row) => row.fee_group || "N/A" },
    { name: "FEE CODE", selector: (row) => row.fee_code || "N/A" },
    { name: "DESCRIPTION", selector: (row) => row.description || "N/A" },
    { name: "STATUS", selector: (row) => row.status || "N/A" },
    { name: "DATE", selector: (row) => row.date || "N/A" },
    { name: "DISCOUNT", selector: (row) => row.discount || "N/A" },
    { name: "FINE", selector: (row) => row.fine || "N/A" },
    { name: "PAID AMOUNT", selector: (row) => row.paid_amount || "N/A" },
    { name: "UNPAID AMOUNT", selector: (row) => row.unpaid || "N/A" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
          <button className="btn btn-success text-nowrap my-2" onClick={() => handlePay(row._id)}>
            Fee
          </button>
        </div>
      ),
    },
  ];

  // Sample fee data - in a real app, this would come from an API
  const feeData = [
    {
      id: 1,
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-May',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },
    // ... more fee records
  ];

  return (
    <Container>
      <div className="breadcrumbSheet">
        <Row className="mt-1 mb-1">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/feeEntry">Fee</Breadcrumb.Item>
              <Breadcrumb.Item active>Fee Entry</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
      </div>

      <Row>
        <Col>
          <div className="card shadow-none">
            <div className="card-header text-start">
              <h5> <FaSearch /> Select Criteria </h5>
            </div>
            <div className="card-body">
              <Row className="text-start">
                <Col lg={6}>
                  <FormGroup controlId="validationCustom08">
                    <FormLabel className="labelForm">Select Class</FormLabel>
                    <FormSelect
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="">Select Class</option>
                      {classList?.map((classItem) => (
                        <option key={classItem?._id} value={classItem?._id}>
                          {classItem?.class_name}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col lg={6}>
                  <FormGroup controlId="validationCustom09">
                    <FormLabel className="labelForm">Select Section</FormLabel>
                    <FormSelect
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                    >
                      <option value="">Select Section</option>
                      {sectionList?.map((sectionItem) => (
                        <option key={sectionItem?._id} value={sectionItem?._id}>
                          {sectionItem?.section_name} ({sectionItem?.section_code})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>

                <Col lg={6}>
                  {/* <FormGroup controlId="validationCustom02">
                    <FormLabel className="labelForm">Search By Keyword</FormLabel>
                    <div className="d-flex">
                      <FormControl 
                        type="text" 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Search by name, roll no, etc."
                      />
                      <Button 
                        variant="primary" 
                        className="ms-2"
                        onClick={handleSearch}
                        disabled={!searchKeyword}
                      >
                        <FaSearch /> Search
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="ms-2"
                        onClick={handleResetSearch}
                        disabled={!searchKeyword}
                      >
                        Reset
                      </Button>
                    </div>
                  </FormGroup> */}
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {students.length > 0 && (
        <>
          <Row className="mt-3">
            <Col>
              <div className="tableSheet">
                <h2>Students List</h2>
                <Table
                  columns={columns}
                  data={students}
                  pagination
                  highlightOnHover
                />
              </div>
            </Col>
          </Row>

          {selectedStudent && (
            <>
              <Row className="mt-3">
                <Col>
                  <div className="tableSheet">
                    <h2> Fees Statement </h2>
                    <div className="card-body">
                      <Row>
                        <Col lg={4}>
                          <div className="idBox">
                            <div className="profilePhoto">
                              {selectedStudent.profile_Pic ? (
                                <Image
                                  src={selectedStudent.profile_Pic}
                                  alt="Profile Pic"
                                  width="100"
                                  height="100"
                                />
                              ) : (
                                <Image src="/t-01.jpg" alt="Default Pic" width="100" height="100" />
                              )}
                            </div>

                            <h4>{selectedStudent.first_name} {selectedStudent.last_name}</h4>
                          </div>
                        </Col>
                        <Col lg={8}>
                          <BootstrapTable striped bordered hover>
                            <tbody>
                              <tr>
                                <td>NAME</td>
                                <td>{selectedStudent.first_name} {selectedStudent.last_name}</td>
                                <td>CLASS/ SECTION</td>
                                <td>
                                  {selectedStudent.class_name?.class_name || 'N/A'}
                                  ({selectedStudent.section_name?.section_name || 'N/A'})
                                </td>
                              </tr>
                              <tr>
                                <td>FATHER NAME</td>
                                <td>{selectedStudent.father_name || 'N/A'}</td>
                                <td>ADMISSION NO.</td>
                                <td>{selectedStudent.registration_id || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td>MOBILE NUMBER</td>
                                <td>{selectedStudent.phone_no || 'N/A'}</td>
                                <td>ROLL NUMBER</td>
                                <td>{selectedStudent.roll_no || 'N/A'}</td>
                              </tr>
                            </tbody>
                          </BootstrapTable>
                        </Col>
                      </Row>
                    </div>

                    <Row className="justify-content-between mt-3 align-items-center">
                      <Col lg={12}>
                        <div className="text-end">
                          <Button variant="primary" className="btn-action me-2">
                            <FaPrint /> Assign Fees
                          </Button>
                          <Button variant="primary" className="btn-action me-2">
                            <FaPrint /> Assign Discount
                          </Button>
                          <Button variant="primary" className="btn-action me-2">
                            <FaPrint /> Paid History
                          </Button>
                          <Button variant="success" className="btn-action">
                            <FaPrint /> Pay Fees
                          </Button>
                        </div>
                      </Col>
                    </Row>

                    <hr />

                    <div className="card-title">
                      <h2>Fees Details List</h2>
                    </div>

                    <div className="card-body">
                      <div className="tableSheet">
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <Table columns={feeColumns} data={feeData} />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {loading && (
        <Row className="mt-3">
          <Col>
            <div className="text-center">
              <p>Loading students...</p>
            </div>
          </Col>
        </Row>
      )}

      {!loading && students.length === 0 && selectedClass && selectedSection && (
        <Row className="mt-3">
          <Col>
            <div className="alert alert-info">
              No students found for the selected class and section.
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default FeeEntryy;