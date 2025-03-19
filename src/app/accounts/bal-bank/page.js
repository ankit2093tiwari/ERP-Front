"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const BalBank = () => {

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
      name: "Student Name",
      selector: (row) => row.studentName,
      sortable: false,
    },

    {
      name: "itemName",
      selector: (row) => row.itemName,
      sortable: false,
    },

    {
      name: "Amount/Item",
      selector: (row) => row.amount,
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => row.totalAmount,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
    },
    {
      name: "Mode of Payment",
      selector: (row) => row.modePayment,
      sortable: true,
    },
  ];

  const data = [
    {
      id: 1,
      entryDate: '20',
      studentName: "Stationary Pen",
      itemName: '',
      amount: "300.00",
      quantity: "AKANKSHA",
      totalAmount: 'Remarks',
      description: '24-09-2020',
      modePayment: '',
    },
    {
      id: 2,
      entryDate: '20',
      studentName: "Stationary Pen",
      itemName: '',
      amount: "300.00",
      quantity: "AKANKSHA",
      totalAmount: 'Remarks',
      description: '24-09-2020',
      modePayment: '',
    },
  ];
  const breadcrumbItems = [{ label: "Accounts", link: "/accounts/all-module" }, { label: "Bal Bank", link: "null" }]
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
          <Row>
            <Col>
              <div className="tableSheet">
                <h2> Bal Bank Report </h2>
                <Table columns={columns} data={data} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default BalBank