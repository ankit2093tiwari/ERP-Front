"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';

const StudentVehicle = () => {

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'StudentName',
      selector: row => row.studentName,
      sortable: true,
    },
    {
      name: 'Father Name',
      selector: row => row.fatherName,
      sortable: true,
    },
    {
      name: 'Class',
      selector: row => row.class,
      sortable: true,
    },
    {
      name: 'TransportNo',
      selector: row => row.transportNo,
      sortable: true,
    },
    {
      name: 'Pickup-Point',
      selector: row => row.pickupPoint,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.amount,
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{
          display: 'flex',
          // marginLeft: '-30px'
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
      studentName: 'ADITYA PAL',
      fatherName: 'ARVIND KUMAR PAL',
      class: 'UKG',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    },
    {
      id: 2,
      studentName: 'ANISHA CHAUBEY',
      fatherName: 'ANAND CHAUBEY',
      class: '1(A)',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    },
    {
      id: 3,
      studentName: 'ALISHA KHAN',
      fatherName: 'ABDUL KHAN',
      class: '3(C)',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    },
    {
      id: 4,
      studentName: 'DIVYANSH BIND',
      fatherName: 'SHIV BIND',
      class: '6(C)',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    },
    {
      id: 5,
      studentName: 'MANVI SRIVASTAVA',
      fatherName: 'VIKAS SRIVASTAVA',
      class: '9(B)',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    },
    {
      id: 6,
      studentName: 'NAMAN SINGH',
      fatherName: 'AJAY SINGH',
      class: '11(B)',
      transportNo: 'UP32VT6066',
      pickupPoint: 'ONE',
      amount: '200',
    }
  ];

  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    class: '',
    transportNo: '',
    pickupPoint: '',
    amount: '',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <Container>
      <Row>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/transport/all-module">
              Transport
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Student Vehicle Relation</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={togglePopover} id="submit" type='button'>
            <CgAddR /> New Transport</Button>
          {isPopoverOpen && (

            <div className="cover-sheet">
              <div className="studentHeading"><h2>Add Expenses</h2></div>
              <Form onSubmit={handleSubmit} className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="4" controlId="validationCustom01">
                    <FormLabel className="labelForm">Student Name</FormLabel>
                    <FormSelect value={formData.studentName} onChange={handleChange} required>
                      <option>Nothing selected</option>
                      <option value="1">ADITYA PAL</option>
                      <option value="2">ANISHA CHAUBEY</option>
                      <option value="3">ALISHA KHAN</option>
                      <option value="4">DIVYANSH BIND</option>
                      <option value="5">MANVI SRIVASTAVA</option>
                      <option value="6">NAMAN SINGH</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="validationCustom02">
                    <FormLabel className="labelForm">Pickup-Point</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.pickupPoint}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4">
                    <FormLabel className="labelForm">Vehicle Route(No/Seats)</FormLabel>
                    <FormSelect value={formData.studentName} onChange={handleChange} required>
                      <option>Select</option>
                      <option value="1">24</option>
                      <option value="2">34</option>
                      <option value="3">52</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" className='btn btn-primary mt-4' onSubmit={handleSubmit}>Submit</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
        <div className="tableSheet">
          <h2>Existing Transport Records</h2>
          <Table columns={columns} data={data} />
          <div className={styles.buttons} style={{ float: 'right', marginRight: '10px' }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(StudentVehicle), { ssr: false });