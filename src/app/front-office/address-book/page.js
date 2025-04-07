"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Container, Row, Col, Form, FormLabel, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddressBook = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      email: 'muskan@gmail.com',
      remark: 'remark1',
      homePhone: '1234567890',
      faxNo: '9876543210'
    },
    {
      id: 2,
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      email: 'muskan@gmail.com',
      remark: 'remark1',
      homePhone: '1234567890',
      faxNo: '9876543210'
    },
    {
      id: 3,
      name: 'Sandeep',
      location: 'Kanpur',
      address: 'Kanpur',
      mobileNo: '7875885676',
      email: 'muskan@gmail.com',
      remark: 'remark1',
      homePhone: '1234567890',
      faxNo: '9876543210'
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    homePhone: '',
    address: '',
    mobileNo: '',
    location: '',
    email: '',
    remark: '',
    faxNo: '',
  });

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Name',
      selector: row => row.name || "N/A",
      sortable: true,
    },
    {
      name: 'Location',
      selector: row => row.location || "N/A",
      sortable: true,
    },
    {
      name: 'Address',
      selector: row => row.address || "N/A",
      sortable: true,
    },
    {
      name: 'Mobile No',
      selector: row => row.mobileNo || "N/A",
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email || "N/A",
      sortable: true,
    },
    {
      name: 'Remarks',
      selector: row => row.remark || "N/A",
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row.id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row.id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: data.length + 1,
      ...formData
    };
    setData([...data, newEntry]);
    setShowAddForm(false);
    setFormData({
      name: '',
      homePhone: '',
      address: '',
      mobileNo: '',
      location: '',
      email: '',
      remark: '',
      faxNo: '',
    });
  };

  const handleEdit = (id) => {
    const item = data.find(row => row.id === id);
    const updatedName = prompt("Enter new name:", item.name);
    if (updatedName) {
      setData(data.map(row => 
        row.id === id ? {...row, name: updatedName} : row
      ));
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setData(data.filter(row => row.id !== id));
    }
  };

  const breadcrumbItems = [
    { label: "Front Office", link: "/front-office/all-module" }, 
    { label: "Address Book", link: "null" }
  ];

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add New Contact
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Contact</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form onSubmit={handleSubmit} className="formSheet">
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Name</FormLabel>
                    <FormControl
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Home Phone</FormLabel>
                    <FormControl
                      type="text"
                      name="homePhone"
                      value={formData.homePhone}
                      onChange={handleChange}
                      placeholder="Enter Home Phone"
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Address</FormLabel>
                    <FormControl
                      as="textarea"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Mobile No</FormLabel>
                    <FormControl
                      type="text"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number"
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Location</FormLabel>
                    <FormSelect
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Jhanshi">Jhanshi</option>
                      <option value="Oyal">Oyal</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Email</FormLabel>
                    <FormControl
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      type="text"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Enter Remark"
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Office Phone</FormLabel>
                    <FormControl
                      type="text"
                      name="officePhone"
                      value={formData.officePhone}
                      onChange={handleChange}
                      placeholder="Enter Office Phone"
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Fax No</FormLabel>
                    <FormControl
                      type="text"
                      name="faxNo"
                      value={formData.faxNo}
                      onChange={handleChange}
                      placeholder="Enter Fax Number"
                    />
                  </Col>
                </Row>
                <Button type="submit" className="btn btn-primary mt-3">
                  Submit
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Address Book Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddressBook), { ssr: false });