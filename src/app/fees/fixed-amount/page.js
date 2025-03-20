"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, FormLabel, FormSelect, Button, Form, Table } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const FixedAmount = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [installmentList, setInstallmentList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedInstallment, setSelectedInstallment] = useState("");
    const [heads, setHeads] = useState([]);
    const [transDate, setTransDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classRes, installmentRes] = await Promise.all([
                axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes"),
                axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments"),
            ]);

            setClassList(classRes.data.data || []);
            setInstallmentList(installmentRes.data.data || []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/sections/class/${classId}`);
            setSectionList(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch sections:", error);
        }
    };

    const fetchHeadsByInstallment = async (installmentName) => {
        try {
            const response = await axios.get(`https://erp-backend-fy3n.onrender.com/api/installments/heads/${installmentName}`);
            setHeads(response.data.data.map(head => ({ ...head, fixedAmount: "", remarks: "" })) || []);
        } catch (error) {
            console.error("Failed to fetch heads:", error);
        }
    };

    const handleClassChange = (event) => {
        const classId = event.target.value;
        setSelectedClass(classId);
        setSelectedSection("");
        fetchSections(classId);
    };

    const handleInstallmentChange = (event) => {
        const installmentName = event.target.value;
        setSelectedInstallment(installmentName);
        fetchHeadsByInstallment(installmentName);
    };

    const handleInputChange = (index, field, value) => {
        setHeads((prevHeads) =>
            prevHeads.map((head, i) => (i === index ? { ...head, [field]: value } : head))
        );
    };

    const handleSubmit = async () => {
        console.log('heads', heads);

        if (!selectedClass || !selectedSection || !selectedInstallment || !transDate || heads.length === 0) {
            alert("Please fill all fields.");
            return;
        }

        const payload = {
            class: selectedClass,
            section: selectedSection,
            installment: selectedInstallment, // Ensure this is the _id of the installment
            transactionDate: transDate,
            particulars: heads.map(({ _id, fixedAmount, remarks }) => ({
                head: _id, // Ensure this is the _id of the head
                fixedAmount: Number(fixedAmount) || 0,
                remarks: remarks || "",
            })),
        };

        setLoading(true);
        try {
            await axios.post("https://erp-backend-fy3n.onrender.com/api/create-fixed-amounts", payload);
            alert("Fixed Amount updated successfully!");
        } catch (error) {
            console.error("Failed to update Fixed Amount:", error);
            alert("Error updating Fixed Amount.");
        }
        setLoading(false);
    };

    const breadcrumbItems = [{ label: "Fee", link: "/fees/all-module" }, { label: "fixed-amount", link: "null" }]

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
                    {/* <Row className="mt-1 mb-1">
                        <Col>
                            <h2>Fixed Amount</h2>
                        </Col>
                    </Row> */}

                    <Form>
                        <Row>
                            <Col>
                                <FormLabel>Select Class</FormLabel>
                                <FormSelect value={selectedClass} onChange={handleClassChange}>
                                    <option value="">Select Class</option>
                                    {classList.map((cls) => (
                                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                    ))}
                                </FormSelect>
                            </Col>
                            <Col>
                                <FormLabel>Select Section</FormLabel>
                                <FormSelect value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                    <option value="">Select Section</option>
                                    {sectionList.map((sec) => (
                                        <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                    ))}
                                </FormSelect>
                            </Col>
                            <Col>
                                <FormLabel>Select Installment</FormLabel>
                                <FormSelect value={selectedInstallment} onChange={handleInstallmentChange}>
                                    <option value="">Select Installment</option>
                                    {installmentList.map((inst) => (
                                        <option key={inst._id} value={inst.installment_name}>{inst.installment_name}</option>
                                    ))}
                                </FormSelect>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormLabel>Transaction Date</FormLabel>
                                <Form.Control type="date" value={transDate} onChange={(e) => setTransDate(e.target.value)} />
                            </Col>
                        </Row>

                        <h5 className="mt-3">Head Wise Details</h5>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Particular</th>
                                    <th>Fixed Amount</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {heads.map((head, index) => (
                                    <tr key={head._id || index}>
                                        <td>{index + 1}</td>
                                        <td>{head.head_name}</td>
                                        <td>
                                            <Form.Control
                                                type="number"
                                                value={head.fixedAmount}
                                                onChange={(e) => handleInputChange(index, "fixedAmount", e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <Form.Control
                                                type="text"
                                                value={head.remarks}
                                                onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <Button className="mt-3 btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </Form>
                </Container>
            </section>
        </>
    );
};

export default FixedAmount;