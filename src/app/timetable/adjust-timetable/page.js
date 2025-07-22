
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaTrashAlt, FaEdit, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import usePagePermission from '@/hooks/usePagePermission';
import useSessionId from '@/hooks/useSessionId';
import Table from '@/app/component/DataTable';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import { copyContent, printContent } from '@/app/utils';
import {
    getAllEmployee,
    getClasses,
    getSections,
    getSubjectByClassId,
    getAlltimeTables,
    updateTimeTableById,
    deleteTimeTableById,
} from '@/Services';

const AdjustTimeTable = () => {
    const { hasEditAccess } = usePagePermission();
    const sessionId = useSessionId();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [classOptions, setClassOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [teacherOptions, setTeacherOptions] = useState([]);

    const [formData, setFormData] = useState({
        classId: '',
        sectionId: '',
        startTime: '08:00',
        periods: [],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getAlltimeTables();
            setData(res?.data || []);
        } catch {
            toast.error('Failed to load timetables');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getClasses().then(res => setClassOptions(res?.data || []));
        getAllEmployee().then(res => setTeacherOptions(res?.data || []));
    }, [sessionId]);

    const fetchSectionsAndSubjects = async classId => {
        try {
            const [sections, subjects] = await Promise.all([
                getSections(classId),
                getSubjectByClassId(classId),
            ]);
            setSectionOptions(sections?.data || []);
            setSubjectOptions(subjects?.data || []);
        } catch {
            toast.error('Failed to load sections or subjects');
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'classId') {
            fetchSectionsAndSubjects(value);
            setFormData(prev => ({ ...prev, sectionId: '' }));
        }
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const getDuration = (start, end) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return eh * 60 + em - (sh * 60 + sm);
    };

    const formatTime = date => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const handlePeriodChange = (index, field, value) => {
        const updated = [...formData.periods];
        updated[index] = { ...updated[index], [field]: value };

        const p = updated[index];
        if (p.isBreak && (field === 'endTime' || field === 'startTime')) {
            const durationArr = updated.slice(index + 1).map(q => getDuration(q.startTime, q.endTime));
            let [bh, bm] = p.endTime.split(':').map(Number);
            let currentTime = new Date();
            currentTime.setHours(bh, bm, 0, 0);

            for (let i = index + 1; i < updated.length; i++) {
                const dur = durationArr[i - index - 1];
                const start = formatTime(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + dur);
                const end = formatTime(currentTime);
                updated[i].startTime = start;
                updated[i].endTime = end;
            }
        }

        setFormData(prev => ({ ...prev, periods: updated }));
    };

    const handleAddPeriod = () => {
        const last = formData.periods[formData.periods.length - 1];
        const dur = getDuration(last.startTime, last.endTime);
        const [lh, lm] = last.endTime.split(':').map(Number);
        const start = new Date(); start.setHours(lh, lm, 0, 0);
        const end = new Date(start.getTime() + dur * 60000);

        const newPeriod = {
            periodNumber: `Period ${formData.periods.length + 1}`,
            subjectId: '',
            teacherId: '',
            startTime: formatTime(start),
            endTime: formatTime(end),
            isBreak: false,
        };
        setFormData(prev => ({ ...prev, periods: [...prev.periods, newPeriod] }));
    };

    const validateForm = () => {
        const err = {};
        if (!formData.classId) err.classId = 'Class is required';
        if (!formData.sectionId) err.sectionId = 'Section is required';
        return err;
    };

    const handleSubmit = async () => {
        const payload = {
            classId: formData.classId,
            sectionId: formData.sectionId,
            startTime: formData.periods[0]?.startTime || '08:00',
            periods: formData.periods,
            periodDuration: 40, // you can calculate or keep fixed
            totalPeriods: formData.periods.filter(p => !p.isBreak).length,
            lunchAfterPeriod: formData.periods.findIndex(p => p.isBreak) || 0
        };

        try {
            const response = await updateTimeTableById(editId, payload);
            if (response.success) {
                toast.success('Updated Successfully');
                fetchData();
                resetForm();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Something went wrong while updating');
            console.error(error);
        }
    };


    const handleEdit = record => {
        setIsFormOpen(true);
        setEditId(record._id);
        fetchSectionsAndSubjects(record.classId._id);
        const dayKey = Object.keys(record.timetable)[0];
        setFormData({
            classId: record.classId._id,
            sectionId: record.sectionId._id,
            startTime: record.startTime || '08:00',
            periods: record.timetable[dayKey] || [],
        });
    };

    const handleDelete = async id => {
        if (!confirm('Delete this timetable?')) return;
        try {
            await deleteTimeTableById(id);
            toast.success('timetable deleted!');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const resetForm = () => {
        setFormData({ classId: '', sectionId: '', startTime: '08:00', periods: [] });
        setFormErrors({});
        setIsFormOpen(false);
        setEditId(null);
    };

    const handleView = async (row) => {
        const subjectList = await getSubjectByClassId(row.classId._id);
        const doc = new jsPDF();
        const title = `Timetable for ${row.classId.class_name} - ${row.sectionId.section_name}`;
        doc.setFontSize(14);
        doc.text(title, 10, 15);

        const days = Object.keys(row.timetable);
        let startY = 25;

        days.forEach((day, index) => {
            const periods = row.timetable[day];

            // Check if we need to move to a new page
            if (startY > 250) {
                doc.addPage();
                startY = 15;
            }

            // Add day heading
            doc.setFontSize(12);
            doc.text(day.toUpperCase(), 10, startY);
            startY += 5;

            // Build table data
            const tableBody = periods.map(period => {
                const subject = subjectList.data.find(s => s._id === period.subjectId);
                const teacher = teacherOptions.find(t => t._id === period.teacherId);
                return [
                    period.periodNumber,
                    period.isBreak ? 'Break' : (subject?.subject_details?.subject_name || 'N/A'),
                    period.isBreak ? '-' : (teacher?.employee_name || 'N/A'),
                    period.startTime || '-',
                    period.endTime || '-',
                ];
            });

            // Generate table
            autoTable(doc, {
                head: [['Period', 'Subject', 'Teacher', 'Start Time', 'End Time']],
                body: tableBody,
                startY,
                styles: { fontSize: 10 },
                theme: 'grid',
                margin: { left: 10, right: 10 },
                didDrawPage: (data) => {
                    // update startY after table
                    startY = data.cursor.y + 10;
                },
            });
        });
        doc.output('dataurlnewwindow');
        // doc.save(`${row.classId.class_name}_${row.sectionId.section_name}_Timetable.pdf`); /to download
    };


    const columns = [
        { name: '#', selector: (_, i) => i + 1, width: '60px' },
        { name: 'Class', selector: row => row.classId.class_name },
        { name: 'Section', selector: row => row.sectionId.section_name },
        hasEditAccess && {
            name: 'Actions',
            cell: row => (
                <>
                    <Button variant="info" size="sm" className='me-1' onClick={() => handleView(row)}><FaEye /></Button>{' '}
                    <Button variant="success" size="sm" className='me-1' onClick={() => handleEdit(row)}><FaEdit /></Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </>
            ),
        },
    ];

    const handleCopy = () => {
        const hdrs = ['#', 'Class', 'Section'];
        const rows = data.map((r, i) => `${i + 1}\t${r.classId.class_name}\t${r.sectionId.section_name}`);
        copyContent(hdrs, rows);
    };

    const handlePrint = () => {
        const hdrs = [['#', 'Class', 'Section']];
        const rows = data.map((r, i) => [i + 1, r.classId.class_name, r.sectionId.section_name]);
        printContent(hdrs, rows);
    };

    const breadcrumbItems = [
        { label: 'TimeTable', link: '/timetable/all-module' },
        { label: 'Regular TimeTable', link: null },
    ];

    return (
        <>
            <div className="breadcrumbSheet position-relative">
                <Container><Row className="mt-1 mb-1"><Col><BreadcrumbComp items={breadcrumbItems} /></Col></Row></Container>
            </div>

            <section>
                <Container>
                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Edit Timetable</h2>
                                <button className="closeForm" onClick={resetForm}>X</button>
                            </div>
                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <Form.Label>Class <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="classId" value={formData.classId} onChange={handleChange} isInvalid={!!formErrors.classId}>
                                            <option value="">Select Class</option>
                                            {classOptions.map(c => <option key={c._id} value={c._id}>{c.class_name}</option>)}
                                        </Form.Select>
                                        <div className="text-danger">{formErrors.classId}</div>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Label>Section <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="sectionId" value={formData.sectionId} onChange={handleChange} isInvalid={!!formErrors.sectionId}>
                                            <option value="">Select Section</option>
                                            {sectionOptions.map(s => <option key={s._id} value={s._id}>{s.section_name}</option>)}
                                        </Form.Select>
                                        <div className="text-danger">{formErrors.sectionId}</div>
                                    </Col>
                                </Row>

                                {formData.periods.length > 0 && (
                                    <div className="mb-3">
                                        <h5>Daily Timetable</h5>
                                        <Button variant="secondary" size="sm" className="mb-3" onClick={handleAddPeriod}>
                                            + Add Period
                                        </Button>
                                        {formData.periods.map((p, i) => (
                                            <Row key={i} className="mb-2 align-items-center">
                                                <Col lg={2}><h6>{p.periodNumber}</h6></Col>
                                                {!p.isBreak ? (
                                                    <>
                                                        <Col lg={3}>
                                                            <Form.Select value={p.subjectId} onChange={e => handlePeriodChange(i, 'subjectId', e.target.value)}>
                                                                <option value="">Select Subject</option>
                                                                {subjectOptions.map(sub => <option key={sub._id} value={sub._id}>{sub.subject_details.subject_name}</option>)}
                                                            </Form.Select>
                                                        </Col>
                                                        <Col lg={3}>
                                                            <Form.Select value={p.teacherId} onChange={e => handlePeriodChange(i, 'teacherId', e.target.value)}>
                                                                <option value="">Select Teacher</option>
                                                                {teacherOptions.map(t => <option key={t._id} value={t._id}>{t.employee_name}</option>)}
                                                            </Form.Select>
                                                        </Col>
                                                        <Col lg={2}>
                                                            <Form.Control type="time" value={p.startTime} onChange={e => handlePeriodChange(i, 'startTime', e.target.value)} />
                                                        </Col>
                                                        <Col lg={2}>
                                                            <Form.Control type="time" value={p.endTime} onChange={e => handlePeriodChange(i, 'endTime', e.target.value)} />
                                                        </Col>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Col lg={3}><h6>Break</h6></Col>
                                                        <Col lg={2}>
                                                            <Form.Control type="time" value={p.startTime} onChange={e => handlePeriodChange(i, 'startTime', e.target.value)} />
                                                        </Col>
                                                        <Col lg={2}>
                                                            <Form.Control type="time" value={p.endTime} onChange={e => handlePeriodChange(i, 'endTime', e.target.value)} />
                                                        </Col>
                                                    </>
                                                )}
                                            </Row>
                                        ))}
                                    </div>
                                )}

                                <Button className="btn btn-primary" onClick={handleSubmit}>Update</Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet mt-4">
                        <h2>Timetable Records</h2>
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                        ) : (
                            <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
                        )}
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(AdjustTimeTable), { ssr: false });

