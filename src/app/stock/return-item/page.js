"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";


const ItemReturn = () => {

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
      name: 'IssuedTo',
      selector: (row) => (
        <div>
          {row.issues.map((issue, index) => (
            <div key={index}>
              {issue.employee}<br />
              {issue.designation}<br />
            </div>
          ))}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: 'Remarks',
      selector: row => row.remarks,
      sortable: true,
    },
    {
      name: 'Date&Time',
      selector: row => row.dateAndTime,
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
            Return
          </button>
        </div>
      ),
    }
  ];

  const data = [
    {
      id: 1,
      itemCategory: '',
      itemName: '',
      issues: [{
        employee: "employee: Staff",
        designation: 'Designation: Teaching'
      }],
      quantity: '10',
      remarks: '',
      dateAndTime: '23-01-2022'
    },
    {
      id: 2,
      itemCategory: '',
      itemName: '',
      issues: [{
        employee: "employee: Mantasha Khan",
        designation: 'Designation: Teaching'
      }],
      quantity: '5',
      remarks: '',
      dateAndTime: '23-01-2022'
    },
    {
      id: 3,
      itemCategory: '',
      itemName: '',
      issues: [{
        designation: 'Department: Teaching'
      }],
      quantity: '4',
      remarks: 'account remark',
      dateAndTime: '23-01-2022'
    },
    {
      id: 4,
      itemCategory: '',
      itemName: '',
      issues: [{
        employee: "other: other name",
        designation: ''
      }],
      quantity: '1',
      remarks: '',
      dateAndTime: '23-01-2022'
    },
    {
      id: 5,
      itemCategory: '',
      itemName: '',
      issues: [{
        employee: "student : ADVIK PATHAK",
        designation: 'Father: Ajay Pathak',
      }],
      quantity: '5',
      remarks: 'abc',
      dateAndTime: '23-01-2022'
    },

  ];

  const [formData, setFormData] = useState({
    itemCategory: '',
    issueTo: '',
    itemName: '',
    remarks: '',
    availableStock: '',
    issuedQuantity: '',
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };
  const breadcrumbItems = [{ label: "Stock", link: "/stock/all-module" }, { label: "Return Item", link: "null" }]
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
      {/* <Row>
        <Col>
         <Button onClick={onOpen} className="btn btn-primary">
            <CgAddR /> Issue Items</Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Issue Item</h2> <button className='closeForm' onClick={onClose}> X </button> </div>
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
                    <FormLabel className="labelForm">Issue To</FormLabel>
                    <FormSelect value={formData.issueTo} onChange={handleChange} required>
                      <option>Select</option>
                      <option value="1">Teachers</option>
                      <option value="2">Students</option>
                      <option value="3">Other Staffs</option>
                    </FormSelect>
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
                  <FormGroup as={Col} md="6" controlId="validationCustom05">
                    <FormLabel className="labelForm">Available Stock</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.availableStock}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom06">
                    <FormLabel className="labelForm">Issued Quantity</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.issuedQuantity}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit" onSubmit={handleSubmit}>Issue Item</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row> */}
      <section>
        <Container>
          <Row>
            <Col>
              <div className="tableSheet">
                <h2>Issued Items Records</h2>
                <Table columns={columns} data={data} />
               
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ItemReturn), { ssr: false });