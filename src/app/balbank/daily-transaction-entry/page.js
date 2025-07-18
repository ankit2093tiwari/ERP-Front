"use client"
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, FormLabel, FormControl, FormSelect } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import useSessionId from "@/hooks/useSessionId";
import { copyContent, printContent } from "@/app/utils";

import {
    getStudentByRegistrationId,
    addNewDailyTransaction,
    getAllDailyTransactions,
    deleteDailyTransactionById
} from "@/Services";

const DailyTransactionEntry = () => {
    const sessionId = useSessionId();
    const { hasEditAccess, hasSubmitAccess } = usePagePermission();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [student, setStudent] = useState({});
    const [errors, setErrors] = useState({});
    const [transactionList, setTransactionList] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        studentName: "",
        fatherName: "",
        className: "",
        sectionName: "",
        itemName: "",
        amountPerItem: "",
        itemQuantity: "",
        amount: "",
        paymentMode: "",
        description: ""
    });

    useEffect(() => {
        if (Object.keys(student).length > 0) {
            setFormData(prev => ({
                ...prev,
                studentName: student.studentName,
                fatherName: student.fatherName,
                className: student.className,
                sectionName: student.sectionName
            }));
        }
    }, [student]);

    useEffect(() => {
        if (!studentId || !studentId.trim()) return;
        const fetchStudent = async () => {
            const res = await getStudentByRegistrationId(studentId);
            if (res.success && res.data.length > 0) {
                const s = res.data[0];
                setStudent({
                    studentObjectId: s._id,
                    studentName: `${s.first_name} ${s.last_name || ""}`,
                    fatherName: s.father_name || "N/A",
                    className: s.class_name.class_name,
                    sectionName: s.section_name.section_name,
                });
            }
        };
        fetchStudent();
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
    }, [studentId]);

    useEffect(() => {
        fetchTransactions();
    }, [sessionId]);

    const fetchTransactions = async () => {
        try {
            const res = await getAllDailyTransactions();
            const formatted = res.data.map((t, i) => ({
                transactionId: t._id,
                entryDate: new Date(t.entryDate).toLocaleDateString(),
                studentName: `${t.studentId.first_name} ${t.studentId.last_name || ""}`,
                itemName: t.itemName,
                amountPerItem: t.amountPerItem,
                itemQuantity: t.itemQuantity,
                totalAmount: t.amount,
                description: t.description,
                paymentMode: t.paymentMode
            }));
            setTransactionList(formatted);
        } catch (err) {
            console.error("Error loading transactions", err);
        }
    };

    const validate = () => {
        const e = {};
        if (!formData.itemName?.trim()) e.itemName = "Item name is required";
        if (!formData.amountPerItem || isNaN(formData.amountPerItem)) e.amountPerItem = "Valid amount is required";
        if (!formData.itemQuantity || isNaN(formData.itemQuantity)) e.itemQuantity = "Valid quantity is required";
        if (!formData.amount || isNaN(formData.amount)) e.amount = "Total amount is required";
        if (!formData.paymentMode) e.paymentMode = "Payment mode is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const payload = {
                studentId: student.studentObjectId,
                ...formData,
                amountPerItem: Number(formData.amountPerItem),
                itemQuantity: Number(formData.itemQuantity),
                amount: Number(formData.amount)
            };
            await addNewDailyTransaction(payload);
            toast.success("Transaction added!");
            setFormData({
                date: "",
                studentName: "",
                fatherName: "",
                className: "",
                sectionName: "",
                itemName: "",
                amountPerItem: "",
                itemQuantity: "",
                amount: "",
                paymentMode: "",
                description: ""
            });
            setStudent({});
            setStudentId("");
            setIsFormOpen(false);
            fetchTransactions();
        } catch (err) {
            toast.error("Failed to add transaction");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this record?")) return;
        try {
            await deleteDailyTransactionById(id);
            toast.success("Deleted successfully");
            fetchTransactions();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const columns = [
        { name: "#", selector: (row, i) => i + 1 },
        { name: "EntryDate", selector: row => row.entryDate },
        { name: "StudentName", selector: row => row.studentName },
        { name: "ItemName", selector: row => row.itemName },
        { name: "Amount/Item", selector: row => row.amountPerItem },
        { name: "Quantity", selector: row => row.itemQuantity },
        { name: "TotalAmount", selector: row => row.totalAmount },
        { name: "Description", selector: row => row.description },
        { name: "ModeofPayment", selector: row => row.paymentMode },
        hasEditAccess && {
            name: "Action",
            selector: row => (
                <Button size="sm" variant="danger" onClick={() => handleDelete(row.transactionId)}>
                    <FaTrashAlt />
                </Button>
            )
        }
    ].filter(Boolean);

    const handleCopy = () => {
        const headers = ["#", "EntryDate", "StudentName", "ItemName", "Amount/Item", "Quantity", "TotalAmount", "Description", "ModeofPayment"];
        const rows = transactionList.map((row, i) => [
            i + 1,
            row.entryDate,
            row.studentName,
            row.itemName,
            row.amountPerItem,
            row.itemQuantity,
            row.totalAmount,
            row.description,
            row.paymentMode
        ].join("\t"));
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "EntryDate", "StudentName", "ItemName", "Amount/Item", "Quantity", "TotalAmount",]];
        const rows = transactionList.map((row, i) => [
            i + 1,
            row.entryDate,
            row.studentName,
            row.itemName,
            row.amountPerItem,
            row.itemQuantity,
            row.totalAmount,
            // row.description,
            // row.paymentMode
        ]);
        printContent(headers, rows);
    };

    const breadcrumbItems = [
        { label: "BalBank", link: "/balbank/all-module" },
        { label: "Daily Transaction Entry", link: null },
    ];

    return (
        <>
            <div className="breadcrumbSheet">
                <Container><Row><Col><BreadcrumbComp items={breadcrumbItems} /></Col></Row></Container>
            </div>
            <section>
                <Container>
                    {hasSubmitAccess && (
                        <Button className="btn-add" onClick={() => setIsFormOpen(true)}><CgAddR /> New Entry</Button>
                    )}
                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Add Daily Transaction</h2>
                                <button className="closeForm" onClick={() => setIsFormOpen(false)}>X</button>
                            </div>
                            <Form className="formSheet" onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <FormLabel>Adm No / Reg ID <span className="text-danger">*</span></FormLabel>
                                        <FormControl value={studentId} onChange={e => setStudentId(e.target.value)} />
                                    </Col>
                                    <Col md={6}>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl type="date" name="date" value={formData.date} disabled />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={4}>
                                        <FormLabel>Student Name</FormLabel>
                                        <FormControl value={formData.studentName} disabled />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Father Name</FormLabel>
                                        <FormControl value={formData.fatherName} disabled />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Class</FormLabel>
                                        <FormControl value={formData.className} disabled />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={4}>
                                        <FormLabel>Section</FormLabel>
                                        <FormControl value={formData.sectionName} disabled />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Item Name <span className="text-danger">*</span></FormLabel>
                                        <FormControl name="itemName" value={formData.itemName} onChange={handleChange} isInvalid={!!errors.itemName} />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Amount Per Item <span className="text-danger">*</span></FormLabel>
                                        <FormControl name="amountPerItem" value={formData.amountPerItem} onChange={handleChange} isInvalid={!!errors.amountPerItem} />
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={4}>
                                        <FormLabel>Item Quantity <span className="text-danger">*</span></FormLabel>
                                        <FormControl name="itemQuantity" value={formData.itemQuantity} onChange={handleChange} isInvalid={!!errors.itemQuantity} />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Total Amount <span className="text-danger">*</span></FormLabel>
                                        <FormControl name="amount" value={formData.amount} onChange={handleChange} isInvalid={!!errors.amount} />
                                    </Col>
                                    <Col md={4}>
                                        <FormLabel>Mode of Payment <span className="text-danger">*</span></FormLabel>
                                        <FormSelect name="paymentMode" value={formData.paymentMode} onChange={handleChange} isInvalid={!!errors.paymentMode}>
                                            <option value="">Select</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Demand Draft">Demand Draft</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Online">Online</option>
                                        </FormSelect>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col>
                                        <Button type="submit">Submit</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    )}
                    <div className="cover-sheet">
                        <div className="tableSheet">
                            <h2>Recent Entry</h2>
                            <Table columns={columns} data={transactionList} handleCopy={handleCopy} handlePrint={handlePrint} />
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(DailyTransactionEntry), { ssr: false });
