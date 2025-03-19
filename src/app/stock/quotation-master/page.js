"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

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
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsPopoverOpen(false);
  };
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Quotation  Master", link: "null" }]
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
              <Button onClick={onOpen} className="btn-add">
                <CgAddR /> Add Quotation</Button>
              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>Add Quotation</h2> <button className='closeForm' onClick={onClose}> X </button></div>
                  <Form className="formSheet" onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6" controlId="validationCustom06">
                        <FormLabel className="labelForm" value={formData.itemCategory} onChange={handleChange} required>Item category</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">RECUURING</option>
                          <option value="2">NON RECUURING</option>
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom05">
                        <FormLabel className="labelForm" value={formData.itemName} onChange={handleChange} required>Item Name</FormLabel>
                        <FormControl
                          required
                          type="textarea"
                        />
                      </FormGroup>
                    </Row>
                    <Row className="mb-3">
                      <FormGroup as={Col} md="6" controlId="validationCustom01">
                        <FormLabel className="labelForm" value={formData.pricePerUnit} onChange={handleChange} required>Price Per Unit</FormLabel>
                        <FormControl
                          required
                          type="number"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom02">
                        <FormLabel className="labelForm" value={formData.vendorName} onChange={handleChange} required>Vendor Name</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">RECUURING</option>
                          <option value="2">NON RECUURING</option>
                        </FormSelect>
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="6" controlId="validationCustom07">
                        <FormLabel className="labelForm" value={formData.quotationNo} onChange={handleChange} required>Quotation No</FormLabel>
                        <FormControl
                          required
                          type="number"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="6" controlId="validationCustom08">
                        <FormLabel className="labelForm" value={formData.remark} onChange={handleChange} required>Remark</FormLabel>
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
              <div className="tableSheet">
                <h2>Quotation Record</h2>
                <Table columns={columns} data={data} />
                
              </div>
            </Col>
          </Row>
        </Container >
      </section>
      </>
      );
};

export default dynamic(() => Promise.resolve(QuotationMaster), {ssr: false });