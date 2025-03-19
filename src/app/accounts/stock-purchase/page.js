"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import styles from "@/app/students/add-new-student/page.module.css"
import { Container, Row, Col, Form, FormLabel, FormGroup, FormControl, FormSelect, Button, Breadcrumb } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const StockPurchase = () => {
  const [formData, setFormData] = useState({
    mailNo: '',
    forWhom: '',
    date: '',
    mode: '',
    fromF: '',
    courierName: '',
    address: '',
    receiver: '',
    remark: '',
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
      name: 'From',
      selector: row => row.from,
      sortable: true,
    },
    {
      name: 'For Whom',
      selector: row => row.forWhom,
      sortable: true,
    },
    {
      name: 'Mode',
      selector: row => row.mode,
      sortable: true,
    },
    {
      name: 'Receiver',
      selector: row => row.receiver,
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
      from: 'from1',
      forWhom: 'Anokhi',
      mode: 'General Post',
      receiver: 'Neha',
    },
    {
      id: 2,
      from: 'from2',
      forWhom: 'Anshika',
      mode: 'General Post',
      receiver: 'Nupul',
    },
    {
      id: 3,
      from: 'from3',
      forWhom: 'Anil',
      mode: 'Courier',
      receiver: 'Neelesh',
    },
    {
      id: 4,
      from: 'from4',
      forWhom: 'Anu',
      mode: 'General Post',
      receiver: 'Nitin',
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
  const breadcrumbItems = [{ label: "Accounts", link: "/accounts/all-module" }, { label: "Stock Purchase", link: "null" }]

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
    <Container>
      
      <section>
        <Row>
          <Col>
            <div className="tableSheet">
              <h2>Stock Purchase Records</h2>
              <Table columns={columns} data={data} />
            </div>
          </Col>
        </Row>
      </section>
    </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(StockPurchase), { ssr: false });