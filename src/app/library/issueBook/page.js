"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const IssueBook = () => {
  const [data, setData] = useState([
    {
      id: 1,
      bookName: 'Thor',
      issuedTo: 'Student',
      personalDetail: [{ name: "Raju mandal", fatherName: "Father: Sanjay Mandal", class: "Class:2#A" }],
      issueDate: '10-09-2020'
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    barCode: "",
    bookName: "",
    accessionNo: "",
    issueTo: "",
    issuePeriod: "",
    issueDate: new Date().toISOString().split('T')[0]
  });

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
      name: "Issued To",
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
        <div className="d-flex gap-2">
          <button className="editButton">
            <FaEye />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = (row) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setData((prevData) => prevData.filter((item) => item.id !== row.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation here
    const newEntry = {
      id: data.length + 1,
      bookName: formData.bookName,
      issuedTo: formData.issueTo,
      personalDetail: [{
        name: "Sample Student",
        fatherName: "Father: Sample Father",
        class: "Class: Sample Class"
      }],
      issueDate: formData.issueDate
    };
    setData([...data, newEntry]);
    setShowAddForm(false);
    setFormData({
      barCode: "",
      bookName: "",
      accessionNo: "",
      issueTo: "",
      issuePeriod: "",
      issueDate: new Date().toISOString().split('T')[0]
    });
  };

  const breadcrumbItems = [{ label: "Library", link: "/library/all-module" }, { label: "Issue Book", link: "null" }];

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Issue Book
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Issue Books</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Bar Code</FormLabel>
                    <FormControl 
                      type="text" 
                      value={formData.barCode}
                      onChange={(e) => setFormData({...formData, barCode: e.target.value})}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Book Name</FormLabel>
                    <FormSelect
                      value={formData.bookName}
                      onChange={(e) => setFormData({...formData, bookName: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Comic Book">Comic Book</option>
                      <option value="Book Title">Book Title</option>
                      <option value="Thor Thunder">Thor Thunder</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Accession No</FormLabel>
                    <FormControl 
                      type="text" 
                      value={formData.accessionNo}
                      onChange={(e) => setFormData({...formData, accessionNo: e.target.value})}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button type="button" className="btn btn-primary">
                      Search Book
                    </Button>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Issue To</FormLabel>
                    <FormSelect
                      value={formData.issueTo}
                      onChange={(e) => setFormData({...formData, issueTo: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Student">Student</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Item Issue Period</FormLabel>
                    <FormSelect
                      value={formData.issuePeriod}
                      onChange={(e) => setFormData({...formData, issuePeriod: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="1 Day">1 Day</option>
                      <option value="2 Days">2 Days</option>
                      <option value="3 Days">3 Days</option>
                      <option value="4 Days">4 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="6 Days">6 Days</option>
                      <option value="7 Days">7 Days</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Book Issue Date</FormLabel>
                    <FormControl 
                      type="date" 
                      value={formData.issueDate}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                      disabled
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Button type="submit" className="btn btn-primary">
                      Issue Book
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Issued Books Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(IssueBook), { ssr: false });