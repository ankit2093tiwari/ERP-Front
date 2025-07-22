'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Form, Button, } from 'react-bootstrap';
import usePagePermission from '@/hooks/usePagePermission';
import useSessionId from '@/hooks/useSessionId';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import { toast } from 'react-toastify';
import {
    getAllEmployee,
    getClasses,
    getSections,
    getSubjectByClassId,
    getAlltimeTables,
    addNewTimeTable,
} from '@/Services';

const TimetablePage = () => {
    const { hasSubmitAccess } = usePagePermission();
    const sessionId = useSessionId();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    const [classOptions, setClassOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [teacherOptions, setTeacherOptions] = useState([]);

    const [formData, setFormData] = useState({
        classId: '',
        sectionId: '',
        periodDuration: '',
        totalPeriods: '',
        lunchAfterPeriod: '',
        startTime: '08:00',
        periods: [],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getAlltimeTables();
            setData(res?.data || []);
        } catch {
            toast.error('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getClasses().then((res) => setClassOptions(res?.data || []));
        getAllEmployee().then((res) => setTeacherOptions(res?.data || []));
    }, [sessionId]);

    const fetchSectionsAndSubjects = async (classId) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'classId') {
            fetchSectionsAndSubjects(value);
            setFormData((prev) => ({ ...prev, sectionId: '' }));
        }
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePeriodChange = (index, field, value) => {
        const newPeriods = [...formData.periods];
        newPeriods[index] = { ...newPeriods[index], [field]: value };
        setFormData((prev) => ({
            ...prev,
            periods: newPeriods,
        }));
    };

    const generatePeriods = () => {
        const { periodDuration, totalPeriods, lunchAfterPeriod, startTime } = formData;
        if (!periodDuration || !totalPeriods) {
            toast.error("Please provide both period duration and total periods.");
            return;
        }

        const periods = [];
        let currentTime = new Date(`2023-01-01T${startTime || '08:00'}:00`);

        for (let i = 1; i <= totalPeriods; i++) {
            // Add lunch break if this is the period after lunchAfterPeriod
            if (i === Number(lunchAfterPeriod) + 1) {
                const breakStart = currentTime.toTimeString().slice(0, 5);
                currentTime = new Date(currentTime.getTime() + 30 * 60000);
                const breakEnd = currentTime.toTimeString().slice(0, 5);
                periods.push({
                    periodNumber: `Break`,
                    isBreak: true,
                    startTime: breakStart,
                    endTime: breakEnd,
                });
            }

            const start = currentTime.toTimeString().slice(0, 5);
            currentTime = new Date(currentTime.getTime() + periodDuration * 60000);
            const end = currentTime.toTimeString().slice(0, 5);

            periods.push({
                periodNumber: `Period ${i}`,
                subjectId: '',
                teacherId: '',
                startTime: start,
                endTime: end,
                isBreak: false,
            });
        }

        setFormData((prev) => ({ ...prev, periods }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.classId) errors.classId = 'Class is required';
        if (!formData.sectionId) errors.sectionId = 'Section is required';
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }
        try {
            const payload = {
                classId: formData.classId,
                sectionId: formData.sectionId,
                periodDuration: formData.periodDuration,
                totalPeriods: formData.totalPeriods,
                lunchAfterPeriod: formData.lunchAfterPeriod,
                startTime: formData.startTime,
                periods: formData.periods
            };
            // console.log(payload);
            const res = await addNewTimeTable(payload);
            toast.success(res?.message || 'Added successfully');
            fetchData();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data.message || 'Submit failed');
        }
    };


    const resetForm = () => {
        setFormData({
            classId: '',
            sectionId: '',
            periodDuration: '',
            totalPeriods: '',
            lunchAfterPeriod: '',
            startTime: '08:00',
            periods: [],
        });
        setFormErrors({});
    };


    const breadcrumbItems = [
        { label: "TimeTable", link: "/timetable/all-module" },
        { label: "Regular TimeTable", link: null },
    ];

    return (
        <>
            <div className='breadcrumbSheet position-relative'>
                <Container>
                    <Row className='mt-1 mb-1'>
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>

            <section>
                <Container>
                    <div className='cover-sheet'>
                        <div className='studentHeading'>
                            <h2>Add Timetable</h2>
                        </div>
                        <Form className='formSheet'>
                            <Row className='mb-3'>
                                <Col lg={6}>
                                    <Form.Label>Class <span className='text-danger'>*</span></Form.Label>
                                    <Form.Select name='classId' value={formData.classId} onChange={handleChange} isInvalid={!!formErrors.classId}>
                                        <option value=''>Select Class</option>
                                        {classOptions.map((cls) => <option key={cls._id} value={cls._id}>{cls.class_name}</option>)}
                                    </Form.Select>
                                    <div className='text-danger'>{formErrors.classId}</div>
                                </Col>
                                <Col lg={6}>
                                    <Form.Label>Section <span className='text-danger'>*</span></Form.Label>
                                    <Form.Select name='sectionId' value={formData.sectionId} onChange={handleChange} isInvalid={!!formErrors.sectionId}>
                                        <option value=''>Select Section</option>
                                        {sectionOptions.map((sec) => <option key={sec._id} value={sec._id}>{sec.section_name}</option>)}
                                    </Form.Select>
                                    <div className='text-danger'>{formErrors.sectionId}</div>
                                </Col>
                            </Row>

                            <Row className='mb-3'>
                                <Col lg={3}>
                                    <Form.Label>Start Time</Form.Label>
                                    <Form.Control type='time' value={formData.startTime} name="startTime" onChange={handleChange} />
                                </Col>
                                <Col lg={3}>
                                    <Form.Label>Period Duration (mins)</Form.Label>
                                    <Form.Control type='number' value={formData.periodDuration} name="periodDuration" placeholder='period duration in minutes' onChange={handleChange} />
                                </Col>
                                <Col lg={3}>
                                    <Form.Label>Total Periods</Form.Label>
                                    <Form.Control type='number' value={formData.totalPeriods} name="totalPeriods" placeholder="total number of Periods" onChange={handleChange} />
                                </Col>
                                <Col lg={3}>
                                    <Form.Label>Lunch After Period</Form.Label>
                                    <Form.Control
                                        type='number'
                                        value={formData.lunchAfterPeriod}
                                        name="lunchAfterPeriod"
                                        onChange={handleChange}
                                        placeholder="break after period"
                                    />
                                </Col>
                            </Row>
                            <Button variant='success' onClick={generatePeriods} className=''>Generate Periods</Button>

                            {formData.periods.length > 0 && (
                                <div className='mb-4'>
                                    <h5>Daily Timetable (applies to all weekdays)</h5>
                                    {formData.periods.map((period, idx) => (
                                        <Row key={idx} className='mb-2 align-items-center'>
                                            <Col lg={2}>
                                                <h6>{period.periodNumber}</h6>
                                            </Col>
                                            {!period.isBreak ? (
                                                <>
                                                    <Col lg={3}>
                                                        <Form.Select
                                                            value={period.subjectId}
                                                            onChange={(e) => handlePeriodChange(idx, 'subjectId', e.target.value)}
                                                        >
                                                            <option value=''>Select Subject</option>
                                                            {subjectOptions.map((sub) => (
                                                                <option key={sub._id} value={sub._id}>{sub.subject_details.subject_name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col lg={3}>
                                                        <Form.Select
                                                            value={period.teacherId}
                                                            onChange={(e) => handlePeriodChange(idx, 'teacherId', e.target.value)}
                                                        >
                                                            <option value=''>Select Teacher</option>
                                                            {teacherOptions.map((t) => (
                                                                <option key={t._id} value={t._id}>{t.employee_name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col lg={2}>
                                                        <Form.Control
                                                            type='time'
                                                            value={period.startTime}
                                                            onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                                                        />
                                                    </Col>
                                                    <Col lg={2}>
                                                        <Form.Control
                                                            type='time'
                                                            value={period.endTime}
                                                            onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                                                        />
                                                    </Col>
                                                </>
                                            ) : (
                                                <>
                                                    <Col lg={5}>
                                                        <h6>Lunch Break</h6>
                                                    </Col>
                                                    <Col lg={2}>
                                                        <Form.Control
                                                            type='time'
                                                            value={period.startTime}
                                                            onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                                                            disabled
                                                        />
                                                    </Col>
                                                    <Col lg={2}>
                                                        <Form.Control
                                                            type='time'
                                                            value={period.endTime}
                                                            onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                                                            disabled
                                                        />
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    ))}
                                </div>
                            )}

                            {hasSubmitAccess && (
                                <Button className='btn btn-primary' onClick={handleSubmit}>Submit</Button>
                            )}
                        </Form>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(TimetablePage), { ssr: false });

