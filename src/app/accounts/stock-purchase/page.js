"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import "react-datepicker/dist/react-datepicker.css";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const StockPurchase = () => {
  const [formData, setFormData] = useState({
    mailNo: '',
    forWhom: '',
    date: '',
    mode: '',
    fromF: '',
    courierName: '',
    address: '',
    receiver: '',
    remark: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'From',
      selector: row => row.from,
      sortable: true,
    },
    {
      name: 'For Whom',
      selector: row => row.forWhom,
      sortable: true,
    },
    {
      name: 'Mode',
      selector: row => row.mode,
      sortable: true,
    },
    {
      name: 'Receiver',
      selector: row => row.receiver,
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{
          display: 'flex',
        }}>
          <button className='editButton'
            onClick={() => handleEdit(row.id)}
          >
            <FaEdit />
          </button>
          <button className="editButton btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    }
  ];

  const data = [
    {
      id: 1,
      from: 'from1',
      forWhom: 'Anokhi',
      mode: 'General Post',
      receiver: 'Neha',
    },
    {
      id: 2,
      from: 'from2',
      forWhom: 'Anshika',
      mode: 'General Post',
      receiver: 'Nupul',
    },
    {
      id: 3,
      from: 'from3',
      forWhom: 'Anil',
      mode: 'Courier',
      receiver: 'Neelesh',
    },
    {
      id: 4,
      from: 'from4',
      forWhom: 'Anu',
      mode: 'General Post',
      receiver: 'Nitin',
    },
  ];

  const [startDate, setStartDate] = useState(new Date());

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsPopoverOpen(false);
  };

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/accounts/all-module">
              Account
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Stock Purchase</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
     
      <Row>
        <Col>
        <div className="tableSheet">
          <h2>Stock Purchase Records</h2>
          <Table columns={columns} data={data} />
          <div className={styles.buttons} style={{float: 'right', marginRight: '10px' }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(StockPurchase), { ssr: false });