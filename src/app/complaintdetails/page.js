"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewComplaint, deleteComplaintById, getAllComplaints, updateComplaintById, } from "@/Services";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import usePagePermission from "@/hooks/usePagePermission";
import { copyContent, printContent } from "../utils";

const Complaint = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    subject: "",
    complaintDetail: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints();
      setData(res.data || []);
    } catch {
      toast.error("Failed to fetch complaints");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!newComplaint.name.trim()) newErrors.name = "Name is required.";
    if (!newComplaint.fatherName.trim()) newErrors.fatherName = "Father Name is required.";
    if (!newComplaint.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(newComplaint.mobile)) {
      newErrors.mobile = "Enter valid 10-digit mobile number.";
    }
    if (!newComplaint.subject.trim()) newErrors.subject = "Subject is required.";
    if (!newComplaint.complaintDetail.trim()) newErrors.complaintDetail = "Message is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setNewComplaint({ ...newComplaint, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.warn("Please fix the errors in the form.");
      return;
    }

    try {
      if (editingId) {
        await updateComplaintById(editingId, newComplaint);
        toast.success("Complaint updated successfully!");
      } else {
        await addNewComplaint(newComplaint);
        toast.success("Complaint submitted successfully!");
      }

      fetchComplaints();
      setShowAddForm(false);
      setEditingId(null);
      setNewComplaint({
        name: "",
        fatherName: "",
        mobile: "",
        subject: "",
        complaintDetail: "",
      });
    } catch (error) {
      toast.error("Failed to submit complaint.");
    }
  };

  const handleEdit = (row) => {
    setNewComplaint(row);
    setEditingId(row._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await deleteComplaintById(id);
      toast.success("Complaint deleted.");
      fetchComplaints();
    } catch {
      toast.error("Failed to delete complaint.");
    }
  };

  const columns = [
    { name: "#", selector: (_, index) => index + 1, width: "80px", sortable: false },
    { name: "Name", selector: (row) => row.name || "N/A", sortable: true },
    { name: "Father Name", selector: (row) => row.fatherName || "N/A", sortable: true },
    { name: "Mobile", selector: (row) => row.mobile || "N/A", sortable: true },
    { name: "Subject", selector: (row) => row.subject || "N/A", sortable: true },
    { name: "Complaint Message", selector: (row) => row.complaintDetail || "N/A", sortable: true },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
      sortable: false
    },
  ].filter(Boolean);

  const handleCopy = () => {
    const headers = ["#", "Name", "Father Name", "Mobile", "Subject", "Message"];
    const rows = data?.map((row, index) => (
      [index + 1, row.name || "N/A", row.fatherName || "N/A", row.mobile || "N/A", row.subject || "N/A", row.complaintDetail || "N/A"].join('\t')
    ))
    copyContent(headers,rows)
  }
  const handlePrint = () => {
    const headers = [["#", "Name", "Father Name", "Mobile", "Subject", "Message"]];
    const rows = data?.map((row, index) => (
      [index + 1, row.name || "N/A", row.fatherName || "N/A", row.mobile || "N/A", row.subject || "N/A", row.complaintDetail || "N/A"]
    ))
    printContent(headers,rows)
  }


  const breadcrumbItems = [{ label: "Complaint Details", link: "/complaints" }];

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
            <Button onClick={() => { setShowAddForm(true); setEditingId(null); setNewComplaint({ name: "", fatherName: "", mobile: "", subject: "", complaintDetail: "" }); }} className="btn-add mb-3">
              <CgAddR /> Add Complaint
            </Button>

          )}
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit Complaint" : "Add New Complaint"}</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      isInvalid={!!errors.name}
                    />
                    <FormControl.Feedback type="invalid">{errors.name}</FormControl.Feedback>
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Father Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.fatherName}
                      onChange={(e) => handleInputChange("fatherName", e.target.value)}
                      isInvalid={!!errors.fatherName}
                    />
                    <FormControl.Feedback type="invalid">{errors.fatherName}</FormControl.Feedback>
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Mobile<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      isInvalid={!!errors.mobile}
                    />
                    <FormControl.Feedback type="invalid">{errors.mobile}</FormControl.Feedback>
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">Subject<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      isInvalid={!!errors.subject}
                    />
                    <FormControl.Feedback type="invalid">{errors.subject}</FormControl.Feedback>
                  </Col>

                  <Col lg={12}>
                    <FormLabel className="labelForm">Complaint Detail / Message<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      as="textarea"
                      rows={3}
                      value={newComplaint.complaintDetail}
                      onChange={(e) => handleInputChange("complaintDetail", e.target.value)}
                      isInvalid={!!errors.complaintDetail}
                    />
                    <FormControl.Feedback type="invalid">{errors.complaintDetail}</FormControl.Feedback>
                  </Col>
                </Row>

                <Button type="submit" className="btn btn-primary">
                  {editingId ? "Update Complaint" : "Submit Complaint"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Complaint Records</h2>
            <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint}/>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Complaint), { ssr: false });
