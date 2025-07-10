"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, FormLabel, FormSelect, Button, Form, Table } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { FaSave } from "react-icons/fa";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { addNewFixedAmount, getAllInstallments, getClasses, getHeadsByInstallmentName, getSections, getStudentsByClassAndSection } from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const FixedAmount = () => {
    const { hasEditAccess } = usePagePermission()
    const selectedSessionId = useSessionId()
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [installmentList, setInstallmentList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedInstallment, setSelectedInstallment] = useState("");
    const [heads, setHeads] = useState([]);
    const [transDate, setTransDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!selectedSessionId) return;

        // Reset all dependent fields
        setSelectedClass("");
        setSelectedSection("");
        setSelectedStudent("");
        setSelectedInstallment("");
        setSectionList([]);
        setStudents([]);
        setHeads([]);
        setErrors({});

        fetchData();
    }, [selectedSessionId]);


    useEffect(() => {
        if (!selectedClass || !selectedSection) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            try {
                const response = await getStudentsByClassAndSection(selectedClass, selectedSection);
                setStudents(response.data || []);
            } catch (error) {
                console.error("Failed to fetch students:", error);
            }
        };

        fetchStudents();
    }, [selectedClass, selectedSection]);


    const fetchData = async () => {
        try {
            const [classRes, installmentRes] = await Promise.all([
                getClasses(),
                getAllInstallments()
            ]);
            setClassList(classRes.data || []);
            setInstallmentList(installmentRes.data || []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const response = await getSections(classId);
            setSectionList(response.data || []);
        } catch (error) {
            console.error("Failed to fetch sections:", error);
        }
    };

    const fetchHeadsByInstallment = async (installmentName) => {
        try {
            const response = await getHeadsByInstallmentName(installmentName);
            setHeads(response.data.map(head => ({ ...head, fixedAmount: "", remarks: "" })) || []);
        } catch (error) {
            console.error("Failed to fetch heads:", error);
        }
    };

    const handleClassChange = (e) => {
        const val = e.target.value;
        setSelectedClass(val);
        setErrors(prev => ({ ...prev, selectedClass: "" }));
        setSelectedSection("");
        setSectionList([]);

        if (val) {
            fetchSections(val);
        }
    };


    const handleInputChange = (index, field, value) => {
        setHeads((prevHeads) =>
            prevHeads.map((head, i) => i === index ? { ...head, [field]: value } : head)
        );
        if (field === "fixedAmount") {
            const newErrors = { ...errors };
            if (value && !isNaN(value) && Number(value) > 0) delete newErrors[`fixedAmount_${index}`];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!selectedClass) newErrors.selectedClass = "Class is required";
        if (!selectedSection) newErrors.selectedSection = "Section is required";
        if (!selectedStudent) newErrors.selectedStudent = "Student is required";
        if (!selectedInstallment) newErrors.selectedInstallment = "Installment is required";

        heads.forEach((head, index) => {
            if (!head.fixedAmount || isNaN(head.fixedAmount) || Number(head.fixedAmount) <= 0) {
                newErrors[`fixedAmount_${index}`] = "Enter a valid amount";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.warn("Please correct the highlighted errors.");
            return;
        }

        const payload = {
            student: selectedStudent,
            class: selectedClass,
            section: selectedSection,
            transaction_date: transDate,
            installment: selectedInstallment,
            headAmounts: heads.map(({ head_id, _id, head_name, fixedAmount, remarks }) => ({
                head_id: head_id || _id,
                head_name,
                amount: Number(fixedAmount) || 0,
                remarks: remarks || ""
            })),
        };

        setLoading(true);
        try {
            const response = await addNewFixedAmount(payload);
            if (response.success) {
                toast.success(response.message || "Fixed Amount updated successfully!");
                setSelectedClass("");
                setSelectedSection("");
                setSelectedInstallment("");
                setHeads([]);
                setSelectedStudent("");
                setErrors({});
            } else {
                toast.error(`Operation failed: ${response.message}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error occurred while submitting");
            console.log("Payload sent:", payload);
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = [
        { label: "Fee", link: "/fees/all-module" },
        { label: "fixed-amount", link: "null" },
    ];

    return (
        <>
            <div className="breadcrumbSheet position-relative">
                <Container>
                    <Row className="mt-1 mb-1">
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>

            <section>
                <Container>
                    <div className="cover-sheet">
                        <div className="studentHeading"><h2>Fixed Amount</h2></div>
                        <div className="mb-4 ms-4 me-4">
                            <Form className="formSheet">
                                <Row>
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Class<span className="text-danger">*</span></FormLabel>
                                        <FormSelect value={selectedClass} onChange={handleClassChange} className={styles.formControl} isInvalid={!!errors.selectedClass}>
                                            <option value="">Select Class</option>
                                            {classList.map(cls => (
                                                <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                            ))}
                                        </FormSelect>
                                        <Form.Control.Feedback type="invalid">{errors.selectedClass}</Form.Control.Feedback>
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Section<span className="text-danger">*</span></FormLabel>
                                        <FormSelect value={selectedSection} onChange={(e) => {
                                            setSelectedSection(e.target.value);
                                            setErrors(prev => ({ ...prev, selectedSection: "" }));
                                        }} className={styles.formControl}
                                            isInvalid={!!errors.selectedSection}
                                        >
                                            <option value="">Select Section</option>
                                            {sectionList.map(sec => (
                                                <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                            ))}
                                        </FormSelect>
                                        <Form.Control.Feedback type="invalid">{errors.selectedSection}</Form.Control.Feedback>
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Student<span className="text-danger">*</span></FormLabel>
                                        <FormSelect value={selectedStudent} onChange={(e) => {
                                            setSelectedStudent(e.target.value);
                                            setErrors(prev => ({ ...prev, selectedStudent: "" }));
                                        }} className={styles.formControl}
                                            isInvalid={!!errors.selectedStudent}
                                        >
                                            <option value="">Select Student</option>
                                            {students.map(std => (
                                                <option key={std._id} value={std._id}>
                                                    {`${std.first_name} ${std?.last_name || ""}`}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        <Form.Control.Feedback type="invalid">{errors.selectedStudent}</Form.Control.Feedback>
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Installment<span className="text-danger">*</span></FormLabel>
                                        <FormSelect value={selectedInstallment} onChange={(e) => {
                                            setSelectedInstallment(e.target.value);
                                            fetchHeadsByInstallment(e.target.value);
                                            setErrors(prev => ({ ...prev, selectedInstallment: "" }));
                                        }} className={styles.formControl}
                                            isInvalid={!!errors.selectedInstallment}
                                        >
                                            <option value="">Select Installment</option>
                                            {installmentList.map(inst => (
                                                <option key={inst._id} value={inst.installment_name}>{inst.installment_name}</option>
                                            ))}
                                        </FormSelect>
                                        <Form.Control.Feedback type="invalid">{errors.selectedInstallment}</Form.Control.Feedback>
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Trans Date<span className="text-danger">*</span></FormLabel>
                                        <Form.Control type="date" value={transDate} onChange={(e) => setTransDate(e.target.value)} className={styles.formControl} />
                                    </Col>
                                </Row>
                            </Form>

                            {
                                heads?.length > 0 && (<>
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
                                                            {errors[`fixedAmount_${index}`] && <div className="text-danger">{errors[`fixedAmount_${index}`]}</div>}
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

                                    {hasEditAccess && (
                                        <div className="d-flex justify-content-end mt-4">
                                            <Button variant="primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: '120px' }} className={styles.btnPrimary}>
                                                <FaSave /> {loading ? "Updating..." : "Update"}
                                            </Button>
                                        </div>
                                    )}
                                </>)
                            }
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default FixedAmount;
