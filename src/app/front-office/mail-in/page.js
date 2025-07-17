"use client";
import React, { useEffect, useState } from 'react';
import Table from '@/app/component/DataTable';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Container, Row, Col, Form, FormLabel, FormControl, FormSelect, Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { getAllEmployee, addNewMailInRecord, getMailInRecords, updateMailInRecordById, deleteMailInRecordById } from '@/Services';
import { toast } from 'react-toastify';
import usePagePermission from '@/hooks/usePagePermission';

const MailIn = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    from: '', forWhom: '', date: '', mode: '',
    courierName: '', address: '', receiver: '', remark: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      from: '', forWhom: '', date: '', mode: '',
      courierName: '', address: '', receiver: '', remark: ''
    });
    setErrors({});
    setEditId(null);
  };

  const breadcrumbItems = [
    { label: "Front Office", link: "/front-office/all-module" },
    { label: "Mail In", link: "null" }
  ];

  const columns = [
    { name: '#', selector: (row, index) => index + 1, width: '60px' },
    { name: 'From', selector: row => row.from },
    { name: 'For Whom', selector: row => row.forWhom?.employee_name || row.forWhom },
    { name: 'Date', selector: row => new Date(row.date).toISOString().split('T')[0] },
    { name: 'Mode', selector: row => row.mode },
    { name: 'Receiver', selector: row => row.receiver?.employee_name || row.receiver },
    hasEditAccess && {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button className="me-1" size='sm' variant='success' onClick={() => handleEdit(row._id)}><FaEdit /></Button>
          <Button size='sm' variant='danger' onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
        </div>
      ),
    }
  ];

  const fetchEmployeeData = async () => {
    const response = await getAllEmployee();
    setEmployees(response.data);
  };

  const fetchMailInData = async () => {
    const response = await getMailInRecords();
    setData(response.data);
  };

  useEffect(() => {
    fetchEmployeeData();
    fetchMailInData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.date) errs.date = "Date is required";
    else if (formData.date > today) errs.date = "Date cannot be in the future";

    if (!formData.from || formData.from.trim().length < 2)
      errs.from = "Sender name must be at least 2 characters";

    if (!formData.forWhom) errs.forWhom = "Please select recipient";
    if (!formData.mode) errs.mode = "Please select mode";
    if (!formData.receiver) errs.receiver = "Please select receiver";

    if (!formData.address || formData.address.trim().length < 5)
      errs.address = "Address must be at least 5 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = { ...formData };

      if (editId) {
        await updateMailInRecordById(editId, payload);
        toast.success("Mail In record updated!");
      } else {
        await addNewMailInRecord(payload);
        toast.success("Mail In record added!");
      }

      await fetchMailInData();
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const record = data.find(item => item._id === id);
    if (record) {
      setFormData({
        from: record.from || '',
        forWhom: record.forWhom?._id || record.forWhom,
        date: record.date?.split('T')[0],
        mode: record.mode,
        courierName: record.courierName || '',
        address: record.address,
        receiver: record.receiver?._id || record.receiver,
        remark: record.remark || ''
      });
      setEditId(id);
      setShowAddForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure to delete this record?")) {
      try {
        await deleteMailInRecordById(id);
        toast.success("Record deleted.");
        fetchMailInData();
      } catch (err) {
        toast.error("Failed to delete.");
        console.error(err);
      }
    }
  };

  return (
    <>
      <div className="breadcrumbSheet position-relative">
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
              setShowAddForm(true);
            }} className="btn-add mb-2">
              <CgAddR /> New Mail
            </Button>
          )}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Edit Mail" : "New Mail"}</h2>
                <button className="closeForm" onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}>X</button>
              </div>

              <Form onSubmit={handleSubmit} className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">For Whom<span className="text-danger">*</span></FormLabel>
                    <FormSelect name="forWhom" value={formData.forWhom} onChange={handleChange} isInvalid={!!errors.forWhom}>
                      <option value="">Select</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.employee_name}</option>
                      ))}
                    </FormSelect>
                    <div className="text-danger">{errors.forWhom}</div>
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Date<span className="text-danger">*</span></FormLabel>
                    <FormControl type="date" name="date" value={formData.date} onChange={handleChange} isInvalid={!!errors.date} />
                    <div className="text-danger">{errors.date}</div>
                  </Col>


                </Row>

                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Mode<span className="text-danger">*</span></FormLabel>
                    <FormSelect name="mode" value={formData.mode} onChange={handleChange} isInvalid={!!errors.mode}>
                      <option value="">Select</option>
                      <option value="General Post">General Post</option>
                      <option value="Speed Post">Speed Post</option>
                      <option value="Courier">Courier</option>
                    </FormSelect>
                    <div className="text-danger">{errors.mode}</div>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">From<span className="text-danger">*</span></FormLabel>
                    <FormControl name="from" value={formData.from} onChange={handleChange} placeholder="Sender" isInvalid={!!errors.from} />
                    <div className="text-danger">{errors.from}</div>
                  </Col>
                </Row>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Courier Name</FormLabel>
                    <FormControl name="courierName" value={formData.courierName} onChange={handleChange} placeholder="Courier (optional)" />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Receiver<span className="text-danger">*</span></FormLabel>
                    <FormSelect name="receiver" value={formData.receiver} onChange={handleChange} isInvalid={!!errors.receiver}>
                      <option value="">Select</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.employee_name}</option>
                      ))}
                    </FormSelect>
                    <div className="text-danger">{errors.receiver}</div>
                  </Col>
                </Row>

                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Address<span className="text-danger">*</span></FormLabel>
                    <FormControl as="textarea" name="address" value={formData.address} onChange={handleChange} isInvalid={!!errors.address} />
                    <div className="text-danger">{errors.address}</div>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl as="textarea" name="remark" value={formData.remark} onChange={handleChange} />
                  </Col>
                </Row>

                <Button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                  {loading ? "Submitting..." : (editId ? "Update" : "Submit")}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Mail In Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(MailIn), { ssr: false });
