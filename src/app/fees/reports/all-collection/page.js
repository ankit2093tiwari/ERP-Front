"use client"

import { useEffect, useState } from "react"
import {
    getAllInstallments,
    getAllPaymentMode,
    getClasses,
    getDateWiseFeeCollection
} from "@/Services"
import {
    Container,
    Form,
    Row,
    Col,
    FormGroup,
    FormLabel,
    FormSelect,
    FormControl,
    Button,
    Alert,
} from "react-bootstrap"
import useSessionId from "@/hooks/useSessionId"
import Table from "@/app/component/DataTable"
import { copyContent, printContent } from "@/app/utils"

const DateWiseCollectionReport = () => {
    const sessionId = useSessionId()

    const [formData, setFormData] = useState({
        fromDate: "",
        toDate: "",
        classId: "All",
        installmentId: "All",
        paymentModeId: "All",
    })

    const [classes, setClasses] = useState([])
    const [installments, setInstallments] = useState([])
    const [paymentModes, setPaymentModes] = useState([])

    const [hasSearched, setHasSearched] = useState(false)
    const [reportData, setReportData] = useState([])

    useEffect(() => {
        const fetchAllData = async () => {
            const [classRes, installmentRes, paymentModeRes] = await Promise.all([
                getClasses(),
                getAllInstallments(),
                getAllPaymentMode(),
            ])

            setClasses(classRes?.data || [])
            setInstallments(installmentRes?.data || [])
            setPaymentModes(paymentModeRes?.data || [])
        }

        fetchAllData()
    }, [sessionId])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.fromDate || !formData.toDate) {
            alert("Please select both From Date and To Date.")
            return
        }

        try {
            const res = await getDateWiseFeeCollection(formData)
            setReportData(res?.data || [])
            setHasSearched(true)
        } catch (error) {
            console.error("Error fetching report:", error)
            alert("Something went wrong.")
            setReportData([])
        }
    }

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: "60px",
        },
        {
            name: "Student Name",
            selector: (row) => row.studentName || "N/A",
            sortable: true,
        },
        {
            name: "Class Name",
            selector: (row) => row.studentClass || "N/A",
            sortable: true,
        },
        {
            name: "Installment",
            selector: (row) => row.installmentName || "N/A",
            sortable: true,
        },
        {
            name: "Amount",
            selector: (row) => `₹${row.amount || 0}`,
            sortable: true,
        },
        {
            name: "Receipt No",
            selector: (row) => row.receiptNo || "N/A",
        },
        {
            name: "Date",
            selector: (row) => row.date?.split("T")[0] || "N/A",
        },
    ]

    const handleCopy = () => {
        const headers = ["#", "StudentName", "ClassName", "Installment", "Amount", "ReceiptNo", "Date"]
        const rows = reportData.map((row, index) =>
            [index + 1, row.studentName, row.studentClass, row.installmentName, row.amount, row.receiptNo, row.date?.split("T")[0]].join('\t')
        )
        copyContent(headers, rows)
    }

    const handlePrint = () => {
        const headers = [["#", "StudentName", "ClassName", "Installment", "Amount", "ReceiptNo", "Date"]]
        const rows = reportData.map((row, index) =>
            [index + 1, row.studentName, row.studentClass, row.installmentName, row.amount, row.receiptNo, row.date?.split("T")[0]]
        )
        printContent(headers, rows)
    }

    return (
        <section>
            <Container>
                <div className="cover-sheet">
                    <div className="studentHeading">
                        <h2>Search Records</h2>
                    </div>

                    <Form className="formSheet" onSubmit={handleSubmit}>
                        <Row>
                            <FormGroup as={Col} md="6">
                                <FormLabel>From Date<span className="text-danger">*</span></FormLabel>
                                <FormControl
                                    type="date"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>
                            <FormGroup as={Col} md="6">
                                <FormLabel>To Date<span className="text-danger">*</span></FormLabel>
                                <FormControl
                                    type="date"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>
                        </Row>

                        <Row className="mt-3">
                            <FormGroup as={Col} md="6">
                                <FormLabel>Installment Type</FormLabel>
                                <FormSelect
                                    name="installmentId"
                                    value={formData.installmentId}
                                    onChange={handleChange}
                                >
                                    <option value="All">All</option>
                                    {installments.map((inst) => (
                                        <option key={inst._id} value={inst._id}>
                                            {inst.installment_name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>

                            <FormGroup as={Col} md="6">
                                <FormLabel>Pay Mode</FormLabel>
                                <FormSelect
                                    name="paymentModeId"
                                    value={formData.paymentModeId}
                                    onChange={handleChange}
                                >
                                    <option value="All">All</option>
                                    {paymentModes.map((mode) => (
                                        <option key={mode._id} value={mode._id}>
                                            {mode.payment_mode}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </Row>
                        <Row className="mt-3">
                             <FormGroup as={Col} md="6">
                                <FormLabel>Class</FormLabel>
                                <FormSelect
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                >
                                    <option value="All">All</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls._id}>
                                            {cls.class_name}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </Row>

                        <Button variant="success" className="mt-4" type="submit">
                            Search
                        </Button>
                    </Form>
                </div>
                {hasSearched ? (
                        reportData.length === 0 ? (
                            <Alert variant="info" className="mt-4">
                                No Fee Record For the Selected Date And Filters
                            </Alert>
                        ) : (
                            <div className="tableSheet mt-4">
                                <div className="fw-bold text-end mb-2">
                                    Total Amount: ₹{reportData.reduce((sum, row) => sum + row.amount, 0)}
                                </div>
                                <Table
                                    data={reportData}
                                    columns={columns}
                                    handleCopy={handleCopy}
                                    handlePrint={handlePrint}
                                />
                            </div>
                        )
                    ) : (
                        <Alert variant="primary" className="text-center mt-4">
                            Please Select Filters and Submit to Fetch Data
                        </Alert>
                    )}
            </Container>
        </section>
    )
}

export default DateWiseCollectionReport
