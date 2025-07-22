"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    Button, Col, Container, Form, FormControl, FormLabel, FormSelect, Row,
} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import {
    getClasses,
    getAllSyllabus,
    uploadSyllabus,
    deleteSyllabusById,
    getSubjectByClassId,
    updateSyllabusById
} from "@/Services";

const SyllabusUploadPage = () => {
    const sessionId = useSessionId();
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();

    const [classList, setClassList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [syllabusList, setSyllabusList] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        classId: "",
        subject: "",
        file: null,
    });
    const [errors, setErrors] = useState({});
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClassList();
        fetchSyllabusList();
    }, [sessionId]);

    const fetchClassList = async () => {
        const res = await getClasses();
        setClassList(res.data || []);
    };

    const fetchSubjects = async (classId) => {
        try {
            const res = await getSubjectByClassId(classId);
            setSubjectList(res.data || []);
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        }
    };

    const fetchSyllabusList = async () => {
        setLoading(true);
        const res = await getAllSyllabus();
        setSyllabusList(res.data || []);
        setLoading(false);
    };

    const handleSubmit = async () => {
        const fieldErrors = {};
        if (!formData.classId) fieldErrors.classId = "Class is required";
        if (!formData.subject) fieldErrors.subject = "Subject is required";
        if (!editId && !formData.file) fieldErrors.file = "File is required";
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length) return;

        const payload = new FormData();
        payload.append("classId", formData.classId);
        payload.append("subject", formData.subject);
        payload.append("session", sessionId);
        if (formData.file) payload.append("file", formData.file);

        try {
            setFormLoading(true);
            if (editId) {
                await updateSyllabusById(editId, payload);
                toast.success("Syllabus updated successfully!");
            } else {
                await uploadSyllabus(payload);
                toast.success("Syllabus uploaded successfully!");
            }

            setFormData({ classId: "", subject: "", file: null });
            setSubjectList([]);
            setIsPopoverOpen(false);
            setEditId(null);
            fetchSyllabusList();
        } catch (err) {
            toast.error(err.response?.data.message || "Operation failed!");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (record) => {
        setIsPopoverOpen(true);
        setEditId(record._id);

        await fetchSubjects(record.classId); // ✅ ensures subject list is ready

        setFormData({
            classId: record.classId,   // ✅ now works because it's an ObjectId string
            subject: record.subject,   // ✅ also ObjectId
            file: null,
        });
    };


    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteSyllabusById(id);
            toast.success("Deleted successfully!");
            fetchSyllabusList();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleCopy = () => {
        const headers = ["#", "Class", "Subject"];
        const rows = syllabusList.map((row, i) =>
            `${i + 1}\t${row.className}\t${row.subjectName}`
        );
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Class", "Subject"]];
        const rows = syllabusList.map((row, i) => [i + 1, row.className, row.subjectName]);
        printContent(headers, rows);
    };

    const columns = [
        {
            name: "#",
            selector: (_, i) => i + 1,
            width: "80px",
        },
        {
            name: "Class",
            selector: (row) => row.className,
        },
        {
            name: "Subject",
            selector: (row) => row.subjectName,
        },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-2">
                    <a
                        title="view_syllabus"
                        className="me-1 p-2 border bg-light rounded-2"
                        href={row.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaEye />
                    </a>
                    <Button
                        size="sm"
                        variant="success"
                        className="me-1"
                        onClick={() => handleEdit(row)}
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        className="me-1"
                        onClick={() => handleDelete(row._id)}
                    >
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);

    const breadcrumbItems = [
        { label: "Syllabus Upload", link: null },
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
                        <Button className="btn-add" onClick={() => {
                            setIsPopoverOpen(true);
                            setEditId(null);
                            setFormData({ classId: "", subject: "", file: null });
                            setSubjectList([]);
                            setErrors({});
                        }}>
                            <CgAddR /> Add Syllabus
                        </Button>
                    )}

                    {isPopoverOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>{editId ? "Update" : "Add New"} Syllabus</h2>
                                <button
                                    className="closeForm"
                                    onClick={() => {
                                        setIsPopoverOpen(false);
                                        setFormData({ classId: "", subject: "", file: null });
                                        setSubjectList([]);
                                        setEditId(null);
                                        setErrors({});
                                    }}
                                >
                                    X
                                </button>
                            </div>

                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel>Select Class <span className="text-danger">*</span></FormLabel>
                                        <FormSelect
                                            value={formData.classId}
                                            onChange={(e) => {
                                                const classId = e.target.value;
                                                setFormData({ ...formData, classId, subject: "" });
                                                fetchSubjects(classId);
                                                setErrors({ ...errors, classId: "" });
                                            }}
                                            isInvalid={!!errors.classId}
                                        >
                                            <option value="">Select Class</option>
                                            {classList.map((cls) => (
                                                <option key={cls._id} value={cls._id}>
                                                    {cls.class_name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.classId && <div className="text-danger">{errors.classId}</div>}
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel>Select Subject <span className="text-danger">*</span></FormLabel>
                                        <FormSelect
                                            value={formData.subject}
                                            onChange={(e) => {
                                                setFormData({ ...formData, subject: e.target.value });
                                                setErrors({ ...errors, subject: "" });
                                            }}
                                            isInvalid={!!errors.subject}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjectList.map((subj) => (
                                                <option key={subj._id} value={subj._id}>
                                                    {subj.subject_details.subject_name}
                                                </option>
                                            ))}
                                        </FormSelect>
                                        {errors.subject && <div className="text-danger">{errors.subject}</div>}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel>Upload PDF File {editId ? "(optional)" : <span className="text-danger">*</span>}</FormLabel>
                                        <FormControl
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) =>
                                                setFormData({ ...formData, file: e.target.files[0] })
                                            }
                                            isInvalid={!!errors.file}
                                        />
                                        {errors.file && <div className="text-danger">{errors.file}</div>}
                                    </Col>
                                    {editId && !formData.file && (
                                        <div className="mt-1">
                                            <strong>Existing file:</strong>{" "}
                                            <a
                                                href={syllabusList.find(item => item._id === editId)?.filePath}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View PDF
                                            </a>
                                        </div>
                                    )}

                                </Row>

                                <Button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>
                                    {formLoading ? (editId ? "Updating..." : "Uploading...") : editId ? "Update Syllabus" : "Upload Syllabus"}
                                </Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2>Syllabus Records</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <Table
                                columns={columns}
                                data={syllabusList}
                                handleCopy={handleCopy}
                                handlePrint={handlePrint}
                            />
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(SyllabusUploadPage), { ssr: false });

