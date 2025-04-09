"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, FormLabel, FormSelect, Button, Form, Table } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { FaSave } from "react-icons/fa";
import styles from "@/app/medical/routine-check-up/page.module.css";

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
    const [viewType, setViewType] = useState("installmentWise"); // Default to Installment Wise

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
            // setHeads(response.data.data.map(head => ({ ...head, fixedAmount: "", remarks: "" })) || []);
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
        if (!selectedClass || !selectedSection || !selectedInstallment || !transDate || heads.length === 0) {
            alert("Please fill all fields.");
            return;
        }

        const payload = {
            class: selectedClass,
            section: selectedSection,
            transaction_date: transDate,
            installment: selectedInstallment,
            headAmounts: heads.map(({ head_id, _id, head_name, fixedAmount, remarks }) => ({
                head_id: head_id || _id, // Send both possible identifiers
                head_name: head_name,    // Send name as fallback
                amount: Number(fixedAmount) || 0,
                remarks: remarks || ""
            })),
        };

        setLoading(true);
        try {
            const response = await axios.post(
                "https://erp-backend-fy3n.onrender.com/api/create-fixed-amounts",
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                alert("Fixed Amount updated successfully!");
                // Optional: Reset form after successful submission
                setSelectedClass("");
                setSelectedSection("");
                setSelectedInstallment("");
                setHeads([]);
            } else {
                alert(`Operation failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Failed to update Fixed Amount:", error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                "Unknown error occurred";
            alert(`Error updating Fixed Amount: ${errorMessage}`);

            // Debugging help
            console.log("Payload sent:", payload);
            if (error.response) {
                console.log("Error response:", error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };


    const breadcrumbItems = [{ label: "Fee", link: "/fees/all-module" }, { label: "fixed-amount", link: "null" }];

    const renderForm = () => {
        switch (viewType) {
            case "installmentWise":
                return (
                    <>
                        <Form className="formSheet">
                            <Row>
                                <Col lg={3}>
                                    <FormLabel className={styles.labelForm}>Class</FormLabel>
                                    <FormSelect
                                        value={selectedClass}
                                        onChange={handleClassChange}
                                        className={styles.formControl}
                                    >
                                        <option value="">Select Class</option>
                                        {classList.map((cls) => (
                                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                        ))}
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className={styles.labelForm}>Section</FormLabel>
                                    <FormSelect
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        className={styles.formControl}
                                    >
                                        <option value="">Select Section</option>
                                        {sectionList.map((sec) => (
                                            <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                        ))}
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className={styles.labelForm}>Installment</FormLabel>
                                    <FormSelect
                                        value={selectedInstallment}
                                        onChange={handleInstallmentChange}
                                        className={styles.formControl}
                                    >
                                        <option value="">Select Installment</option>
                                        {installmentList.map((inst) => (
                                            <option key={inst._id} value={inst.installment_name}>{inst.installment_name}</option>
                                        ))}
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className={styles.labelForm}>Trans Date</FormLabel>
                                    <Form.Control
                                        type="date"
                                        value={transDate}
                                        onChange={(e) => setTransDate(e.target.value)}
                                        className={styles.formControl}
                                    />
                                </Col>
                            </Row>
                        </Form>
                        <div className="tableSheet">
                            <h5>Head Wise Details</h5>
                            <Table bordered className="mt-3">
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Particulars</th>
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
                                                    className={styles.formControl}
                                                />
                                            </td>
                                            <td>
                                                <Form.Control
                                                    type="text"
                                                    value={head.remarks}
                                                    onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
                                                    className={styles.formControl}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </>
                );
            case "classWise":
                return (
                    <div className="text-center py-5">
                        <h4>Class Wise</h4>
                    </div>
                );
            case "studentWise":
                return (
                    <div className="text-center py-5">
                        <h4>Student Wise</h4>
                    </div>
                );
            default:
                return null;
        }
    };

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
                    <div className="cover-sheet">
                        <div className="studentHeading">
                            <h2>Fixed Amount</h2>
                        </div>
                        <div className="mb-4 ms-4 me-4">
                            <div className="d-flex gap-3 mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="feeType"
                                        id="installmentWise"
                                        checked={viewType === "installmentWise"}
                                        onChange={() => setViewType("installmentWise")}
                                    />
                                    <label className="form-check-label" htmlFor="installmentWise">
                                        Installment Wise
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="feeType"
                                        id="classWise"
                                        checked={viewType === "classWise"}
                                        onChange={() => setViewType("classWise")}
                                    />
                                    <label className="form-check-label" htmlFor="classWise">
                                        Class Wise
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="feeType"
                                        id="studentWise"
                                        checked={viewType === "studentWise"}
                                        onChange={() => setViewType("studentWise")}
                                    />
                                    <label className="form-check-label" htmlFor="studentWise">
                                        Student Wise
                                    </label>
                                </div>
                            </div>

                            {renderForm()}

                            {viewType === "installmentWise" && (
                                <div className="d-flex justify-content-end mt-4">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{ minWidth: '120px' }}
                                        className={styles.btnPrimary}
                                    >
                                        <FaSave /> {loading ? "Updating..." : "Update"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default FixedAmount;