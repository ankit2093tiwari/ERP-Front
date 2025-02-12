"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';

const StockWriteOffEntry = () => {

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'ItemCategory',
      selector: row => row.itemCategory,
      sortable: true,
    },
    {
      name: 'ItemName',
      selector: row => row.itemName,
      sortable: true,
    },
    {
      name: 'TotalStockQuantity',
      selector: row => row.totalStockQuantty,
      sortable: true,
    },
    {
      name: 'DamageQuantity',
      selector: row => row.damageQuantity,
      sortable: true,
    },
    {
      name: 'Remarks',
      selector: row => row.remarks,
      sortable: true,
    },
  ];

  const data = [
    {
      id: 1,
      itemCategory: '',
      itemName: '',
      totalStockQuantty: '24',
      damageQuantity: '10',
      remarks: ''
    },
    {
      id: 2,
      itemCategory: '',
      itemName: '',
      totalStockQuantty: '25',
      damageQuantity: '1',
      remarks: ''
    },
    {
      id: 3,
      itemCategory: 'Furniture',
      itemName: 'Chairs',
      totalStockQuantty: '20',
      damageQuantity: '2',
      remarks: 'out of 20'
    },
    {
      id: 4,
      itemCategory: 'Stationary',
      itemName: 'Pen',
      totalStockQuantty: '70',
      damageQuantity: '5',
      remarks: 'Damage'
    },
  ];

  const [formData, setFormData] = useState({
    itemCategory: '',
    damageQuantity: '',
    itemName: '',
    remarks: '',
    availableStock: '',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);;

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
            <Breadcrumb.Item href="/transport">
              Stock Module
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Write Off Entry</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={onOpen} className="btn btn-primary">
            <CgAddR /> Add Item  </Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading"><h2>Issue Items </h2>   <button className='closeForm' onClick={onClose}> X </button>  </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom01">
                    <FormLabel className="labelForm">Item Category</FormLabel>
                    <FormSelect value={formData.itemCategory} onChange={handleChange} required>
                      <option>Select Any Category</option>
                      <option value="1">Furniture</option>
                      <option value="2">Stationary</option>
                      <option value="3">Decoration</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom02">
                    <FormLabel className="labelForm">Damage Qty</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.damageQuantity}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom03">
                    <FormLabel className="labelForm">Item Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.itemName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom04">
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="12" controlId="validationCustom05">
                    <FormLabel className="labelForm">Available Stock</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.availableStock}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Issue Item</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Write Off Entry Records</h2>
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

export default dynamic(() => Promise.resolve(StockWriteOffEntry), { ssr: false });