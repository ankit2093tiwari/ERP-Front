"use client";
import React, { useState } from 'react';
import Table from '@/app/component/DataTable';
import { Container, Row, Col, Breadcrumb} from 'react-bootstrap';
import styles from "@/app/students/add-new-student/page.module.css";
// import dynamic from 'next/dynamic';

const StockAvailable = () => {
  const columns = [
    {
      name: '#',
      selector: row => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Item Category',
      selector: row => row.itemCategory,
      sortable: true,
    },
    {
      name: 'Item Name',
      selector: row => row.itemName,
      sortable: true,
    },
    {
        name: 'Type',
        selector: row => row.type,
        sortable: true,
      },
    {
        name: 'Available Stock',
        selector: row => row.availableStock,
        sortable: true,
    }
  ];

  const data = [
    {
      id: 1,
      itemCategory: 'Furntiture',
      itemName: 'Chairs',
      type: 'Non-Recurring',
      availableStock: '105'
    },
    {
       id: 2,
       itemCategory: 'Stationary',
       itemName: 'Pen',
       type: 'Recurring',
       availableStock: '-1'
    },
  ];

  return (
    <Container>
            <Row className='mt-5 mb-3'>
                <Col>
                    <Breadcrumb style={{ marginLeft: '20px' }}>
                        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href="/transport">
                            Stock Module
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Stock Information</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row>
            
            <Row>
                <Col>
                    <h2 style={{ marginLeft: '23px' }}>Stock Information Records</h2>
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

export default StockAvailable;