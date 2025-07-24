"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import { copyContent, printContent } from "@/app/utils";
import { getAllEmployee } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const SendSMSToEmployees = () => {
    const { hasSubmitAccess } = usePagePermission()
    const breadcrumbItems = [
        { label: "Send Bulk SMS", link: "/sendsms/all-module" },
        { label: "Send SMS to Employees", link: "null" },
    ];

    const [employees, setEmployees] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await getAllEmployee();
                setEmployees(res?.data || []);
            } catch {
                toast.error("Failed to load employees");
            }
        };
        fetchEmployees();
    }, []);

    const handleSelectAll = () => {
        if (selectedIds.length === employees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(employees.map(emp => emp._id));
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSendSMS = () => {
        if (!message.trim()) {
            toast.warning("Please enter a message");
            return;
        }
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one employee");
            return;
        }

        // TODO: Send SMS API call here
        toast.success(`SMS sent to ${selectedIds.length} employee(s)`);
        setMessage("");
        setSelectedIds([]);
    };

    const columns = [
        {
            name: (
                <Form.Check
                    type="checkbox"
                    checked={selectedIds.length === employees.length && employees.length > 0}
                    onChange={handleSelectAll}
                />
            ),
            cell: (row) => (
                <Form.Check
                    type="checkbox"
                    checked={selectedIds.includes(row._id)}
                    onChange={() => handleSelect(row._id)}
                />
            ),
            width: "50px",
        },
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: "60px",
        },
        {
            name: "Employee Code",
            selector: (row) => row.employee_code || "N/A",
            sortable: true,
        },
        {
            name: "Name",
            selector: (row) =>
                `${row.employee_name || ""}`.trim() || "N/A",
            sortable: true,
        },
        {
            name: "Father Name",
            selector: (row) =>
                `${row.father_name || ""}`.trim() || "N/A",
            sortable: true,
        },
        {
            name: "Mobile",
            selector: (row) => row.mobile_no || "N/A",
            sortable: true,
        },
        {
            name: "Designation",
            selector: (row) => row.designation_name?.designation_name || "N/A",
            sortable: true,
        },
    ];

    const handleCopy = () => {
        const headers = ["#", "Employee Code", "Name", "Mobile", "Designation", "Department"];
        const rows = employees.map((e, i) => {
            const name = `${e.employee_name || ""}`.trim();
            return `${i + 1}\t${e.employee_code || "N/A"}\t${name || "N/A"}\t${e.mobile_no || "N/A"}\t${e.designation_name?.designation_name || "N/A"}\t${e.department_name?.department_name || "N/A"}`;
        });
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Employee Code", "Name", "Mobile", "Designation", "Department"]];
        const rows = employees.map((e, i) => {
            const name = `${e.employee_name || ""}`.trim();
            return [
                i + 1,
                e.employee_code || "N/A",
                name || "N/A",
                e.mobile_no || "N/A",
                e.designation_name?.designation_name || "N/A",
                e.department_name?.department_name || "N/A"
            ];
        });
        printContent(headers, rows);
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
                            <h2>Staff List</h2>
                        </div>
                        <div className="formSheet">
                            <Row className="mb-2">
                                <Col lg={12}>
                                    <Form.Label>Short Message<span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter message to send..."
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button variant="success" onClick={handleSendSMS} disabled={!hasSubmitAccess}>
                                        Send SMS
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <div className="tableSheet">
                            <Table
                                columns={columns}
                                data={employees}
                                handleCopy={handleCopy}
                                handlePrint={handlePrint}
                            />
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default SendSMSToEmployees;
