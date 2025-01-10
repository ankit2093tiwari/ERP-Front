"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import "react-datepicker/dist/react-datepicker.css";

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
            Edit
          </button>
          <button className="editButton"
            onClick={() => handleDelete(row.id)}
          >
            Delete
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
    <Container className={styles.vehicle}>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb style={{ marginLeft: '20px' }}>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/front-office/all-module">
              Front Office
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Mail In</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <button onClick={togglePopover} id="submit" type='button' style={{ marginLeft: '20px' }}>
            <CgAddR style={{ fontSize: '27px', marginTop: '-2px', marginRight: '5px' }} />New Mail</button>
          {isPopoverOpen && (
            <div className='absolute right-0 mt-3 w-60 p-4' style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '940px' }}>
              <h3>New Mail</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom02">
                    <FormLabel value={formData.mailNo} onChange={handleChange} required>Mail No</FormLabel>
                    <FormControl
                      required
                      type="number"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom01">
                    <FormLabel value={formData.forWhom} onChange={handleChange} required>For Whom</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option value="1">Anshika</option>
                      <option value="2">Ashu</option>
                      <option value="3">Akansha</option>
                      <option value="4">Nikhil</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom08">
                  <FormLabel value={formData.date} onChange={handleChange} required>Date</FormLabel>
                    <FormControl
                      required
                      type="date"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom07">
                    <FormLabel value={formData.mode} onChange={handleChange} required>Mode</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option value="1">General Post</option>
                      <option value="2">Speed Post</option>
                      <option value="3">Courier</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom03">
                    <FormLabel value={formData.fromF} onChange={handleChange} required>From</FormLabel>
                    <FormControl
                      required
                      type="text"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom04">
                    <FormLabel value={formData.courierName} onChange={handleChange} required>Courier Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom05">
                    <FormLabel value={formData.address} onChange={handleChange} required>Address</FormLabel>
                    <FormControl
                      required
                      type="textarea"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom06">
                    <FormLabel value={formData.receiver} onChange={handleChange} required>Receiver</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option value="1">Manvi</option>
                      <option value="2">Sanvi</option>
                      <option value="3">Suresh</option>
                      <option value="3">Shashi</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom16">
                    <FormLabel value={formData.remark} onChange={handleChange} required>Remark</FormLabel>
                    <FormControl
                      required
                      type="textarea"
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Submit</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 style={{ marginLeft: '23px', marginTop: '15px', marginBottom: '25px', fontSize: '22px' }}>Mail In Records</h2>
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

export default dynamic(() => Promise.resolve(StockPurchase), { ssr: false });