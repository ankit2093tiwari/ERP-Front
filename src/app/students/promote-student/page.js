"use client";
import React, { useState } from "react";
import Table from "@/app/component/DataTable";
// import styles from "../year-master/page.module.css";
import styles from "@/app/students/assign-roll-no/page.module.css"
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb } from "react-bootstrap";
import { FormSelect } from "react-bootstrap";

const PromoteStudentPage = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: 'Student Name',
      selector: (row) => row.studentName,
      sortable: true,
    },
    {
      name: 'Father Name',
      selector: (row) => row.fatherName,
      sortable: true,
    },
    {
      name: "Adm. no.",
      selector: (row) => row.adminNo,
      sortable: true,
    },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
    },
    {
      name: "RollNo",
      selector: (row) => row.rollNo,
      sortable: true,
    },
  ];

  const data = [
    {
      id: 1,
      studentName: 'Ishika Verma',
      fatherName: 'Shiv Verma',
      adminNo: '1123894853895',
      gender: 'male',
      rollNo: '111'
    },
    {
      id: 2,
      studentName: 'Ayushi Johri',
      fatherName: 'Ajay Johri',
      adminNo: '1123894853896',
      gender: 'female',
      rollNo: '112'
    },
  ];


  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">
              Student
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Promote Students</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div className="cover-sheet">
        <div className="studentHeading"><h2>Promote Students</h2></div>
        <Form className="formSheet">
          <Row>
            <Col>
              <FormLabel className="labelForm">Select Class</FormLabel>
              <FormSelect>
                <option>Select Class</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="3">4</option>
                <option value="3">5</option>
                <option value="3">6</option>
                <option value="3">7</option>
                <option value="3">8</option>
              </FormSelect>
            </Col>
            <Col>
              <FormLabel className="labelForm">Select Section</FormLabel>
              <FormSelect>
                <option>Select Section</option>
                <option value="1">A</option>
                <option value="2">B</option>
                <option value="3">C</option>
              </FormSelect>
            </Col>
          </Row><br />
          <Row>
            <Col><Button className="btn btn-primary">Search Students</Button></Col>
          </Row>
        </Form>
      </div>

      <Row>
        <Col>
        <div className="tableSheet">
          <h2>Students Records</h2>
          <Table columns={columns} data={data} />
          <div className={styles.buttons}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
          </div>
        </Col>
      </Row>
    
    </Container >
  );
};

export default dynamic(() => Promise.resolve(PromoteStudentPage), { ssr: false })
