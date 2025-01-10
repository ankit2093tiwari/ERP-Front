"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';

const FuelFilling = () => {

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
    },
    {
      name: 'AmountPerLitre',
      selector: row => row.amountPerLitre,
      sortable: true,
    },
    {
      name: 'Quantity Of Diesel/Petrol/CNG',
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: 'PreviousReading',
      selector: row => row.previousReading,
      sortable: true,
    },
    {
      name: 'NewReading',
      selector: row => row.newReading,
      sortable: true,
    },
    {
      name: 'TotalAmount',
      selector: row => row.totalAmount,
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
      date: '10/08/2022',
      vehicleNo: 'Test_123',
      amountPerLitre: '60 Rs.',
      quantity: '500',
      previousReading: '11803',
      newReading: '23802',
      totalAmount: '1301',
    },
    {
      id: 2,
      date: '10/09/2022',
      vehicleNo: 'UP35BT7869',
      amountPerLitre: '67 Rs.',
      quantity: '550',
      previousReading: '11821',
      newReading: '25802',
      totalAmount: '1400',
    },
    {
      id: 3,
      date: '10/10/2022',
      vehicleNo: 'UP35AT4233',
      amountPerLitre: '68 Rs.',
      quantity: '500',
      previousReading: '11903',
      newReading: '25002',
      totalAmount: '1500',
    },
    {
      id: 4,
      date: '10/11/2022',
      vehicleNo: 'UP35BT9261',
      amountPerLitre: '70 Rs.',
      quantity: '550',
      previousReading: '12003',
      newReading: '26215',
      totalAmount: '1700',
    },
    {
      id: 5,
      date: '10/12/2022',
      vehicleNo: 'UP35BT1165',
      amountPerLitre: '75 Rs.',
      quantity: '500',
      previousReading: '12663',
      newReading: '24002',
      totalAmount: '1900',
    },
    {
      id: 6,
      date: '10/01/2023',
      vehicleNo: 'UP35BT4428',
      amountPerLitre: '75 Rs.',
      quantity: '550',
      previousReading: '12653',
      newReading: '22702',
      totalAmount: '1901',
    }
  ];

  const [formData, setFormData] = useState({
    vehicleNo: '',
    filledStation: '',
    quantity: '',
    previousReading: '',
    amountPerLitre: '',
    newReading: '',
    totalAmount: '',
    date: '',
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
    <Container className={styles.vehicle}>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/transport/all-module">
              Transport
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Fuel Filling</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={togglePopover} id="submit" type='button'>
            <CgAddR/> New Expenses 
          </Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading"><h2>Add Expenses</h2></div>
              <Form onSubmit={handleSubmit} className='formSheet'>
                <Row className="mb-3">
                  <FormGroup as={Col} lg="4" controlId="validationCustom01">
                    <FormLabel className="labelForm">Vehicle No</FormLabel>
                    <FormSelect value={formData.vehicleNo} onChange={handleChange} required>
                      <option>Select Type</option>
                      <option value="1">VAN</option>
                      <option value="2">AUTO RICKSHAW</option>
                      <option value="3">RICKSHAW</option>
                      <option value="4">BUS</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="validationCustom02">
                    <FormLabel className="labelForm">Filled Station</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.filledStation}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="validationCustom03">
                    <FormLabel className="labelForm">Quantity Of Diesel/Petrol/CNG</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} lg="4" controlId="validationCustom04">
                    <FormLabel className="labelForm">Previous Reading</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.previousReading}
                      onChange={handleChange}
                    />
                </FormGroup>
               
                  <FormGroup as={Col} lg="4" controlId="validationCustom05">
                    <FormLabel className="labelForm">Amount Per Litre</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.amountPerLitre}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="validationCustom06">
                    <FormLabel className="labelForm">New Reading</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.newReading}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} lg="4" controlId="validationCustom07">
                    <FormLabel className="labelForm">Total Amount</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.totalAmount}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} lg="4" controlId="validationCustom08">
                    <FormLabel className="labelForm">Date</FormLabel><br />
                    <FormControl
                      required
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" className='btn btn-primary mt-4' onSubmit={handleSubmit}>Add Expenses</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="tableSheet">
          <h2>Vehicle Expenses Records</h2>
          <Table columns={columns} data={data} />
          <div className={styles.buttons} style={{ float: 'right', marginRight: '10px' }}>
            <button type="button" className="editButton">Previous</button>
            <button type="button" className="editButton">Next</button>
          </div>
        </div>
      </Col>
    </Row>
     </Container >
  );
};

export default dynamic(() => Promise.resolve(FuelFilling), { ssr: false });