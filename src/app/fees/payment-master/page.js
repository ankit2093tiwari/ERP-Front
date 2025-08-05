"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";

import usePagePermission from "@/hooks/usePagePermission";
import { addNewPaymentMode, deletePaymentModeById, getAllPaymentMode, updatePaymentModeById } from "@/Services";

const PaymentModeMaster = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [newPaymentMode, setNewPaymentMode] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editPaymentMode, setEditPaymentMode] = useState("");
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "80px",
        },
        {
            name: "Payment Mode",
            selector: (row) => row.payment_mode || "N/A",
            sortable: true,
        },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button
                        size="sm" variant="success"
                        onClick={() => handleEdit(row._id, row.payment_mode)}
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        size="sm" variant="danger"
                        onClick={() => handleDelete(row._id)}
                    >
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);
    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAllPaymentMode();
            if (response.success) {
                setData(response.data);
            } else {
                setData([]);
                setError("No records found.");
            }
        } catch (err) {
            setError("Failed to fetch payment modes.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newPaymentMode.trim()) {
            setFieldError("Payment mode is required.");
            return;
        } else if (newPaymentMode.length < 3 || newPaymentMode.length > 50) {
            setFieldError("Payment mode must be 3–50 characters.");
            return;
        }

        setFieldError("");

        try {
            await addNewPaymentMode({ payment_mode: newPaymentMode });
            toast.success("Payment mode added successfully.");
            setNewPaymentMode("");
            setIsAddFormOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response.data.message || "Failed to add payment mode.");
        }
    };

    const handleEdit = (id, name) => {
        setEditId(id);
        setEditPaymentMode(name);
        setIsEditFormOpen(true);
    };

    const handleUpdate = async () => {
        if (!editPaymentMode.trim()) {
            toast.error("Payment mode cannot be empty.");
            return;
        }

        try {
            await updatePaymentModeById(editId, { payment_mode: editPaymentMode });
            toast.success("Payment mode updated successfully.");
            setIsEditFormOpen(false);
            setEditId(null);
            fetchData();
        } catch (err) {
            toast.error("Failed to update payment mode.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this payment mode?")) {
            try {
                await deletePaymentModeById(id);
                toast.success("Payment mode deleted successfully.");
                fetchData();
            } catch (err) {
                toast.error("Failed to delete payment mode.");
            }
        }
    };

    const handlePrint = () => {
        const tableHeaders = [["#", "Payment Mode"]];
        const tableRows = data.map((row, index) => [index + 1, row.payment_mode || "N/A"]);
        printContent(tableHeaders, tableRows);
    };

    const handleCopy = () => {
        const headers = ["#", "Payment Mode"];
        const rows = data.map((row, index) => `${index + 1}\t${row.payment_mode || "N/A"}`);
        copyContent(headers, rows);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const breadcrumbItems = [
        { label: "Fee", link: "/fees/all-module" },
        { label: "payment-mode-master", link: "null" },
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
                    {hasSubmitAccess && (
                        <Button
                            onClick={() => {
                                setIsAddFormOpen(true);
                                setFieldError("");
                                setNewPaymentMode("");
                            }}
                            className="btn-add"
                        >
                            <CgAddR /> Add New Payment Mode
                        </Button>
                    )}

                    {isAddFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Add New Payment Mode</h2>
                                <button
                                    className="closeForm"
                                    onClick={() => setIsAddFormOpen(false)}
                                >
                                    X
                                </button>
                            </div>
                            <Form className="formSheet">
                                <Row>
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Payment Mode Name</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Enter Payment Mode"
                                            value={newPaymentMode}
                                            onChange={(e) => {
                                                setNewPaymentMode(e.target.value);
                                                if (fieldError) setFieldError("");
                                            }}
                                            isInvalid={!!fieldError}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldError}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                                    Add Payment Mode
                                </Button>
                            </Form>
                        </div>
                    )}

                    {isEditFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Edit Payment Mode</h2>
                                <button
                                    className="closeForm"
                                    onClick={() => setIsEditFormOpen(false)}
                                >
                                    X
                                </button>
                            </div>
                            <Form className="formSheet">
                                <Row>
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Payment Mode Name</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Enter Payment Mode"
                                            value={editPaymentMode}
                                            onChange={(e) => setEditPaymentMode(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                                <Button onClick={handleUpdate} className="btn btn-success mt-3">
                                    Update Payment Mode
                                </Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2>Payment Modes</h2>
                        {loading && <p>Loading...</p>}
                        {error && <p className="text-danger">{error}</p>}
                        {!loading && !error && (
                            <Table
                                columns={columns}
                                data={data}
                                handlePrint={handlePrint}
                                handleCopy={handleCopy}
                            />
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(PaymentModeMaster), { ssr: false });
