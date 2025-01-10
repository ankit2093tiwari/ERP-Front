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

  const data =[
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
        <Row className='mt-5 mb-3'>
          <Col>
              <Breadcrumb style={{ marginLeft: '20px' }}>
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
               <Button onClick={togglePopover} id="submit" type='button' style={{ marginLeft: '20px' }}>
                <CgAddR style={{ fontSize: '27px', marginTop: '-2px', marginRight: '5px' }} /> Add Item</Button>
               {isPopoverOpen && (
                <div className='absolute right-0 mt-3 w-60 p-4' style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '600px' }}>
                    <h3 style={{
                        marginBottom: '12px'
                    }}>Issue Items</h3>
                    <Form onSubmit={handleSubmit} className='mt-5'>
                <Row className="mb-3">
                <FormGroup as={Col} md="6" controlId="validationCustom01">
                  <FormLabel>Item Category</FormLabel>
                  <FormSelect value={formData.itemCategory} onChange={handleChange} required>
                      <option>Select Any Category</option>
                      <option value="1">Furniture</option>
                      <option value="2">Stationary</option>
                      <option value="3">Decoration</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="validationCustom02">
                  <FormLabel>Damage Qty</FormLabel>
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
                  <FormLabel>Item Name</FormLabel>
                  <FormControl
                    required
                    type="text"
                    value={formData.itemName}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup as={Col} md="6" controlId="validationCustom04">
                  <FormLabel>Remarks</FormLabel>
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
                  <FormLabel>Available Stock</FormLabel>
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
        <h2 style={{ marginLeft: '23px', marginTop: '23px' }}>Write Off Entry Records</h2>
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

export default dynamic (() => Promise.resolve(StockWriteOffEntry), {ssr: false});