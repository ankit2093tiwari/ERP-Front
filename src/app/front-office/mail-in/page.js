"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const MailIn = () => {

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
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // IsPopoverOpen(false);
  };

  const breadcrumbItems = [{ label: "Front Office", link: "/front-office/all-module" }, { label: "Mail In", link: "null" }]

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
          <Row>
            <Col>
              <button onClick={onOpen} id="submit" type='button' className='btn-add'>
                <CgAddR /> New Mail</button>
              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading"><h2>New Mail</h2>
                    <button className='closeForm' onClick={onClose}> X </button>
                  </div>
                  <Form onSubmit={handleSubmit} className="formSheet">
                    <Row className="mb-3">
                      <FormGroup as={Col} md="4" controlId="validationCustom02">
                        <FormLabel className="labelForm" value={formData.mailNo} onChange={handleChange} required>Mail No</FormLabel>
                        <FormControl required type="number" />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom01">
                        <FormLabel className="labelForm" value={formData.forWhom} onChange={handleChange} required>For Whom</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">Anshika</option>
                          <option value="2">Ashu</option>
                          <option value="3">Akansha</option>
                          <option value="4">Nikhil</option>
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom08">
                        <FormLabel className="labelForm" value={formData.date} onChange={handleChange} required>Date</FormLabel>
                        <FormControl required type="date" />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="4" controlId="validationCustom07">
                        <FormLabel className="labelForm" value={formData.mode} onChange={handleChange} required>Mode</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">General Post</option>
                          <option value="2">Speed Post</option>
                          <option value="3">Courier</option>
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom03">
                        <FormLabel className="labelForm" value={formData.fromF} onChange={handleChange} required>From</FormLabel>
                        <FormControl required type="text" />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom04">
                        <FormLabel className="labelForm" value={formData.courierName} onChange={handleChange} required>Courier Name</FormLabel>
                        <FormControl
                          required
                          type="text"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="4" controlId="validationCustom05">
                        <FormLabel className="labelForm" value={formData.address} onChange={handleChange} required>Address</FormLabel>
                        <FormControl
                          required
                          type="textarea"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom06">
                        <FormLabel className="labelForm" value={formData.receiver} onChange={handleChange} required>Receiver</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">Manvi</option>
                          <option value="2">Sanvi</option>
                          <option value="3">Suresh</option>
                          <option value="3">Shashi</option>
                        </FormSelect>
                      </FormGroup>

                      <FormGroup as={Col} md="4" controlId="validationCustom16">
                        <FormLabel className="labelForm" value={formData.remark} onChange={handleChange} required>Remark</FormLabel>
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
              <div className="tableSheet">
                <h2>Mail In Records</h2>
                <Table columns={columns} data={data} />
                <div className={styles.buttons} style={{ float: 'right', marginRight: '10px' }}>
                  <button type="button" className="editButton">Previous</button>
                  <button type="button" className="editButton">Next</button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(MailIn), { ssr: false });