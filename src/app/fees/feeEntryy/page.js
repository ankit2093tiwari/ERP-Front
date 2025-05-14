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
  let student_field = {
    class_name: "",
    section_name: "",
  }

  const [student, setStudent] = useState(student_field);
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleClassChange = (e) => {
    const { name, value } = e.target;


    setStudent((prev) => ({ ...prev, [name]: value }));
    fetchSections(value)
  };

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
      console.log('testinggg', classId)
      const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId} `);
      console.log('response', response);
      if (response?.data?.success) {
        setSectionList(response?.data?.data);
      } else {
        setSectionList([]);
      }
      console.log('testingg', response.data);
    } catch (err) {
      setError("Failed to fetch sections.");
    }
  };
  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "ADMISSINON NO.", selector: (row) => row.name || "N/A" },
    { name: "ROLL NUMBER", selector: (row) => row.class_section || "N/A" },
    { name: "RECEIPT NO", selector: (row) => row.receipt_no || "N/A" },
    { name: "FEE GROUP", selector: (row) => row.fee_group || "N/A" },
    { name: "FEE CODE", selector: (row) => row.fee_code || "N/A" },
    { name: "DESCRIPTION", selector: (row) => row.description || "N/A" },
    { name: "STATUS", selector: (row) => new Date(row.status).toLocaleDateString() || "N/A" },
    { name: "DATE", selector: (row) => row.date || "N/A" },
    { name: "DISCOUNT", selector: (row) => row.discount || "N/A" },
    { name: "FINE", selector: (row) => row.fine || "N/A" },
    { name: "PAID AMOUNT", selector: (row) => row.paid_amount || "N/A" },
    { name: "UNPAID AMOUNT", selector: (row) => row.unpaid || "N/A" },
    // { name: "STATUS", selector: (row) => row.status || "N/A" },


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

  const data = [
    {
      id: 1,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: 'pending',
      unpaid: '3400',

    },
    {
      id: 2,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },
    {
      id: 3,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },
    {
      id: 4,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },
    {
      id: 5,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },
    {
      id: 6,
      name: 'SAURABH AGRAHARI',
      class_section: '1st(A)',
      receipt_no: '773',
      fee_group: '1st Class Fees,Development Fees(Nur - 5)',
      fee_code: 'TUTION FEES,DEVELOPMENT FEES',
      description: 'April-MAy',
      status: 'Paid',
      date: '14-08-2024',
      discount: '1050',
      fine: '0',
      paid_amount: '3400',
      unpaid: '-',
    },


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
                <Col lg={3}>
                  <FormGroup controlId="validationCustom08">
                    <FormLabel className="labelForm">Select Class</FormLabel>
                    <FormSelect
                      value={student?.class_name}
                      onChange={handleClassChange}
                      name="class_name"
                    >
                      <option value="">Select Class</option>
                      {classList?.length && classList?.map((classItem) => (
                        <option key={classItem?._id} value={classItem?._id}>
                          {classItem?.class_name}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>
                <Col lg={3}>
                  <FormGroup controlId="validationCustom09">
                    <FormLabel className="labelForm">Select Section</FormLabel>
                    <FormSelect
                      value={student.section_name}
                      onChange={(e) =>
                        setStudent({ ...student, section_name: e.target.value })
                      }
                    >
                      <option value="">Select Section</option>
                      {sectionList?.length > 0 && sectionList?.map((sectionItem) => (
                        <option key={sectionItem?._id} value={sectionItem?._id}>
                          {sectionItem?.section_name} ({sectionItem?.section_code})
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroup>
                </Col>

                <Col lg={6}>
                  <FormGroup controlId="validationCustom02">
                    <FormLabel className="labelForm">Search By Keyword</FormLabel>
                    <FormControl required type="text" />
                  </FormGroup>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary">
                  <FaSearch /> Search
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <div className="tableSheet">
        <h2> Fees Statement </h2>

        <div className="card-body">
          <Row>
            <Col lg={3}>
              <div className="idBox">
                <div className="profilePhoto">
                  <Image src="/t-01.jpg" alt="" width="100" height="100" />
                </div>
                <h4>SAURABH AGRAHARI</h4>
              </div>
            </Col>
            <Col lg={9}>
              <BootstrapTable striped bordered hover>
                <tbody>
                  <tr>
                    <td>NAME</td>
                    <td>SAURABH AGRAHARI</td>
                    <td>CLASS/ SECTION</td>
                    <td>1ST (A)</td>
                  </tr>
                  <tr>
                    <td>FATHER NAME</td>
                    <td>MR. MANOJ</td>
                    <td>ADMISSION NO.</td>
                    <td>SCS 90087</td>
                  </tr>
                  <tr>
                    <td>MOBILE NUMBER</td>
                    <td>9637999855</td>
                    <td>ROLL NUMBER</td>
                    <td>125</td>
                  </tr>
                  <tr>
                    <td>CATEGORY</td>
                    <td>OBC</td>
                    <td>RTE</td>
                    <td style={{ color: "red", fontWeight: "bold" }}>No</td>
                  </tr>
                  <tr>
                    <td>TOTAL ASSIGNED</td>
                    <td>17400</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </BootstrapTable>
            </Col>
          </Row>
        </div>

        <Row className="justify-content-between mt-3 align-items-center">
          <Col lg={3}>
           Date : 30:10:2024
          </Col>
          <Col lg={9}>
            <div className="text-end">
              <Button variant="primary" className="btn-action">
                <FaPrint /> Assign Fees
              </Button>
              <Button variant="primary" className="btn-action">
                <FaPrint /> Assign Discount
              </Button>
              <Button variant="primary" className="btn-action">
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
            {console.log("loading", !loading, !error)}
            {(!loading && !error) ? <Table columns={columns} data={data} /> : ""}
          </div>
        </div>
      </div>


    </Container>
  );
};
export default FeeEntryy;
