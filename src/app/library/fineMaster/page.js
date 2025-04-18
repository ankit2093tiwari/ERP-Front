"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const FineMaster = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Entry Date",
      selector: (row) => row.entryDate,
      sortable: false,
    },
    {
      name: "Teacher Name",
      selector: (row) => row.teacherName,
      sortable: false,
    },
    {
      name: "Work Details",
      selector: (row) => row.workDetail,
      sortable: false,
    },
  ];

  const data = [
    {
      id: 1,
      entryDate: '',
      teacherName: "",
      workDetail: '',
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

  const breadcrumbItems = [{ label: "Library", link: "/library/all-module" }, { label: "Fine Master", link: "null" }]

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
        <Container className="">
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Fine Master </h2> </div>
            <Form className="formSheet">
              <Row>
                <Col lg={4}>
                  <FormLabel className="labelForm">Per day fine of Teacher </FormLabel>
                  <FormControl required type="text" />
                </Col>
                <Col lg={4}>
                  <FormLabel className="labelForm">Per day fine of Student</FormLabel>
                  <FormControl required type="text" />
                </Col>
              </Row>
              <Row>
                <Col><Button className={styles.search}>Update Fine</Button></Col>
              </Row>
            </Form>
          </div>
        </Container>
      </section>
    </>
  )
}

export default dynamic(() => Promise.resolve(FineMaster), { ssr: false })