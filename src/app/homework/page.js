'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { CgAddR } from 'react-icons/cg';
import { FaTrashAlt } from 'react-icons/fa';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    FormLabel,
    FormControl,
} from 'react-bootstrap';
import usePagePermission from '@/hooks/usePagePermission';
import Table from '@/app/component/DataTable';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import { copyContent, printContent } from '@/app/utils';
import {
    getClasses, getSections,
    getAllHomeWork,
    addNewHomeWork,
    deleteHomeWorkById,
    getSubjectByClassId,
} from '@/Services';

const HomeworkEntryPage = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();
    const [classOptions, setClassOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        file: null,
        details: '',
        lastSubmissionDate: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAllHomeWork();
            setData(response?.data || []);
        } catch (error) {
            toast.error('Failed to fetch homework.');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassOptions = async () => {
        try {
            const res = await getClasses();
            setClassOptions(res?.data || []);
        } catch {
            toast.error('Failed to load classes');
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await getSections(classId);
            setSectionOptions(res?.data || []);
        } catch {
            toast.error('Failed to load sections');
        }
    };

    const fetchSubjects = async (classId) => {
        try {
            const res = await getSubjectByClassId(classId); // Pass classId to service
            setSubjectOptions(res?.data || []);
        } catch {
            toast.error('Failed to load subjects');
        }
    };


    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'file') {
            setFormData({ ...formData, file: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === 'classId') {
            fetchSections(value);
            fetchSubjects(value);
            setFormData((prev) => ({
                ...prev,
                sectionId: '',
                subjectId: '',
            }));
        }

        setFormErrors({ ...formErrors, [name]: '' });
    };


    const handleAdd = async () => {
        const requiredFields = ['date', 'subjectId', 'classId', 'sectionId', 'file', 'details', 'lastSubmissionDate'];
        const errors = {};
        requiredFields.forEach((field) => {
            if (!formData[field]) errors[field] = 'This field is required';
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            payload.append(key, value);
        });

        try {
            const res = await addNewHomeWork(payload);
            toast.success(res?.message || 'Homework uploaded');
            fetchData();
            resetForm();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Upload failed');
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            classId: '',
            sectionId: '',
            subjectId: '',
            file: null,
            details: '',
            lastSubmissionDate: '',
        });
        setFormErrors({});
        setIsFormOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            const res = await deleteHomeWorkById(id);
            toast.success(res?.message || 'Deleted');
            fetchData();
        } catch {
            toast.error('Delete failed');
        }
    };

    const handlePrint = () => {
        const headers = [['#', 'Date', 'Class', 'Section', 'Subject', 'Last Submission']];
        const rows = data.map((row, index) => [
            index + 1,
            row.date,
            row.className,
            row.sectionName,
            row.subjectName,
            row.lastSubmissionDate,
        ]);
        printContent(headers, rows);
    };

    const handleCopy = () => {
        const headers = ['#', 'Date', 'Class', 'Section', 'Subject', 'Last Submission'];
        const rows = data.map(
            (row, i) =>
                `${i + 1}\t${row.date}\t${row.className}\t${row.sectionName}\t${row.subjectName}\t${row.lastSubmissionDate}`
        );
        copyContent(headers, rows);
    };

    const columns = [
        { name: '#', selector: (row, i) => i + 1, width: '70px' },
        { name: 'Date', selector: (row) => row.date },
        { name: 'Class', selector: (row) => row?.classId?.class_name },
        { name: 'Section', selector: (row) => row?.sectionId?.section_name },
        { name: 'Subject', selector: (row) => row.subjectId.subject_details.subject_name || "N/A" },
        { name: 'Last Submission', selector: (row) => row.lastSubmissionDate },
        hasEditAccess && {
            name: 'Actions',
            cell: (row) => (
                <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                    <FaTrashAlt />
                </button>
            ),
        },
    ].filter(Boolean);

    const breadcrumbItems = [
        { label: 'Homework', link: '/homework/all-module' },
        { label: 'Homework Entry', link: null },
    ];

    useEffect(() => {
        fetchData();
        fetchClassOptions();
    }, []);

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
                        <Button onClick={() => setIsFormOpen(true)} className="btn-add">
                            <CgAddR /> Add Homework
                        </Button>
                    )}

                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Add Homework</h2>
                                <button className="closeForm" onClick={resetForm}>
                                    X
                                </button>
                            </div>
                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={4}>
                                        <FormLabel>Date <span className="text-danger">*</span></FormLabel>
                                        <FormControl type="date" name="date" value={formData.date} onChange={handleChange} isInvalid={!!formErrors.date} />
                                        <div className="text-danger">{formErrors.date}</div>
                                    </Col>
                                    <Col lg={4}>
                                        <FormLabel>Class <span className="text-danger">*</span></FormLabel>
                                        <Form.Select name="classId" value={formData.classId} onChange={handleChange} isInvalid={!!formErrors.classId}>
                                            <option value="">Select Class</option>
                                            {classOptions.map((cls) => (
                                                <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{formErrors.classId}</div>
                                    </Col>
                                    <Col lg={4}>
                                        <FormLabel>Section <span className="text-danger">*</span></FormLabel>
                                        <Form.Select name="sectionId" value={formData.sectionId} onChange={handleChange} isInvalid={!!formErrors.sectionId}>
                                            <option value="">Select Section</option>
                                            {sectionOptions.map((sec) => (
                                                <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{formErrors.sectionId}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel>Subject <span className="text-danger">*</span></FormLabel>
                                        <Form.Select name="subjectId" value={formData.subjectId} onChange={handleChange} isInvalid={!!formErrors.subjectId}>
                                            <option value="">Select Subject</option>
                                            {subjectOptions.map((sub) => (
                                                <option key={sub._id} value={sub._id}>{sub?.subject_details?.subject_name || "N/A"}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{formErrors.subjectId}</div>
                                    </Col>
                                    <Col lg={6}>
                                        <FormLabel>Last Submission Date <span className="text-danger">*</span></FormLabel>
                                        <FormControl type="date" name="lastSubmissionDate" value={formData.lastSubmissionDate} onChange={handleChange} isInvalid={!!formErrors.lastSubmissionDate} />
                                        <div className="text-danger">{formErrors.lastSubmissionDate}</div>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel>Upload File (PDF/Image) <span className="text-danger">*</span></FormLabel>
                                        <FormControl type="file" name="file" accept="image/*,application/pdf" onChange={handleChange} isInvalid={!!formErrors.file} />
                                        <div className="text-danger">{formErrors.file}</div>
                                    </Col>
                                    <Col lg={6}>
                                        <FormLabel>Homework Details <span className="text-danger">*</span></FormLabel>
                                        <FormControl as="textarea" name="details" rows={3} value={formData.details} onChange={handleChange} isInvalid={!!formErrors.details} placeholder="Enter Homework Details" />
                                        <div className="text-danger">{formErrors.details}</div>
                                    </Col>
                                </Row>

                                <Button className="btn btn-primary" onClick={handleAdd}>Submit Homework</Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet mt-4">
                        <h2>Homework Records</h2>
                        <Table columns={columns} data={data} handlePrint={handlePrint} handleCopy={handleCopy} />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(HomeworkEntryPage), { ssr: false });
