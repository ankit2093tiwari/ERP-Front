"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { CgAddR } from 'react-icons/cg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VendorMaster = () => {
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
      name: 'OrganizationName',
      selector: row => row.organizationName,
      sortable: true,
    },
    {
      name: 'OrganizationType',
      selector: row => row.organizationType,
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true,
    },
    {
      name: 'ContactPersonDetails',
      selector: row => row.contactPersonName,
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
      organizationName: 'Factory Outlet',
      organizationType: 'Furniture',
      address: 'Chair',
      contactPersonName: '3',
    },
    {
      id: 2,
      organizationName: 'Factory Outlet',
      organizationType: 'Furniture',
      address: 'Chair',
      contactPersonName: '3',
    },
    {
      id: 3,
      organizationName: 'Factory Outlet',
      organizationType: 'Furniture',
      address: 'Chair',
      contactPersonName: '3',
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
            <Breadcrumb.Item active>Vendor Master</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <button onClick={togglePopover} id="submit" type='button' style={{ marginLeft: '20px' }}>
            <CgAddR style={{ fontSize: '27px', marginTop: '-2px', marginRight: '5px' }} /> Add New Vendor</button>
          {isPopoverOpen && (
            <div className='absolute right-0 mt-3 w-60 p-4' style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '940px' }}>
              <h3>Add New Vendor</h3>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom03">
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.organizationName}
                      name="organizationName"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom02">
                    <FormLabel>Organization Type</FormLabel>
                    <FormSelect
                      value={formData.organizationType}
                      name="organizationType"
                      onChange={handleChange}
                      required
                    >
                      <option>Select</option>
                      <option value="1">RECURRING</option>
                      <option value="2">NON RECURRING</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom01">
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.contactPersonName}
                      name="contactPersonName"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom04">
                    <FormLabel>Status Of Enterprise</FormLabel>
                    <FormSelect
                      value={formData.statusOfEnterprise}
                      name="statusOfEnterprise"
                      onChange={handleChange}
                      required
                    >
                      <option>Select</option>
                      <option value="1">RECURRING</option>
                      <option value="2">NON RECURRING</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6" controlId="validationCustom05">
                    <FormLabel>Organization Address</FormLabel>
                    <FormControl
                      required
                      type="textarea"
                      value={formData.organizationAddress}
                      name="organizationAddress"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom06">
                    <FormLabel>Item category</FormLabel>
                    <FormSelect
                      value={formData.itemCategory}
                      name="itemCategory"
                      onChange={handleChange}
                      required
                    >
                      <option>Select</option>
                      <option value="1">RECURRING</option>
                      <option value="2">NON RECURRING</option>
                    </FormSelect>
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom07">
                    <FormLabel>Organization Web Address</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.organizationWebAddress}
                      name="organizationWebAddress"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom08">
                    <FormLabel>TIN No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.tinNo}
                      name="tinNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom09">
                    <FormLabel>Contact No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.contactNo}
                      name="contactNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom10">
                    <FormLabel>PAN No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.panNo}
                      name="panNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom11">
                    <FormLabel>Email ID</FormLabel>
                    <FormControl
                      required
                      type="email"
                      value={formData.emailId}
                      name="emailId"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom12">
                    <FormLabel>G.S.T No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.gstNo}
                      name="gstNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom13">
                    <FormLabel>Remark</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.remark}
                      name="remark"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom14">
                    <FormLabel>Excise Registration No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.exciseRegistrationNo}
                      name="exciseRegistrationNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom15">
                    <FormLabel>Banker&apos;s Name With Address</FormLabel>
                    <FormControl
                      required
                      type="text"
                      value={formData.bankerName}
                      name="bankerName"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup as={Col} md="6" controlId="validationCustom16">
                    <FormLabel>Bank Account No</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.bankAccountNo}
                      name="bankAccountNo"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Row className='mb-3'>
                  <FormGroup as={Col} md="6" controlId="validationCustom19">
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl
                      required
                      type="number"
                      value={formData.ifscCode}
                      name="ifscCode"
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Row>
                <Button type="submit" id="submit">Add New Item</Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 style={{ marginLeft: '23px', marginTop: '15px', marginBottom: '25px', fontSize: '22px' }}>Stock Vendor Record</h2>
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

export default dynamic(() => Promise.resolve(VendorMaster), { ssr: false });
