"use client";
import React, { useState } from "react";
import Table from "@/app/component/DataTable";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, Button, Breadcrumb } from "react-bootstrap";
import { FormSelect } from "react-bootstrap";
import styles from "@/app/students/assign-roll-no/page.module.css"

const IdCardPage = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Class",
      selector: (row) => row.class,
      sortable: true,
    },
    {
      name: "Section",
      selector: (row) => row.section,
      sortable: true,
    },
    {
      name: "RollNo",
      selector: (row) => row.rollNo,
      sortable: true,
    },
    {
      name: "StudentName",
      selector: (row) => row.studentName,
      sortable: true,
    },
    {
      name: "FatherName",
      selector: (row) => row.fatherName,
      sortable: true,
    },
    {
      name: "MobileNo",
      selector: (row) => row.mobileNo,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-block">
          <button
            className="editButton"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="editButton"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const [data, setData] = useState([
    {
      id: 1,
      class: "1",
      section: 'A',
      rollNo: '101',
      studentName: 'Ishaan Sinha',
      fatherName: 'Mridul Sinha',
      mobileNo: '+91-9876653234'
    },
    {
      id: 2,
      class: "1",
      section: 'A',
      rollNo: '102',
      studentName: 'Nisha Shukla',
      fatherName: 'Ajay Shukla',
      mobileNo: '+91-9876653234'
    },
  ]);

  const handleEdit = (id) => {
    const item = data.find((row) => row.id === id);
    const updatedName = prompt("Enter new name:", item.className);
    const updatedCode = prompt("Enter new code:", item.classCode);
    const updatedSection = prompt(
      "Enter new sections as JSON (e.g., [{\"code\": \"1\", \"name\": \"A\"}])",
      JSON.stringify(item.sections)
    );

    try {
      const parsedSections = JSON.parse(updatedSection);
      setData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? { ...row, className: updatedName, classCode: updatedCode, sections: parsedSections }
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

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/students/all-module">
              Student
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Id Card</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div className="cover-sheet">
        <div className="studentHeading"><h2>Student Details ClassWise</h2></div>
        <Form className="formSheet">
          <Row>
            <Col>
              <FormLabel className="labelForm">Select Class</FormLabel>
              <FormSelect>
                <option>Select Class</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
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
          </Row>
          <Row>
            <Col><Button className="btn btn-primary mt-4">Search Students</Button></Col>
          </Row>
        </Form>
      </div>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Students Details</h2>
            <Table columns={columns} data={data} />
            <div className={styles.buttons}>
              <button type="button" className="editButton">Previous</button>
              <button type="button" className="editButton">Next</button>
            </div>
          </div>
        </Col>
      </Row>

    </Container>
  );
};

export default dynamic(() => Promise.resolve(IdCardPage), { ssr: false })
