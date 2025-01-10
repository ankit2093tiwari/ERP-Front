"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const QuotationMaster = () => {
  const [formData, setFormData] = useState({
    storeName: '',
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
      width: '80px',
    },
    {
      name: 'Item',
      selector: row => row.item,
      sortable: true,
    },
    {
      name: 'ItemCategory',
      selector: row => row.itemCategory,
      sortable: true,
    },
    {
      name: 'Vendor',
      selector: row => row.vendorName,
      sortable: true,
    },
    {
      name: 'Quoted Price/Unit',
      selector: row => row.pricePerUnit,
      sortable: true,
    },
    {
      name: 'Quotation No',
      selector: row => row.quotationNo,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date,
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
            Purchase
          </button>
        </div>
      ),
    }
  ];

  const data = [
    {
      id: 1,
      item: 'Factory Outlet',
      itemCategory: 'Furniture',
      vendorName: 'Chair',
      pricePerUnit: '3',
      quotationNo: '5',
      date: '20/09/2000',
    },
    {
      id: 2,
      item: 'Factory Outlet',
      itemCategory: 'Furniture',
      vendorName: 'Chair',
      pricePerUnit: '3',
      quotationNo: '5',
      date: '20/09/2000',
    },
    {
      id: 3,
      item: 'Factory Outlet',
      itemCategory: 'Furniture',
      vendorName: 'Chair',
      pricePerUnit: '3',
      quotationNo: '5',
      date: '20/09/2000',
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
            <Breadcrumb.Item href="/stock/all-module">
              Stock Module
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Quotation Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <button onClick={togglePopover} id="submit" type='button' style={{ marginLeft: '20px' }}>
            <CgAddR style={{ fontSize: '27px', marginTop: '-2px', marginRight: '5px' }} /> Add Quotation</button>
          {isPopoverOpen && (
            <div className='absolute right-0 mt-3 w-60 p-4' style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '940px' }}>
              <h3>Add Quotation</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom06">
                    <FormLabel value={formData.itemCategory} onChange={handleChange} required>Item category</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option value="1">RECUURING</option>
                      <option value="2">NON RECUURING</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom05">
                    <FormLabel value={formData.itemName} onChange={handleChange} required>Item Name</FormLabel>
                    <FormControl
                      required
                      type="textarea"
                    />
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom01">
                    <FormLabel value={formData.pricePerUnit} onChange={handleChange} required>Price Per Unit</FormLabel>
                    <FormControl
                      required
                      type="number"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom02">
                    <FormLabel value={formData.vendorName} onChange={handleChange} required>Vendor Name</FormLabel>
                    <FormSelect>
                      <option>Select</option>
                      <option value="1">RECUURING</option>
                      <option value="2">NON RECUURING</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom07">
                    <FormLabel value={formData.quotationNo} onChange={handleChange} required>Quotation No</FormLabel>
                    <FormControl
                      required
                      type="number"
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom08">
                    <FormLabel value={formData.remark} onChange={handleChange} required>Remark</FormLabel>
                    <FormControl
                      required
                      type="text"
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Add Quotation</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 style={{ marginLeft: '23px', marginTop: '15px', marginBottom: '25px', fontSize: '22px' }}>Quotation Record</h2>
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

export default dynamic(() => Promise.resolve(QuotationMaster), { ssr: false });