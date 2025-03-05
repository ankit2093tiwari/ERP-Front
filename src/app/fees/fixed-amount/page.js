"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, FormLabel, FormSelect, Button, Form } from "react-bootstrap";
import styles from "@/app/students/assign-roll-no/page.module.css";

const FixedAmount = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [installmentList, setInstallmentList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedInstallment, setSelectedInstallment] = useState("");
    const [particulars, setParticulars] = useState("");
    const [transDate, setTransDate] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
        fetchInstallments();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
            setClassList(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch classes", error);
            alert("Failed to fetch classes. Please try again.");
        }
    };

    const fetchSections = async (classId) => {
        try {
            const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
            setSectionList(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error("Failed to fetch sections", error);
            alert("Failed to fetch sections. Please try again.");
        }
    };

    const fetchInstallments = async () => {
        try {
            const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments");
            setInstallmentList(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch installments", error);
            alert("Failed to fetch installments. Please try again.");
        }
    };

    const fetchDetails = async () => {
        if (!selectedClass || !selectedSection || !selectedInstallment) {
            alert("Please select class, section, and installment");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `https://erp-backend-fy3n.onrender.com/student-details?class_name=${selectedClass}&section_name=${selectedSection}&installment_id=${selectedInstallment}`
            );
            const details = response.data.data || {};
            setParticulars(details.particulars);
            setTransDate(details.transactionDate);
        } catch (error) {
            console.error("Failed to fetch details", error);
            alert("Failed to fetch details. Please try again.");
        }
        setLoading(false);
    };

    const handleClassChange = (event) => {
        const classId = event.target.value;
        setSelectedClass(classId);
        setSelectedSection("");
        fetchSections(classId);
    };

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const handleInstallmentChange = (event) => {
        setSelectedInstallment(event.target.value);
    };

    const handleParticularsChange = (event) => {
        setParticulars(event.target.value);
    };

    const handleDateChange = (event) => {
        setTransDate(event.target.value);
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedSection || !selectedInstallment || !particulars || !transDate) {
            alert("Please fill all fields");
            return;
        }

        const payload = {
            class: selectedClass,
            section: selectedSection,
            installment: selectedInstallment,
            particulars,
            transactionDate: transDate,
        };

        setLoading(true);
        try {
            const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/fixed-amount", payload);
            alert("Fixed Amount created successfully!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Failed to create Fixed Amount", error);
            alert("Failed to create Fixed Amount. Please try again.");
        }
        setLoading(false);
    };

    return (
        <Container>
            <Row className="mt-1 mb-1">
                <Col>
                    <h2>Fixed Amount</h2>
                </Col>
            </Row>

            <div className="cover-sheet">
                <Form className="formSheet">
                    <Row>
                        <Col>
                            <FormLabel className="labelForm">Select Class</FormLabel>
                            <FormSelect value={selectedClass} onChange={handleClassChange}>
                                <option value="">Select Class</option>
                                {classList.map((cls) => (
                                    <option key={cls._id} value={cls._id}>
                                        {cls.class_name}
                                    </option>
                                ))}
                            </FormSelect>
                        </Col>
                        <Col>
                            <FormLabel className="labelForm">Select Section</FormLabel>
                            <FormSelect value={selectedSection} onChange={handleSectionChange}>
                                <option value="">Select Section</option>
                                {sectionList.map((sec) => (
                                    <option key={sec._id} value={sec._id}>
                                        {sec.section_name}
                                    </option>
                                ))}
                            </FormSelect>
                        </Col>
                        <Col>
                            <FormLabel className="labelForm">Select Installment</FormLabel>
                            <FormSelect value={selectedInstallment} onChange={handleInstallmentChange}>
                                <option value="">Select Installment</option>
                                {installmentList.map((inst) => (
                                    <option key={inst._id} value={inst._id}>
                                        {inst.installment_name}
                                    </option>
                                ))}
                            </FormSelect>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormLabel className="labelForm">Particulars</FormLabel>
                            <Form.Control
                                type="text"
                                value={particulars}
                                onChange={handleParticularsChange}
                                placeholder="Enter particulars"
                            />
                        </Col>
                        <Col>
                            <FormLabel className="labelForm">Transaction Date</FormLabel>
                            <Form.Control
                                type="date"
                                value={transDate}
                                onChange={handleDateChange}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col>
                            <Button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>

            <Row>
                <Col>
                    <div className="tableSheet">
                        <h2>Details</h2>
                        {particulars && transDate ? (
                            <>
                                <div className="details-summary">
                                    <p>Class: {selectedClass}</p>
                                    <p>Section: {selectedSection}</p>
                                    <p>Installment: {selectedInstallment}</p>
                                    <p>Particulars: {particulars}</p>
                                    <p>Transaction Date: {transDate}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-center">No details found.</p>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default FixedAmount;