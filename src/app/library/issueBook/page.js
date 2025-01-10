"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const IssueBook = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Book Name",
      selector: (row) => row.bookName,
      sortable: false,
    },
    {
      name: "Issued To.",
      selector: (row) => row.issuedTo,
      sortable: false,
    },
    {
      name: "Personal Details",
      selector: (row) => (
        <div>
          {row.personalDetail.map((student, index) => (
            <div key={index}>
              {student.name}<br />{student.fatherName} <br />{student.class}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Issue Date",
      selector: (row) => row.issueDate,
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
          <button className="editButton">
            <FaEye />
          </button>
        </div>
      ),
    },
  ];
  const data = [
    {
      id: 1,
      bookName: 'Thor',
      issuedTo: 'Student',
      personalDetail: [{ name: "Raju mandal", fatherName: "Father: Sanjay Mandal", class: "Class:2#A" }],
      issueDate: '10-09-2020'
    },
  ];
  const handleEdit = (id) => {
    const item = data.find((row) => row.id === id);
    const updatedName = prompt("Enter new name:", item.name);
    try {
      const parsedSections = JSON.parse(updatedSection);
      setData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? { ...row, name: updatedName }
            : row
        )
      );
    } catch (error) {
      alert("Invalid JSON for sections. Please try again.");
    }
  };
  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setData((prevData) => prevData.filter((item) => item.id !== row.id));
    }
  };
  const [showResults, setShowResults] = React.useState(false)
  const onClick = () => setShowResults(true)



  return (
    <Container className="">
       <Row className='mt-1 mb-1'>
                    <Col>
                      <Breadcrumb>
                        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href="/library/all-module">
                          Library
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Issue Book</Breadcrumb.Item>
                      </Breadcrumb>
                    </Col>
                  </Row>
      <button onClick={onClick} className={`mb-4 ${styles.search}`} id="submit">  <CgAddR />  Issue Book </button>
      {showResults ?
        <div className="cover-sheet">
          <div className="studentHeading"><h2>Issue Books</h2></div>
          <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={4}>
                <FormLabel className="labelForm">Bar Code</FormLabel>
                <FormControl required type="text" />
              </Col>
              <Col lg={4}>
                <FormLabel className="labelForm">Book Name</FormLabel>
                <FormSelect>
                  <option>Select</option>
                  <option value="1">Comic Book </option>
                  <option value="2">Book Title</option>
                  <option value="2">Thor Thunder</option>
                </FormSelect>
              </Col>

              <Col lg={4}>
                <FormLabel className="labelForm">Accession No</FormLabel>
                <FormControl required type="text" />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col><Button className="btn btn-primary mt-4"> Search Book</Button></Col>
            </Row>
            <hr />
            <Row>
              <Col lg={4}>
                <FormLabel className="labelForm">Issue To</FormLabel>
                <FormSelect>
                  <option>Select</option>
                  <option value="1">Faculty</option>
                  <option value="2">Student</option>
                </FormSelect>
              </Col>
              <Col lg={4}>
                <FormLabel className="labelForm">Item Issue Period</FormLabel>
                <FormSelect>
                  <option>Select</option>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days</option>
                  <option value="6">6 Days</option>
                  <option value="7">7 Days</option>
                </FormSelect>
              </Col>

              <Col lg={4}>
                <FormLabel className="labelForm">Book Issue Date</FormLabel>
                <FormControl required type="date" disabled />
              </Col>

            </Row>


            <Row className="mb-3">
              <Col><Button className="btn btn-primary mt-4"> Issue Book</Button></Col>
            </Row>

          </Form>
        </div>
        : null}

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Issued Books Records </h2>
            <Table columns={columns} data={data} />
          </div>
        </Col>
      </Row>


    </Container>
  )
}

export default dynamic(() => Promise.resolve(IssueBook), { ssr: false })