"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const hrdSallary = () => {
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Sal. Date",
      selector: (row) => row.salDate,
      sortable: false,
    },
    {
      name: "Emp. Code",
      selector: (row) => row.empcode,
      sortable: false,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: false,
    },
    {
      name: "Act. Basic",
      selector: (row) => row.actBasic,
      sortable: false,
    },
    {
      name: "Basic",
      selector: (row) => row.basic,
      sortable: false,
    },
    {
      name: "Increment",
      selector: (row) => row.increment,
      sortable: false,
    },
    {
      name: "VE",
      selector: (row) => row.ve,
      sortable: true,
    },
    {
      name: "Gross Pay",
      selector: (row) => row.grossPay,
      sortable: true,
    },
    {
      name: "PF",
      selector: (row) => row.pf,
      sortable: true,
    },
    {
      name: "LIC",
      selector: (row) => row.lic,
      sortable: true,
    },
    {
      name: "Sal. Adv",
      selector: (row) => row.salAdv,
      sortable: true,
    },
    {
      name: "VD",
      selector: (row) => row.vd,
      sortable: true,
    },
    {
      name: "ESI",
      selector: (row) => row.esi,
      sortable: true,
    },
    {
      name: "Total Deb.",
      selector: (row) => row.totalDeb,
      sortable: true,
    },
    {
      name: "Net Salery",
      selector: (row) => row.netSalary,
      sortable: true,
    },
  ];

  const data = [
    {
      id: 1,
      salDate: '20',
      empcode: '',
      name: '',
      actBasic: '',
      basic: "",
      increment: '',
      ve: "300.00",
      grossPay: '',
      pf: "AKANKSHA",
      lic: 'Remarks',
      salAdv: '24-09-2020',
      vd: '',
      esi: '',
      totalDeb: '',
      netSalary: '',
    },
  ];


  const breadcrumbItems = [{ label: "Accounts", link: "/accounts/all-module" }, { label: "HRD Salry", link: null }]


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
                <h2>HRD Salary Records </h2>
                <Table columns={columns} data={data} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}

export default hrdSallary