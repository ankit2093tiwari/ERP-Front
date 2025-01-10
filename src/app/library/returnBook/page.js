"use client";
import React, { useState } from "react";
import Table from "@/app/component/DataTable";
// import styles from "../city-master/page.module.css";
import styles from "@/app/students/assign-roll-no/page.module.css"
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const ReturnBook = () => {
    const columns = [
        {
            name: "#",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
        },
        {
            name: "Student Name",
            selector: (row) => row.studentName,
            sortable: true,
        },
        {
            name: "Adm. no.",
            selector: (row) => row.adminNo,
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row) => row.gender,
            sortable: true,
        },
        {
            name: "RollNo",
            selector: (row) => row.rollNo,
            sortable: true,
        },
    ];

    const data = [
        {
            id: 1,
            studentName: 'Reyansh',
            adminNo: '1123894853895',
            gender: 'male',
            rollNo: '111'
        },
        {
            id: 2,
            studentName: 'Shreya',
            adminNo: '1123894853896',
            gender: 'female',
            rollNo: '112'
        },
    ];
    return (

        <Container className="">
             <Row className='mt-1 mb-1'>
                          <Col>
                            <Breadcrumb>
                              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                              <Breadcrumb.Item href="/library/all-module">
                                Library
                              </Breadcrumb.Item>
                              <Breadcrumb.Item active>Return Book</Breadcrumb.Item>
                            </Breadcrumb>
                          </Col>
                        </Row>
            <Row>
                <Col>
                    <div className="cover-sheet">
                        <div className="studentHeading"><h2>Search Book Details For Return</h2></div>
                        <Form className="formSheet">
                            <Row>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Barcode</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Book Name</FormLabel>
                                    <FormSelect>
                                        <option>Select Section</option>
                                        <option value="1">A</option>
                                        <option value="2">B</option>
                                        <option value="3">C</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Accession No </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                            </Row>
                            <Row>
                                <Col><Button className="btn btn-primary mt-4" id="submit">Search Students</Button></Col>
                            </Row>
                        </Form>

                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="tableSheet">
                        <h2>Roll No. Assigner</h2>
                        <Table columns={columns} data={data} />
                        <div className={styles.buttons}>
                            <button type="button" className="editButton">Previous</button>
                            <button type="button" className="editButton">Next</button>
                        </div>
                    </div>
                </Col>
            </Row>

        </Container>
    );
};

export default dynamic(() => Promise.resolve(ReturnBook), { ssr: false })
