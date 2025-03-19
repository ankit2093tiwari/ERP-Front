"use client";

import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import styles from "@/app/students/add-new-student/page.module.css";
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const PurchaseMaster = () => {
  const columns = [
    {
      name: '#',
      selector: (row) => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Item',
      selector: (row) => row.item,
      sortable: true,
    },
    {
      name: 'Item Category',
      selector: (row) => row.itemCategory,
      sortable: true,
    },
    {
      name: 'Vendor',
      selector: (row) => (
        <div>
          {row.vendors.map((vendor, index) => (
            <div key={index}>
              {vendor.name}<br />
              {vendor.mobileNo}<br />
              {vendor.email}<br />
              {vendor.orgName}
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: 'Quantity',
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: 'Action',
      selector: (row) => row.action,
      sortable: true,
    },
    {
      name: 'Store',
      selector: (row) => row.store,
      sortable: true,
    },
  ];

  const [data] = useState([
    {
      id: 1,
      item: '',
      itemCategory: '',
      vendors: [
        {
          name: "Name: Anish",
          mobileNo: 'MobNo.: 9874562130',
          email: 'Email: mailto:anish21@gmail.com',
          orgName: 'Org.Name: org',
        },
      ],
      quantity: '10',
      date: '23-01-2022',
      action: 'Print',
      store: '',
    },
    {
      id: 2,
      item: '',
      itemCategory: '',
      vendors: [
        {
          name: "Name: Anish",
          mobileNo: 'MobNo.: 9874562130',
          email: 'Email: mailto:anish21@gmail.com',
          orgName: 'Org.Name: org',
        },
      ],
      quantity: '10',
      date: '23-01-2022',
      action: 'Print',
      store: '',
    },
    {
      id: 3,
      item: '',
      itemCategory: '',
      vendors: [
        {
          name: "Name: Anish",
          mobileNo: 'MobNo.: 9874562130',
          email: 'Email: mailto:anish21@gmail.com',
          orgName: 'Org.Name: org',
        },
      ],
      quantity: '10',
      date: '23-01-2022',
      action: 'Print',
      store: '',
    },
  ]);
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Purchase Order", link: "null" }]
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
                <h2>Purchase List</h2>
                <Table columns={columns} data={data} />

              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>

  );
};

export default dynamic(() => Promise.resolve(PurchaseMaster), { ssr: false });
