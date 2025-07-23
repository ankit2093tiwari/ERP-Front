'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import DataTable from '@/app/component/DataTable'; // use your custom table
import { copyContent, printContent } from '@/app/utils';
import { addNewStudentEvaluation, getClasses, getSections, getStudentsByClassAndSection } from '@/Services';
import useSessionId from '@/hooks/useSessionId';
import usePagePermission from '@/hooks/usePagePermission';

const StudentEvaluation = () => {
    const selectedSessionId = useSessionId()
    const { hasSubmitAccess } = usePagePermission()
    const [classList, setClassList] = useState([]);
    const [formErrors, setFormErrors] = useState({
        classId: '',
        sectionId: '',
        evalDate: '',
    });


    const [sectionList, setSectionList] = useState([]);
    const [formData, setFormData] = useState({
        classId: '',
        sectionId: '',
        evalDate: '',
    });

    const [students, setStudents] = useState([]);
    const [evalCounts, setEvalCounts] = useState({
        Excellent: 0,
        Good: 0,
        Fair: 0,
        Poor: 0,
    });

    const breadcrumbItems = [
        { label: 'Chart Filling', link: '/chartfilling/all-module' },
        { label: 'Student Evaluation', link: null },
    ];

    const fetchClasses = async () => {
        const res = await getClasses()
        setClassList(res?.data)
    }
    const fetchSectionByClass = async (classId) => {
        try {
            const res = await getSections(classId);
            setSectionList(res?.data || []);
        } catch {
            toast.error('Failed to load sections');
        }
    };

    useEffect(() => {
        fetchClasses()
    }, [selectedSessionId])
    const handleSearch = async () => {
        const errors = {};
        if (!formData.classId) errors.classId = 'Class is required';
        if (!formData.sectionId) errors.sectionId = 'Section is required';
        if (!formData.evalDate) errors.evalDate = 'Evaluation Date is required';

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix validation errors');
            return;
        }

        try {
            const res = await getStudentsByClassAndSection(formData.classId, formData.sectionId);
            const studentList = res?.data || [];

            const formatted = studentList.map((s) => ({
                studentId: s._id,
                rollNo: s.roll_no || '',
                name: s.first_name || '',
                father: s.father_name || '',
                admNo: s.registration_id || '',
                gender: s.gender_name || '',
                eval: 'Good',
                remarks: 'good!',
                selected: false,
            }));

            setStudents(formatted);
            setEvalCounts({ Excellent: 0, Good: 0, Fair: 0, Poor: 0 });
        } catch (err) {
            toast.error('Failed to fetch students');
        }
    };

    const handleSubmit = async () => {
        const selected = students.filter((s) => s.selected);
        if (!selected.length) {
            toast.error('No students selected');
            return;
        }

        // Validation for selected students
        for (let s of selected) {
            if (!s.eval) {
                toast.error(`Evaluation is required for student ${s.name}`);
                return;
            }
            if (!s.remarks.trim()) {
                toast.error(`Remarks are required for student ${s.name}`);
                return;
            }
        }

        const payload = {
            classId: formData.classId,
            sectionId: formData.sectionId,
            evalDate: formData.evalDate,
            evaluations: selected.map((s) => ({
                studentId: s.studentId,
                eval: s.eval,
                remarks: s.remarks,
            })),
        };

        try {
            await addNewStudentEvaluation(payload);
            toast.success('Student Evaluation submitted successfully!');
            setStudents([]); // Optional: clear table after success
        } catch (error) {
            console.error('Failed to submit evaluation', error);
            toast.error('Failed to submit evaluation');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));

        if (name === 'classId') {
            fetchSectionByClass(value);
            setFormData((prev) => ({ ...prev, sectionId: '' }));
            setFormErrors((prev) => ({ ...prev, sectionId: '' }));
        }
    };


    const updateCounts = (newList) => {
        const count = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
        newList.forEach((s) => {
            if (s.eval && count[s.eval] !== undefined) {
                count[s.eval]++;
            }
        });
        setEvalCounts(count);
    };

    const handleEvalChange = (i, field, value) => {
        const updated = [...students];
        updated[i][field] = value;
        setStudents(updated);
        updateCounts(updated);
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const updated = students.map((s) => ({ ...s, selected: checked }));
        setStudents(updated);
    };

    const columns = [
        {
            name: <Form.Check type="checkbox" onChange={handleSelectAll} />,
            cell: (row, i) => (
                <Form.Check
                    checked={row.selected}
                    onChange={(e) => {
                        const updated = [...students];
                        updated[i].selected = e.target.checked;
                        setStudents(updated);
                    }}
                />
            ),
            width: '60px',
        },
        { name: '#', selector: (row, i) => i + 1 },
        { name: 'RollNo', selector: (row) => row.rollNo },
        { name: 'StudentName', selector: (row) => row.name },
        { name: 'FatherName', selector: (row) => row.father },
        { name: 'Adm.no.', selector: (row) => row.admNo },
        { name: 'Gender', selector: (row) => row.gender },
        {
            name: 'Evaluation',
            cell: (row, i) => (
                <Form.Select
                    value={row.eval}
                    onChange={(e) => handleEvalChange(i, 'eval', e.target.value)}
                >
                    <option value="">Select</option>
                    <option value="Good">Good</option>
                    <option value="Excellent">Excellent</option>

                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                </Form.Select>
            ),
            width: '130px',
        },
        {
            name: 'Remarks',
            cell: (row, i) => (
                <Form.Control
                    type="text"
                    value={row.remarks}
                    onChange={(e) => handleEvalChange(i, 'remarks', e.target.value)}
                />
            ),
            width: '180px'
        },
    ];

    const handleCopy = () => {
        const rows = students.map((s, i) => `${i + 1}\t${s.rollNo}\t${s.name}\t${s.eval}`);
        copyContent(['#', 'RollNo', 'Name', 'Evaluation'], rows);
    };

    const handlePrint = () => {
        const rows = students.map((s, i) => [i + 1, s.rollNo, s.name, s.eval]);
        printContent([['#', 'RollNo', 'Name', 'Evaluation']], rows);
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
                            <h2>Student Evaluation</h2>
                        </div>

                        <Form className="formSheet mb-4">
                            <Row className="mb-3">
                                <Col lg={4}>
                                    <Form.Label>Select Class<span className='text-danger'>*</span></Form.Label>
                                    <Form.Select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.classId}
                                    >
                                        <option value="">Select Class</option>
                                        {classList?.map((cls) => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.class_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.classId}
                                    </Form.Control.Feedback>

                                </Col>
                                <Col lg={4}>
                                    <Form.Label>Select Section<span className='text-danger'>*</span></Form.Label>
                                    <Form.Select
                                        name="sectionId"
                                        value={formData.sectionId}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.sectionId}
                                    >
                                        <option value="">Select Section</option>
                                        {sectionList.map((sec) => (
                                            <option key={sec._id} value={sec._id}>
                                                {sec.section_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.sectionId}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={4}>
                                    <Form.Label>Evaluation Date<span className='text-danger'>*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="evalDate"
                                        value={formData.evalDate}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.evalDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.evalDate}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            <Button className="me-2" variant="primary" onClick={handleSearch}>
                                Search Students
                            </Button>
                            {hasSubmitAccess && (
                                <Button variant="success" onClick={handleSubmit} disabled={!students.some((s) => s.selected)}>Submit</Button>
                            )}
                        </Form>

                        {students.length > 0 && (
                            <div className='tableSheet'>
                                <div className="bg-secondary text-white p-2 mb-3 rounded-3">
                                    Students Evaluation (✔ Select All Students) — Total Excellent: {evalCounts.Excellent}, Good: {evalCounts.Good}, Fair: {evalCounts.Fair}, Poor: {evalCounts.Poor}
                                </div>
                                <DataTable
                                    columns={columns}
                                    data={students}
                                    handleCopy={handleCopy}
                                    handlePrint={handlePrint}
                                />
                            </div>
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(StudentEvaluation), { ssr: false });
