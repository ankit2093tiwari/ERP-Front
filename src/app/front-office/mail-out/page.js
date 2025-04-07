"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Container, Row, Col, Form, FormLabel, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const MailOut = () => {
  const [data, setData] = useState([
    {
      id: 1,
      mailNo: '001',
      forWhom: 'Anokhi',
      date: '2023-05-15',
      mode: 'General Post',
      fromF: 'Company A',
      courierName: '',
      address: '123 Main St',
      sender: 'Neha',
      remark: 'Urgent'
    },
    {
      id: 2,
      mailNo: '002',
      forWhom: 'Anshika',
      date: '2023-05-16',
      mode: 'General Post',
      fromF: 'Company B',
      courierName: '',
      address: '456 Oak Ave',
      sender: 'Nupul',
      remark: 'Confidential'
    },
    {
      id: 3,
      mailNo: '003',
      forWhom: 'Anil',
      date: '2023-05-17',
      mode: 'Courier',
      fromF: 'Company C',
      courierName: 'Fast Delivery',
      address: '789 Pine Rd',
      sender: 'Neelesh',
      remark: 'Fragile'
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    mailNo: '',
    forWhom: '',
    date: '',
    mode: '',
    fromF: '',
    courierName: '',
    address: '',
    sender: '',
    remark: '',
  });

  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Mail No',
      selector: row => row.mailNo || "N/A",
      sortable: true,
    },
    {
      name: 'From',
      selector: row => row.fromF || "N/A",
      sortable: true,
    },
    {
      name: 'For Whom',
      selector: row => row.forWhom || "N/A",
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date || "N/A",
      sortable: true,
    },
    {
      name: 'Mode',
      selector: row => row.mode || "N/A",
      sortable: true,
    },
    {
      name: 'Sender',
      selector: row => row.sender || "N/A",
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
      mailNo: '',
      forWhom: '',
      date: '',
      mode: '',
      fromF: '',
      courierName: '',
      address: '',
      sender: '',
      remark: '',
    });
  };

  const handleEdit = (id) => {
    const item = data.find(row => row.id === id);
    const updatedForWhom = prompt("Enter recipient:", item.forWhom);
    if (updatedForWhom) {
      setData(data.map(row => 
        row.id === id ? {...row, forWhom: updatedForWhom} : row
      ));
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this mail record?")) {
      setData(data.filter(row => row.id !== id));
    }
  };

  const breadcrumbItems = [
    { label: "Front Office", link: "/front-office/all-module" }, 
    { label: "Mail Out", link: "null" }
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
            <CgAddR /> New Mail
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>New Mail</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form onSubmit={handleSubmit} className="formSheet">
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Mail No</FormLabel>
                    <FormControl
                      type="text"
                      name="mailNo"
                      value={formData.mailNo}
                      onChange={handleChange}
                      placeholder="Enter Mail Number"
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">For Whom</FormLabel>
                    <FormSelect
                      name="forWhom"
                      value={formData.forWhom}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Recipient</option>
                      <option value="Anshika">Anshika</option>
                      <option value="Ashu">Ashu</option>
                      <option value="Akansha">Akansha</option>
                      <option value="Nikhil">Nikhil</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Mode</FormLabel>
                    <FormSelect
                      name="mode"
                      value={formData.mode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Mode</option>
                      <option value="General Post">General Post</option>
                      <option value="Speed Post">Speed Post</option>
                      <option value="Courier">Courier</option>
                    </FormSelect>
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">To</FormLabel>
                    <FormControl
                      type="text"
                      name="fromF"
                      value={formData.fromF}
                      onChange={handleChange}
                      placeholder="Enter Recipient"
                      required
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Courier Name</FormLabel>
                    <FormControl
                      type="text"
                      name="courierName"
                      value={formData.courierName}
                      onChange={handleChange}
                      placeholder="Enter Courier Name"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
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
                  <Col lg={6}>
                    <FormLabel className="labelForm">Sender</FormLabel>
                    <FormSelect
                      name="sender"
                      value={formData.sender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Sender</option>
                      <option value="Manvi">Manvi</option>
                      <option value="Sanvi">Sanvi</option>
                      <option value="Suresh">Suresh</option>
                      <option value="Shashi">Shashi</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl
                      as="textarea"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Enter Remark"
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
            <h2>Mail Out Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(MailOut), { ssr: false });