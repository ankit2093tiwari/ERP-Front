"use client";

import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import styles from "@/app/students/add-new-student/page.module.css";
import dynamic from 'next/dynamic';

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

  return (
    <Container>
      <Row className="mt-5 mb-3">
        <Col>
          <Breadcrumb style={{ marginLeft: '20px' }}>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/transport">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Purchase Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 style={{ marginLeft: '23px' }}>Purchase List</h2>
          <Table columns={columns} data={data} />
          <div className={styles.buttons} style={{ float: 'right', marginRight: '10px' }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(PurchaseMaster), { ssr: false });
