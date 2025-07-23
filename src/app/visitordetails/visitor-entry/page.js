'use client';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import BreadcrumbComp from '@/app/component/Breadcrumb';
import DataTable from '@/app/component/DataTable';
import { copyContent, printContent } from '@/app/utils';
import {
    addNewVisitorEntry,
    getAllVisitorEntries,
    deleteVisitorEntryById,
    updateVisitorEntryById,
    getAllBooks
} from '@/Services';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import usePagePermission from '@/hooks/usePagePermission';
import { CgAddR } from 'react-icons/cg';
import { boolean } from 'yup';

const VisitorEntryPage = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();
    const [visitorList, setVisitorList] = useState([]);
    const [editId, setEditId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '',
        mobileNo: '',
        address: '',
        purpose: '',
        personToMeet: '',
        date: today,
        inTime: '',
        outTime: '',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const res = await getAllVisitorEntries();
            setVisitorList(res?.data || []);
        } catch {
            toast.error('Failed to fetch visitor entries');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.mobileNo.match(/^\d{10}$/)) errors.mobileNo = 'Enter valid 10-digit mobile no';
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.purpose.trim()) errors.purpose = 'Purpose is required';
        if (!formData.personToMeet.trim()) errors.personToMeet = 'This field is required';
        if (!formData.inTime) errors.inTime = 'In time is required';
        if (!formData.date) errors.date = 'Date is required';

        // Validate time comparison
        if (formData.inTime && formData.outTime) {
            const inDate = new Date(`1970-01-01T${formData.inTime}`);
            const outDate = new Date(`1970-01-01T${formData.outTime}`);
            if (inDate >= outDate) {
                errors.inTime = 'In time should be earlier than out time';
                errors.outTime = 'Out time should be later than in time';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const resetForm = () => {
        setFormData({
            name: '',
            mobileNo: '',
            purpose: '',
            address: '',
            personToMeet: '',
            inTime: '',
            outTime: '',
            date: today,
        });
        setEditId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.warn('Please fix validation errors');
            return;
        }

        try {
            if (editId) {
                await updateVisitorEntryById(editId, formData);
                toast.success('Visitor entry updated');
            } else {
                await addNewVisitorEntry(formData);
                toast.success('Visitor entry added');
            }
            resetForm();
            fetchVisitors();
        } catch {
            toast.error('Failed to submit visitor entry');
        }
    };

    const handleEdit = (row) => {
        setEditId(row._id);
        setFormData({
            name: row.name,
            mobileNo: row.mobileNo,
            address: row.address,
            purpose: row.purpose,
            personToMeet: row.personToMeet,
            inTime: row.inTime,
            outTime: row.outTime || '',
            date: row.date ? row.date.substring(0, 10) : today,
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await deleteVisitorEntryById(id);
            toast.success('Visitor entry deleted');
            fetchVisitors();
        } catch {
            toast.error('Failed to delete visitor entry');
        }
    };

    const columns = [
        { name: '#', selector: (_, i) => i + 1, width: '50px' },
        { name: 'Name', selector: (row) => row.name, sortable: true },
        { name: 'Mobile No.', selector: (row) => row.mobileNo, sortable: true },
        { name: 'Purpose', selector: (row) => row.purpose },
        { name: 'Person to Meet', selector: (row) => row.personToMeet, sortable: true },
        { name: 'Date', selector: (row) => row.date?.substring(0, 10) || '—' },
        { name: 'In Time', selector: (row) => row.inTime, sortable: true },
        { name: 'Out Time', selector: (row) => row.outTime || '—' },
        hasEditAccess && {
            name: 'Actions',
            cell: (row) => (
                <>
                    <Button size="sm" variant="success" onClick={() => handleEdit(row)} className="me-2">
                        <FaEdit />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
                        <FaTrashAlt />
                    </Button>
                </>
            ),
            sortable: false
        },
    ].filter(Boolean);

    const handleCopy = () => {
        const rows = visitorList.map((v, i) => `${i + 1}\t${v.name}\t${v.mobileNo}\t${v.purpose}`);
        copyContent(['#', 'Name', 'Mobile No.', 'Purpose'], rows);
    };

    const handlePrint = () => {
        const rows = visitorList.map((v, i) => [i + 1, v.name, v.mobileNo, v.purpose]);
        printContent([['#', 'Name', 'Mobile No.', 'Purpose']], rows);
    };

    const breadcrumbItems = [
        { label: 'Visitor Details', link: '/visitordetails/all-module' },
        { label: 'Visitor Entry', link: null },
    ];


    return (
        <>
            <div className="breadcrumbSheet">
                <Container>
                    <Row className="mt-1 mb-1">
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>

            <section>
                <Container>
                    {hasSubmitAccess && (
                        <Button onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }} className="btn-add">
                            <CgAddR /> Add New Entry
                        </Button>
                    )}

                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Visitor Entry</h2>
                                <button className="closeForm" onClick={resetForm}>X</button>
                            </div>

                            <Form className="formSheet mb-4">
                                <Row className="mb-2">
                                    <Col lg={6}>
                                        <Form.Label className='labelForm'>Name<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.name}
                                            placeholder='Enter Visitor Name'
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Label className='labelForm'>Person to Meet<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            name="personToMeet"
                                            value={formData.personToMeet}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.personToMeet}
                                            placeholder='Whom to Meet'
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.personToMeet}</Form.Control.Feedback>
                                    </Col>
                                </Row>

                                <Row className="mb-2">
                                    <Col lg={6}>
                                        <Form.Label className='labelForm'>Mobile No.<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            name="mobileNo"
                                            value={formData.mobileNo}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.mobileNo}
                                            placeholder='Enter Visitor Mobile No.'
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.mobileNo}</Form.Control.Feedback>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Label className='labelForm'>Address<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            name="address"
                                            placeholder='Enter address'
                                            value={formData.address}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.address}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
                                    </Col>
                                </Row>

                                <Row className='mb-2'>
                                    <Col lg={6}>
                                        <Form.Label className='labelForm'>Date<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.date}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.date}</Form.Control.Feedback>
                                    </Col>
                                    <Col lg={3}>
                                        <Form.Label className='labelForm'>In Time<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="inTime"
                                            value={formData.inTime}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.inTime}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.inTime}</Form.Control.Feedback>
                                    </Col>
                                    <Col lg={3}>
                                        <Form.Label className='labelForm'>Out Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            name="outTime"
                                            value={formData.outTime}
                                            onChange={handleChange}
                                        />
                                    </Col>
                                </Row>

                                <Row className='mb-2'>
                                    <Col>
                                        <Form.Label className='labelForm'>Purpose<span className='text-danger'>*</span></Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            isInvalid={!!formErrors.purpose}
                                        />
                                        <Form.Control.Feedback type="invalid">{formErrors.purpose}</Form.Control.Feedback>
                                    </Col>
                                </Row>

                                {hasSubmitAccess && (
                                    <Button variant="success" onClick={handleSubmit}>
                                        {editId ? 'Update' : 'Submit'}
                                    </Button>
                                )}
                            </Form>
                        </div>
                    )}

                    <div className='cover-sheet'>
                        <div className="tableSheet">
                            <h2>Entry Records</h2>
                            <DataTable
                                columns={columns}
                                data={visitorList}
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

export default dynamic(() => Promise.resolve(VisitorEntryPage), { ssr: false });
