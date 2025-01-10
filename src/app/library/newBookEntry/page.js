"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormSelect, FormControl, Button, Breadcrumb } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';

const NewBookEntry = () => {
    const columns = [
        {
            name: "#",
            selector: (row) => row.id,
            sortable: true,
            width: "80px",
        },
        {
            name: "Entry Date",
            selector: (row) => row.entryDate,
            sortable: false,
        },
        {
            name: "Teacher Name",
            selector: (row) => row.teacherName,
            sortable: false,
        },
        {
            name: "Work Details",
            selector: (row) => row.workDetail,
            sortable: false,
        },
    ];

    const data = [
        {
            id: 1,
            entryDate: '',
            teacherName: "",
            workDetail: '',
        },

    ];
    const handleEdit = (id) => {
        const item = data.find((row) => row.id === id);
        const updatedName = prompt("Enter new name:", item.name);

        try {
            const parsedSections = JSON.parse(updatedSection);
            setData((prevData) =>
                prevData.map((row) =>
                    row.id === id
                        ? { ...row, name: updatedName }
                        : row
                )
            );
        } catch (error) {
            alert("Invalid JSON for sections. Please try again.");
        }
    };
    const handleDelete = (row) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            setData((prevData) => prevData.filter((item) => item.id !== row.id));
        }
    };




    return (
        <Container className="">
             <Row className='mt-1 mb-1'>
                          <Col>
                            <Breadcrumb>
                              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                              <Breadcrumb.Item href="/library/all-module">
                                Library
                              </Breadcrumb.Item>
                              <Breadcrumb.Item active>New Book Entry</Breadcrumb.Item>
                            </Breadcrumb>
                          </Col>
                        </Row>
            <Row>
                <Col>
                    <div className="cover-sheet">
                        <div className="studentHeading"><h2>New Book Entry</h2></div>
                        <Form className="formSheet">
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item Group </FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">Comic Book</option>
                                        <option value="2">Current Affairs</option>
                                        <option value="3">School Books</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item volume</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Accession No </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Accession Date</FormLabel>
                                    <FormControl required type="date" />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book Title </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Subject</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Sub Title </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Description</FormLabel>
                                    <FormControl as={"textarea"} rows={1} required />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Classification No </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Cost Price Description</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Discount </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Edition</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book Category </FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">Central Library</option>
                                        <option value="2">Information Technology</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Class No</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book No </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item Status</FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">In Stock</option>
                                        <option value="2">Under Repair</option>
                                    </FormSelect>
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Language</FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">English</option>
                                        <option value="2">Hindi</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Page Number </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 1  </FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 2</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 3</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Publisher Name </FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">Dhairya Publisher</option>
                                        <option value="2">Miles Kelly </option>
                                        <option value="1">Sunny Guha</option>
                                        <option value="2">Test Publishers ltd</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Rack </FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">Class 1-8</option>
                                        <option value="2">Class 9-12 </option>
                                        <option value="1">Comic Book</option>
                                        <option value="2">Story Book</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Shelf</FormLabel>
                                    <FormControl required type="text" disabled />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">PublicationYear</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">ISBN No</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Vendor Name  </FormLabel>
                                    <FormSelect>
                                        <option>Select</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Bill No</FormLabel>
                                    <FormControl required type="text" />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Bill Date</FormLabel>
                                    <FormControl required type="date" />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col className="text-center"><Button className="btn btn-primary mt-4">Update</Button></Col>
                            </Row>

                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export default dynamic(() => Promise.resolve(NewBookEntry), { ssr: false })