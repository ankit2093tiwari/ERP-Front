"use client"

import useSessionId from "@/hooks/useSessionId"
import { getClasses, getDailyWiseFeeCollection } from "@/Services"
import { useEffect, useState } from "react"
import {
    Form,
    Row,
    FormLabel,
    FormControl,
    Col,
    Container,
    FormGroup,
    FormSelect,
    Button,
    Alert,
} from "react-bootstrap"
import Table from "@/app/component/DataTable"
import { copyContent, printContent } from "@/app/utils"

const DayWiseCollection = () => {
    const selectedSessionId = useSessionId()
    const [classes, setClasses] = useState([])
    const [hasSearched, setHasSearched] = useState(false);

    const [formData, setFormData] = useState({
        date: "",
        classId: "All",
    })
    const [reportData, setReportData] = useState([])

    useEffect(() => {
        const fetchAllClasses = async () => {
            const response = await getClasses()
            setClasses(response?.data || [])
        }
        fetchAllClasses()
    }, [selectedSessionId])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.date) {
            alert("Please select a date.")
            return
        }

        try {
            const res = await getDailyWiseFeeCollection({
                date: formData.date,
                classId: formData.classId,
            })

            setReportData(res.data || [])
            setHasSearched(true);

        } catch (error) {
            console.error("Failed to fetch daywise collection:", error)
            alert("Something went wrong while fetching the report.")
            setReportData([])
        }
    }

    const column = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: '60px'
        },
        {
            name: "Student Name",
            selector: (row) => row.studentName || "N/A",
            sortable: true
        },
        {
            name: "Class Name",
            selector: (row) => row.studentClass || "N/A",
            sortable: true
        },
        {
            name: "Installment",
            selector: (row) => row.installmentName || "N/A",
            sortable: true
        },
        {
            name: "Amount",
            selector: (row) => row.amount || "0",
            sortable: true
        }
    ]
    const handleCopy = () => {
        const headers = ["#", "StudentName", "ClassName", "AmountPaid", "InstallmentName"]
        const rows = reportData?.map((row, index) => (
            [index + 1, row.studentName || "N/A", row.studentClass || "N/A", row.amount || "N/A", row.installmentName || "N/A"].join('\t')
        ))
        copyContent(headers, rows)
    }
    const handlePrint = () => {
        const headers = [["#", "StudentName", "ClassName", "AmountPaid", "InstallmentName"]]
        const rows = reportData?.map((row, index) => (
            [index + 1, row.studentName || "N/A", row.studentClass || "N/A", row.amount || "N/A", row.installmentName || "N/A"]
        ))
        printContent(headers, rows)
    }
    return (
        <>
            <section>
                <Container>
                    <div className="cover-sheet">
                        <div className="studentHeading">
                            <h2>Daywise Collection Report</h2>
                        </div>
                        <Form className="formSheet" onSubmit={handleSubmit}>
                            <Row>
                                <FormGroup as={Col} md="6">
                                    <FormLabel className="labelForm">
                                        Date<span className="text-danger">*</span>
                                    </FormLabel>
                                    <FormControl
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup as={Col} md="6">
                                    <FormLabel className="labelForm">
                                        Class<span className="text-danger">*</span>
                                    </FormLabel>
                                    <FormSelect
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                    >
                                        <option value="All">All</option>
                                        {classes.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.class_name}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                            </Row>
                            <Button variant="success" className="mt-3" type="submit">
                                Search
                            </Button>
                        </Form>
                    </div>
                    {hasSearched ? (
                        reportData.length === 0 ? (
                            <Alert variant="info">No Fee Record For the Selected Date And Class</Alert>
                        ) : (
                            <div className="tableSheet">
                                <h2>Report:</h2>
                                <div className="m-3 fw-bold text-end">
                                    Total Amount: ₹{reportData.reduce((sum, row) => sum + row.amount, 0)}
                                </div>
                                <Table data={reportData} columns={column} handleCopy={handleCopy} handlePrint={handlePrint} />
                            </div>
                        )
                    ) : (
                        <Alert variant="primary" className="text-center">
                            Please Select Date and Class to fetch Collection
                        </Alert>
                    )}


                </Container>
            </section>
        </>
    )
}

export default DayWiseCollection
