"use client"
import BreadcrumbComp from "@/app/component/Breadcrumb";
import dynamic from "next/dynamic"
import Table from "@/app/component/DataTable";
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, FormLabel, FormControl, FormSelect } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";
import { addNewDepositAmount, deleteDepositAmountById, getAllDepositAmounts, getStudentByRegistrationId } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import useSessionId from "@/hooks/useSessionId";

const DepositAmount = () => {
    const selectedSessionId = useSessionId()
    const { hasEditAccess, hasSubmitAccess } = usePagePermission()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [studentId, setStudentId] = useState("")
    const [student, setStudent] = useState({})
    const [errors, setErrors] = useState({});

    const [DepositAmountData, setDepositAmountData] = useState([])
    const [formData, setFormdata] = useState({
        date: "",
        studentName: "",
        fatherName: "",
        phone: "",
        className: "",
        sectionName: "",
        amount: "",
        paymentMode: "",
        description: "",
    })
    useEffect(() => {
        if (Object.keys(student).length > 0) {
            setFormdata(prev => ({
                ...prev,
                studentName: student.studentName,
                fatherName: student.fatherName,
                phone: student.phone,
                className: student.className,
                sectionName: student.sectionName,
            }))
        }
    }, [student])

    useEffect(() => {
        if (!studentId || !studentId.trim() || studentId.length > 6) return

        const fetchStudentDetail = async () => {
            const response = await getStudentByRegistrationId(studentId)
            if (response.success && response.data.length > 0) {
                const res = response.data[0]
                const formattedData = {
                    studentObjectId: res._id,
                    studentName: `${res.first_name} ${res?.last_name || ""}` || "N/A",
                    fatherName: res.father_name || "N/A",
                    phone: res.phone_no || "N/A",
                    className: res.class_name.class_name || "N/A",
                    sectionName: res.section_name.section_name || "N/A",
                }
                setStudent(formattedData)
            }
        }
        fetchStudentDetail()
        setFormdata((prev) => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
    }, [studentId])
    useEffect(() => {
        fetchDeposteAmounts()
    }, [selectedSessionId])
    const fetchDeposteAmounts = async () => {
        try {
            const response = await getAllDepositAmounts();
            const depositList = response?.data || [];

            const formattedData = depositList.map((res) => {
                const student = res.studentId;

                return {
                    depositId: res._id,
                    studentId: student?._id,
                    studentName: `${student?.first_name || ""} ${student?.last_name || ""}`.trim() || "N/A",
                    fatherName: student?.father_name || "N/A",
                    phone: student?.phone_no || "N/A",
                    className: student?.class_name.class_name || "N/A",
                    sectionName: student?.section_name.section_name || "N/A",
                    amount: res.amount || 0,
                    paymentMode: res.paymentMode || "N/A",
                    description: res.description || "N/A",
                    entryDate: new Date(res.entryDate).toLocaleDateString() || "N/A"
                };
            });

            setDepositAmountData(formattedData);
        } catch (error) {
            console.error("Failed to fetch deposit amounts:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdata(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    }
    const validate = () => {
        const newErrors = {};

        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.studentName?.trim()) newErrors.studentName = "Student Name is required";
        if (!formData.fatherName?.trim()) newErrors.fatherName = "Father Name is required";
        if (!formData.className?.trim()) newErrors.className = "Class Name is required";
        if (!formData.sectionName?.trim()) newErrors.sectionName = "Section Name is required";
        if (!formData.paymentMode) newErrors.paymentMode = "Payment mode is required";
        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = "Valid amount is required";
        if (!formData.description?.trim()) newErrors.description = "Description is required";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return;
        const payload = {
            studentId: student.studentObjectId,
            paymentMode: formData.paymentMode,
            amount: Number(formData.amount),
            description: formData.description
        }
        try {
            const response = await addNewDepositAmount(payload);
            toast.success(response?.message || 'deposit amount added successfully')
            setStudentId("");
            setStudent({});
            setFormdata({
                date: "",
                studentName: "",
                fatherName: "",
                phone: "",
                className: "",
                sectionName: "",
                amount: 0,
                paymentMode: "",
                description: "",
            })
            setIsFormOpen(false);
            fetchDeposteAmounts()
        } catch (error) {
            console.error('filed to add deposit amount!', error)
            toast.error(error.response?.data?.message || 'failed to add deposite amount!')
        }

    }
    const handleDelete = async (id) => {
        console.log(id);

        if (!confirm("Are you sure want to delete this record?")) return

        try {
            await deleteDepositAmountById(id);
            toast.success('deposit amount deleted successfully!')
            fetchDeposteAmounts()
        } catch (error) {
            console.error('filed to delete deposit amount!', error)
            toast.error(error?.response?.data?.message || 'filed to delete deposit amount!',)
        }
    }
    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1
        },
        {
            name: "Student Name",
            selector: (row) => row.studentName || "N/A",
            sortable: true
        },
        {
            name: "Class-Section",
            selector: (row) => `${row.className}-${row.sectionName}` || "N/A",
            sortable: true,
        },
        {
            name: "Father Name",
            selector: (row) => row.fatherName || "N/A",
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row) => row.phone || "N/A",
            sortable: true,
        },
        {
            name: "Amount",
            selector: (row) => row.amount || "N/A",
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description || "N/A",
            sortable: true,
        },
        hasEditAccess && {
            name: "Actions",
            selector: (row) => (
                <div>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.depositId)}>
                        <FaTrashAlt />
                    </Button>
                </div>
            )
        },
    ]
    const handleCopy = () => {
        const headers = [
            "#", "StudentName", "FatherName", "Class-Section", "Phone", "Amount", "Description"
        ]
        const rows = DepositAmountData?.map((row, index) => (
            [
                index + 1,
                row.studentName,
                row.fatherName || "N/A",
                `${row.className}-${row.sectionName}` || "N/A",
                row.phone,
                row.amount,
                row.description
            ].join('\t')
        ))
        copyContent(headers, rows)
    }
    const handlePrint = () => {
        const headers = [
            ["#", "StudentName", "FatherName", "Class-Section", "Phone", "Amount", "Description"]
        ]
        const rows = DepositAmountData?.map((row, index) => (
            [
                index + 1,
                row.studentName,
                row.fatherName || "N/A",
                `${row.className}-${row.sectionName}` || "N/A",
                row.phone,
                row.amount,
                row.description
            ]
        ))
        printContent(headers, rows)
    }
    const breadcrumbItems = [
        { label: "BalBank", link: "/balbank/all-module" },
        { label: "Deposit Amount", link: null },
    ];

    return (
        <>
            <div className="breadcrumbSheet">
                <Container>
                    <Row>
                        <Col>
                            <BreadcrumbComp items={breadcrumbItems}></BreadcrumbComp>
                        </Col>
                    </Row>
                </Container>
            </div>
            <section>
                <Container>
                    {hasSubmitAccess && (
                        <Button className="btn-add" onClick={() => setIsFormOpen(true)}><CgAddR />New Deposite</Button>
                    )}
                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Add Deposit Amount</h2>
                                <button className="closeForm" onClick={() => setIsFormOpen(false)}>X</button>
                            </div>
                            <Form className="formSheet" onSubmit={handleSubmit}>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <FormLabel className="labelForm">Enter Student Adm No/Registration ID to Search  <span className="text-danger">*</span></FormLabel>
                                        <FormControl onChange={(e) => setStudentId(e.target.value)} ></FormControl>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <FormLabel>Date <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <FormLabel>Student Name <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="text"
                                            name="studentName"
                                            value={formData.studentName}
                                            isInvalid={!!errors.studentName}
                                            disabled
                                        />
                                        <FormControl.Feedback type="invalid">{errors.studentName}</FormControl.Feedback>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <FormLabel>ClassName <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            name="className"
                                            value={formData.className}
                                            isInvalid={!!errors.className}
                                            disabled
                                        />
                                        <FormControl.Feedback type="invalid">{errors.className}</FormControl.Feedback>
                                    </Col>
                                    <Col md={6}>
                                        <FormLabel>Father Name <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="text"
                                            name="fatherName"
                                            value={formData.fatherName}
                                            isInvalid={!!errors.fatherName}
                                            disabled
                                        />
                                        <FormControl.Feedback type="invalid">{errors.fatherName}</FormControl.Feedback>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={6}>
                                        <FormLabel>Section <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            name="sectionName"
                                            value={formData.sectionName}
                                            isInvalid={!!errors.sectionName}
                                            disabled
                                        />
                                        <FormControl.Feedback type="invalid">{errors.sectionName}</FormControl.Feedback>
                                    </Col>
                                    <Col md={6}>
                                        <FormLabel>Mode of Payment <span className="text-danger">*</span></FormLabel>
                                        <FormSelect
                                            name="paymentMode"
                                            value={formData.paymentMode}
                                            onChange={handleChange}
                                            isInvalid={!!errors.paymentMode}
                                        >
                                            <option>Select</option>
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="debit_card">Debit Card</option>
                                            <option value="credit_card">Credit Card</option>
                                        </FormSelect>
                                        <FormControl.Feedback type="invalid">{errors.paymentMode}</FormControl.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <FormLabel>Description <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            as="textarea"
                                            rows={2}
                                            name="description"
                                            onChange={handleChange}
                                            isInvalid={!!errors.description}
                                        />
                                        <FormControl.Feedback type="invalid">{errors.description}</FormControl.Feedback>
                                    </Col>
                                    <Col md={6}>
                                        <FormLabel>Amount <span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            name="amount"
                                            onChange={handleChange}
                                            isInvalid={!!errors.amount}
                                        />
                                        <FormControl.Feedback type="invalid">{errors.amount}</FormControl.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Button type="submit">Submit</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    )}
                    <div className="cover-sheet">
                        <div className="tableSheet">
                            <h2>Deposit Amount Records</h2>
                            <Table columns={columns} data={DepositAmountData} handleCopy={handleCopy} handlePrint={handlePrint} />
                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}

export default dynamic(() => Promise.resolve(DepositAmount), { ssr: false })