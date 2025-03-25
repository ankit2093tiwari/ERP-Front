"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import "react-datepicker/dist/react-datepicker.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddressBook = () => {
  const [formData, setFormData] = useState({
    name: '',
    homePhone: '',
    address: '',
    mobileNo: '',
    location: '',
    emailL: '',
    remark: '',
    faxNo: '',
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
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Location',
      selector: row => row.location,
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address,
      sortable: true,
    },
    {
      name: 'Mobile No',
      selector: row => row.mobileNo,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.emailL,
      sortable: true,
    },
    {
      name: 'Remarks',
      selector: row => row.remark,
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
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      emailL: 'muskan@gmail.com',
      remark: 'remark1',
    },
    {
      id: 2,
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      emailL: 'muskan@gmail.com',
      remark: 'remark1',
    },
    {
      id: 3,
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      emailL: 'muskan@gmail.com',
      remark: 'remark1',
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

  const breadcrumbItems = [{ label: "Front Office", link: "/front-office/all-module" }, { label: "Address Book", link: "null" }]

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
              <button onClick={onOpen} type='button' className='btn-add'>
                <CgAddR />Add New</button>
              {isPopoverOpen && (
                <div className="cover-sheet">
                  <div className="studentHeading"><h2>Add New Contact</h2>  <button className='closeForm' onClick={onClose}> X </button></div>
                  <Form onSubmit={handleSubmit} className="formSheet">
                    <Row className="mb-3">
                      <FormGroup as={Col} md="4" controlId="validationCustom02">
                        <FormLabel value={formData.name} onChange={handleChange} required>Name</FormLabel>
                        <FormControl
                          required
                          type="name"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom01">
                        <FormLabel value={formData.homePhone} onChange={handleChange} required>Home Phone</FormLabel>
                        <FormControl
                          required
                          type="number"
                        />
                      </FormGroup>

                      <FormGroup as={Col} md="4" controlId="validationCustom08">
                        <FormLabel value={formData.address} onChange={handleChange} required>Present Address</FormLabel>
                        <FormControl
                          required
                          type="textarea"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="4" controlId="validationCustom07">
                        <FormLabel value={formData.mobileNo} onChange={handleChange} required>Mobile No</FormLabel>
                        <FormControl
                          required
                          type="number"
                        />
                      </FormGroup>

                      <FormGroup as={Col} md="4" controlId="validationCustom03">
                        <FormLabel value={formData.location} onChange={handleChange} required>Location</FormLabel>
                        <FormSelect>
                          <option>Select</option>
                          <option value="1">Kanpur</option>
                          <option value="2">Lucknow</option>
                          <option value="3">Jhanshi</option>
                          <option value="3">Oyal</option>
                        </FormSelect>
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom04">
                        <FormLabel value={formData.emailL} onChange={handleChange} required>E-Mail</FormLabel>
                        <FormControl
                          required
                          type="email"
                        />
                      </FormGroup>
                    </Row>
                    <Row className='mb-3'>
                      <FormGroup as={Col} md="4" controlId="validationCustom05">
                        <FormLabel value={formData.remark} onChange={handleChange} required>Remark</FormLabel>
                        <FormControl
                          required
                          type="text"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom06">
                        <FormLabel value={formData.sender} onChange={handleChange} required>Office Phone</FormLabel>
                        <FormControl
                          required
                          type="number"
                        />
                      </FormGroup>
                      <FormGroup as={Col} md="4" controlId="validationCustom06">
                        <FormLabel value={formData.faxNo} onChange={handleChange} required>Fax No</FormLabel>
                        <FormControl
                          required
                          type="number"
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
                <h2>Address Book Records</h2>
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

export default dynamic(() => Promise.resolve(AddressBook), { ssr: false });