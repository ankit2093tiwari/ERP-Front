'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Form, Button,Alert } from 'react-bootstrap';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import DataTable from '@/app/component/DataTable';
import { toast } from 'react-toastify';
import { getClasses, getSections, getAllStudentEvaluations } from '@/Services';
import { copyContent, printContent } from '@/app/utils';

const StudentEvaluationRecords = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [noDataMessage, setNoDataMessage] = useState('');


    const [filters, setFilters] = useState({
        classId: '',
        sectionId: '',
        evalDate: '',
    });

    const [records, setRecords] = useState([]);
    const [totals, setTotals] = useState({ Excellent: 0, Good: 0, Fair: 0, Poor: 0 });

    const breadcrumbItems = [
        { label: 'Chart Filling', link: '/timetable/all-module' },
        { label: 'Evaluation Records', link: null },
    ];

    useEffect(() => {
        getClasses().then((res) => setClassList(res?.data || []));
    }, []);

    const fetchSections = async (classId) => {
        try {
            const res = await getSections(classId);
            setSectionList(res?.data || []);
        } catch {
            toast.error('Failed to load sections');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        if (name === 'classId') {
            fetchSections(value);
            setFilters((prev) => ({ ...prev, sectionId: '' }));
        }
    };

    const handleSearch = async () => {
        const { classId, sectionId, evalDate } = filters;
        if (!classId || !sectionId || !evalDate) {
            toast.error('All filters are required');
            return;
        }

        setNoDataMessage('');
        setRecords([]);
        setTotals({ Excellent: 0, Good: 0, Fair: 0, Poor: 0 });

        try {
            const res = await getAllStudentEvaluations(classId, sectionId, evalDate);
            const evals = res?.data?.evaluations || [];

            const formatted = evals.map((e, i) => ({
                srNo: i + 1,
                studentName: e.studentId?.first_name || '-',
                rollNo: e.studentId?.roll_no || '-',
                gender: e.studentId?.gender_name || '-',
                eval: e.eval,
                remarks: e.remarks,
            }));

            setRecords(formatted);

            const count = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
            evals.forEach((e) => {
                if (e.eval) count[e.eval]++;
            });
            setTotals(count);
        } catch (err) {
            // Gracefully handle known 404 "No evaluations found" response
            const message = err?.response?.data?.message || err?.message;
            if (message === 'No evaluations found') {
                setNoDataMessage('No evaluation records found for the selected date.');
            } else {
                toast.error('Failed to fetch evaluation records');
            }
        }
    };



    const columns = [
        { name: '#', selector: (row) => row.srNo },
        { name: 'Roll No', selector: (row) => row.rollNo || "N/A" },
        { name: 'Student Name', selector: (row) => row.studentName || "N/A" },
        { name: 'Gender', selector: (row) => row.gender || "N/A" },
        { name: 'Evaluation', selector: (row) => row.eval || "N/A" },
        { name: 'Remarks', selector: (row) => row.remarks || "N/A" },
    ];
    const handleCopy = () => {
        const headers = ["#", "Roll No", "Student Name", "Gender", "Evaluation", "Remarks"]
        const rows = records?.map((row, index) => (
            [index + 1, row.studentName || "N/A", row.rollNo || "N/A", row.gender || "N/A", row.eval || "N/A", row.remarks || "N/A"].join('\t')
        ))
        copyContent(headers, rows)
    }
    const handlePrint = () => {
        const headers = [["#", "Roll No", "Student Name", "Gender", "Evaluation", "Remarks"]]
        const rows = records?.map((row, index) => (
            [index + 1, row.studentName || "N/A", row.rollNo || "N/A", row.gender || "N/A", row.eval || "N/A", row.remarks || "N/A"]
        ))
        printContent(headers, rows)
    }
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
                            <h2>Evaluation Records</h2>
                        </div>

                        <Form className="formSheet mb-4">
                            <Row className="mb-3">
                                <Col lg={4}>
                                    <Form.Label>Select Class<span className='text-danger'>*</span></Form.Label>
                                    <Form.Select name="classId" value={filters.classId} onChange={handleChange}>
                                        <option value="">Select Class</option>
                                        {classList?.map((cls) => (
                                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col lg={4}>
                                    <Form.Label>Select Section<span className='text-danger'>*</span></Form.Label>
                                    <Form.Select name="sectionId" value={filters.sectionId} onChange={handleChange}>
                                        <option value="">Select Section</option>
                                        {sectionList?.map((sec) => (
                                            <option key={sec._id} value={sec._id}>{sec.section_name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col lg={4}>
                                    <Form.Label>Evaluation Date<span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="date" name="evalDate" value={filters.evalDate} onChange={handleChange} />
                                </Col>
                            </Row>
                            <Button variant="primary" onClick={handleSearch}>Search Records</Button>
                        </Form>

                        {records.length > 0 && (
                            <div className="tableSheet">
                                <div className="bg-primary text-white p-2 mb-3">
                                    Evaluation Summary — Excellent: {totals.Excellent}, Good: {totals.Good}, Fair: {totals.Fair}, Poor: {totals.Poor}
                                </div>
                                <DataTable columns={columns} data={records} handleCopy={handleCopy} handlePrint={handlePrint} />
                            </div>
                        )}
                    </div>
                    {noDataMessage && (
                    <Alert variant="info" className="mt-3">
                            {noDataMessage}
                        </Alert>
                    )}

                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(StudentEvaluationRecords), { ssr: false });
