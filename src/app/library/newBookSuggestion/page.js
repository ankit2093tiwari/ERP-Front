"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const NewBookSuggestion = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Item Group",
      selector: (row) => row.itemgroup,
      sortable: false,
    },
    {
      name: "Item category.",
      selector: (row) => row.itemCategory,
      sortable: false,
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName,
      sortable: false,
    },
    {
      name: "Item Language",
      selector: (row) => row.itemLang,
      sortable: false,
    },
    {
      name: "Author Name",
      selector: (row) => row.authorName,
      sortable: false,
    },
    {
      name: "Subject",
      selector: (row) => row.subject,
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">

          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row.id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
    {
      name: "Publish Name",
      selector: (row) => row.publishName,
      sortable: false,
    },

    {
      name: "Publish Year",
      selector: (row) => row.publishYear,
      sortable: false,
    },
    {
      name: "Edition",
      selector: (row) => row.edition,
      sortable: false,
    },

  ];

  const data = [
    {
      id: 1,
      publishername: "VISIT TO FIRE STATION",
      phoneNo: '',
      regNo: '',
      faxNo: '',
      location: '',
      taxident: '',
      mobNo: '',
      email: ''
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
                        <Breadcrumb.Item active>New Book Suggestion</Breadcrumb.Item>
                      </Breadcrumb>
                    </Col>
                  </Row>
      <button onClick={onClick} className={`mb-4 ${styles.search}`} id="submit">  <CgAddR />  Add New Suggestion  </button>
      {showResults ?
        <div className="cover-sheet">
          <div className="studentHeading"><h2>Add New Suggestion</h2></div>
          <Form className="formSheet">

            <div className="result">
              <Row className="mb-3">
                <Col lg={4}>
                  <FormLabel className={styles.class}>Item Group</FormLabel>
                  <FormSelect>
                    <option>Select</option>
                    <option value="1">School Books</option>
                    <option value="2">Current Affairs</option>
                    <option value="3">Comic Book</option>
                  </FormSelect>
                </Col>
                <Col lg={4}>
                  <FormLabel className={styles.class}>Subject</FormLabel>
                  <FormControl required type="text" />
                </Col>

                <Col lg={4}>
                  <FormLabel className={styles.class}>Item Category</FormLabel>
                  <FormSelect>
                    <option>Select</option>
                    <option value="1">Central Library</option>
                    <option value="2">Information Technology</option>
                  </FormSelect>
                </Col>
              </Row><br />
              <Row>
                <Col lg={4}>
                  <FormLabel className={styles.class}>Publisher Name</FormLabel>
                  <FormControl required type="text" />
                </Col>

                <Col lg={4}>
                  <FormLabel className={styles.class}>Item Name</FormLabel>
                  <FormControl required type="text" />
                </Col>
                <Col lg={4}>
                  <FormLabel className={styles.class}>Publication Year</FormLabel>
                  <FormControl required type="text" />
                </Col>
              </Row>
              <br />
              <Row>
                <Col lg={4}>
                  <FormLabel className={styles.class}>Item Language</FormLabel>
                  <FormControl required type="text" />
                </Col>
                <Col lg={4}>
                  <FormLabel className={styles.class}>Edition</FormLabel>
                  <FormControl required type="text" />
                </Col>

                <Col lg={4}>
                  <FormLabel className={styles.class}>Author Name </FormLabel>
                  <FormControl required type="text" />
                </Col>
              </Row>
              <br />
              <Row className="mb-3">
                <Col><Button className="btn btn-primary mt-4"> Add New Suggestion</Button></Col>
              </Row>
            </div>
          </Form>
        </div>
        : null}


      <br />
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Library Publisher Records </h2>
            <Table columns={columns} data={data} />
          </div>
        </Col>
      </Row>

    </Container>
  )
}

export default dynamic(() => Promise.resolve(NewBookSuggestion), { ssr: false })