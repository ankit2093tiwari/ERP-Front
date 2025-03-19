"use client";
import React, { useState } from 'react';
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
const ExpenceEntry = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: false,
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName,
      sortable: false,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: false,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
          <button
            className="editButton"
            onClick={() => handleEdit(row.id)}
          >
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row.id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      date: "2020-10-27",
      itemName: "Demo Item",
      amount: '2000',
      description: "Desc1",

    },
  ];
  const handleEdit = (id) => {
    const item = data.find((row) => row.id === id);
    const updatedName = prompt("Enter new name:", item.doctorName);
    const updatedMobile = prompt("Enter new Mobile No:", item.mobileNo);
    const updatedEmail = prompt("Enter new Email Id:", item.emailId);
    const updatedAddress = prompt("Enter new Address:", item.address);
    const updatedSpecialist = prompt("Enter Specialist:", item.specialist);
    const updatedDescription = prompt("Enter Description:", item.discription);
    try {
      const parsedSections = JSON.parse(updatedSection);
      setData((prevData) =>
        prevData.map((row) =>
          row.id === id
            ? { ...row, doctorName: updatedName, mobileNo: updatedMobile, emailId: updatedEmail, address: updatedAddress, specialist: updatedSpecialist, discription: updatedDescription, }
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const breadcrumbItems = [{ label: "Accounts", link: "/accounts/all-module" }, { label: "Expense Entry", link: "null" }]

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          <Button onClick={onOpen} className="btn-add"> <CgAddR /> New Expenses </Button>
          {isPopoverOpen ?
            <div className="cover-sheet">
              <div className="studentHeading"><h2>New Mail</h2>
                <button className='closeForm' onClick={onClose}> X </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl required type="date" />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Name</FormLabel>
                    <FormControl required type="text" />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Description</FormLabel>
                    <Form.Control as="textarea" rows={1} />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Amount</FormLabel>
                    <FormControl required type="text" />
                  </Col>
                </Row><br />
                <Row className="mb-3">
                  <Col><Button className="btn btn-primary mt-4">Submit</Button></Col>
                </Row>
              </Form>
            </div>
            : null}
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Expense Records</h2>
                <Table columns={columns} data={data} />
              </div>
            </Col>
          </Row>
        </Container >
      </section>
    </>
  )
}
export default dynamic(() => Promise.resolve(ExpenceEntry), { ssr: false })