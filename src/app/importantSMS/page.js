"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { Container, Row, Col, Form, Button, FormControl, FormSelect } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { addNewImportantSMS, deleteSMSById, getAllImportantSMS, updateSMSById } from "@/Services";
import { copyContent, printContent } from "../utils";
import usePagePermission from "@/hooks/usePagePermission";
import { CgAddR } from "react-icons/cg";

const ImportantSMS = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false)
  const todayDate = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    entryDate: todayDate,
    sendBy: '',
    sendTo: '',
    detail: '',
    status: '',
  });

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);


  const fetchImportantSMS = async () => {
    try {
      const res = await getAllImportantSMS()
      setData(res?.data)
    } catch (error) {
      console.error('failed to fetch SMS', error)
    }
  }
  useEffect(() => {
    fetchImportantSMS()
  }, [])
  const validate = () => {
    const newErrors = {};

    if (!formData.entryDate) newErrors.entryDate = "Entry date is required";
    if (!formData.sendBy) newErrors.sendBy = "Sender is required";
    if (!formData.sendTo) newErrors.sendTo = "Recipient is required";
    if (!formData.detail) newErrors.detail = "Detail is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear the field's error on change
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.warn("Please fill all required fields");
      return;
    }

    if (editingId !== null) {
      await updateSMSById(editingId, formData)
      fetchImportantSMS()
      toast.success("Record updated successfully");
      setEditingId(null);
    } else {
      await addNewImportantSMS(formData)
      fetchImportantSMS()
      toast.success("Record added successfully");
    }

    resetForm()
    setErrors({});
  };
  const resetForm = () => {
    setFormData({ entryDate: todayDate, sendBy: '', sendTo: '', detail: '', status: '' })
    setEditingId(null);
  }
  const handleEdit = (id) => {
    const row = data.find(d => d._id === id);
    if (row) {
      const formattedData = {
        ...row,
        entryDate: row.entryDate ? row.entryDate.slice(0, 10) : '', // format for <input type="date">
      };
      setFormData(formattedData);
      setEditingId(id);
    }
    setIsFormOpen(true);
  };


  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteSMSById(id);
      fetchImportantSMS()
      toast.success("Record deleted");
    }
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "60px", sortable: false },
    { name: "Entry Date", selector: row => new Date(row.entryDate).toLocaleDateString(), sortable: true },
    { name: "Send By", selector: row => row.sendBy || "N/A", sortable: true },
    { name: "Send To", selector: row => row.sendTo || "N/A", sortable: true },
    { name: "Details", selector: row => row.detail || "N/A", sortable: true },
    { name: "Status", selector: row => row.status || "N/A", sortable: true },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row._id)}><FaEdit /></Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
        </div>
      ),
    },
  ].filter(Boolean);
  const handleCopy = () => {
    const headers = ["#", "EntryDate", "SendBy", "SendTo", "Details", "Status"]
    const rows = data?.map((row, index) => (
      [index + 1, new Date(row.entryDate).toLocaleDateString() || "N/A", row.sendBy || "N/A", row.sendTo || "N/A", row.detail || "N/A", row.status || "N/A"].join('\t')
    ))
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [["#", "EntryDate", "SendBy", "SendTo", "Details", "Status"]]
    const rows = data?.map((row, index) => (
      [index + 1, new Date(row.entryDate).toLocaleDateString() || "N/A", row.sendBy || "N/A", row.sendTo || "N/A", row.detail || "N/A", row.status || "N/A"]
    ))
    printContent(headers, rows)
  }

  const breadcrumbItems = [{ label: "Important SMS", link: "/importantSMS" }];

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
            <Button onClick={() => setIsFormOpen(true)} className="btn-add">
              <CgAddR /> Add New SMS
            </Button>
          )}
          {
            isFormOpen && (
              <div className="cover-sheet">
                <div className="studentHeading">
                  <h2>Important SMS Details</h2>
                  <button
                    className="closeForm"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm()
                    }}
                  >
                    X
                  </button>
                </div>
                <Form className="formSheet" onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="labelForm">Entry Date<span className="text-danger">*</span></Form.Label>
                        <FormControl type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} isInvalid={!!errors.entryDate} />
                        <Form.Control.Feedback type="invalid">{errors.entryDate}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="labelForm">Send By<span className="text-danger">*</span></Form.Label>
                        <FormControl name="sendBy" value={formData.sendBy} onChange={handleChange} isInvalid={!!errors.sendBy} />
                        <Form.Control.Feedback type="invalid">{errors.sendBy}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="labelForm">Send To<span className="text-danger">*</span></Form.Label>
                        <FormControl name="sendTo" value={formData.sendTo} onChange={handleChange} isInvalid={!!errors.sendTo} />
                        <Form.Control.Feedback type="invalid">{errors.sendTo}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="labelForm">SMS Status<span className="text-danger">*</span></Form.Label>
                        <FormSelect name="status" value={formData.status} onChange={handleChange} isInvalid={!!errors.status}>
                          <option value="">Select</option>
                          <option value="active">Active (currently shown/sent)</option>
                          <option value="inActive">Inactive (archived/ignored)</option>
                        </FormSelect>

                        <Form.Control.Feedback type="invalid">{errors.status}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="labelForm">Details<span className="text-danger">*</span></Form.Label>
                        <FormControl as="textarea" rows={2} name="detail" value={formData.detail} onChange={handleChange} isInvalid={!!errors.detail} />
                        <Form.Control.Feedback type="invalid">{errors.detail}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col md={4}>
                      <Button type="submit" variant="success">
                        {editingId !== null ? "Update" : "Submit"}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            )
          }
          <div className="tableSheet">
            <h2>Important SMS Details</h2>
            <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ImportantSMS), { ssr: false });
