"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Alert,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewRoutineCheckup, deleteRoutineCheckupById, getAllDoctors, getAllRoutineCheckups, updateRoutineCheckupById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RoutineCheckUp = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [nextFormNo, setNextFormNo] = useState(1);
  const [formData, setFormData] = useState({
    form_no: "",
    remark: "",
    check_up_for: "",
    doctor: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [editFormData, setEditFormData] = useState({
    form_no: "",
    remark: "",
    check_up_for: "",
    doctor: "",
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.check_up_for) errors.check_up_for = "Please select check-up type.";
    if (!formData.doctor) errors.doctor = "Please select doctor.";
    return errors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "80px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      name: "Doctor Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.doctor}
            onChange={(e) =>
              setEditFormData({ ...editFormData, doctor: e.target.value })
            }
          >
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.doctor_name}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.doctor?.doctor_name || "N/A"
        ),
    },
    {
      name: "Check-Up For",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.check_up_for}
            onChange={(e) =>
              setEditFormData({ ...editFormData, check_up_for: e.target.value })
            }
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </FormSelect>
        ) : (
          row.check_up_for || "N/A"
        ),
    },
    {
      name: "Remarks",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.remark}
            onChange={(e) =>
              setEditFormData({ ...editFormData, remark: e.target.value })
            }
          />
        ) : (
          row.remark || "N/A"
        ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) =>
        editingId === row._id ? (
          <>
            <button className="editButton" onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </button>
            <button
              className="editButton btn-danger"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="editButton" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
            <button
              className="editButton btn-danger"
              onClick={() => handleDelete(row._id)}
            >
              <FaTrashAlt />
            </button>
          </>
        ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllRoutineCheckups()
      const sorted = res.data.sort((a, b) => +a.form_no - +b.form_no);
      setData(sorted || []);
      setNextFormNo(sorted.length ? +sorted[sorted.length - 1].form_no + 1 : 1);
    } catch (err) {
      setError("Failed to fetch routine check-ups.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await getAllDoctors()
      setDoctors(res.data || []);
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      form_no: item.form_no,
      remark: item.remark,
      check_up_for: item.check_up_for,
      doctor: item.doctor?._id || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await updateRoutineCheckupById(id, editFormData)
      toast.success("Check-up updated");
      fetchData();
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteRoutineCheckupById(id)
        toast.success("Deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleAdd = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        ...formData,
        form_no: nextFormNo.toString(),
      };
      await addNewRoutineCheckup(payload)
      toast.success("Routine Check-Up Added");
      fetchData();
      setFormData({ form_no: "", remark: "", check_up_for: "", doctor: "" });
      setFormErrors({});
      setIsPopoverOpen(false);
    } catch (err) {
      toast.error("Failed to add");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Date", "Check-Up For", "Doctor", "Remarks"]];
    const rows = data.map((r, i) => [
      i + 1,
      new Date(r.date).toLocaleDateString(),
      r.check_up_for,
      r.doctor?.doctor_name,
      r.remark || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Check-Up For", "Doctor", "Remarks"];
    const rows = data.map((r, i) =>
      `${i + 1}\t${new Date(r.date).toLocaleDateString()}\t${r.check_up_for}\t${r.doctor?.doctor_name}\t${r.remark || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
    fetchDoctors();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Routine Check-Up", link: "null" },
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
          {error && <Alert variant="danger">{error}</Alert>}

          {hasSubmitAccess && (
            <Button
              onClick={() => {
                setIsPopoverOpen(true);
                setFormData((prev) => ({ ...prev, form_no: nextFormNo.toString() }));
              }}
              className="btn-add"
            >
              <CgAddR /> Add Routine Check-Up
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Routine Check-Up</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormErrors({});
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Form No<span className="text-danger">*</span></FormLabel>
                    <FormControl value={formData.form_no} readOnly />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Check-Up For<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.check_up_for}
                      onChange={(e) => handleChange("check_up_for", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                    </FormSelect>
                    {formErrors.check_up_for && (
                      <small className="text-danger">{formErrors.check_up_for}</small>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Doctor<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.doctor}
                      onChange={(e) => handleChange("doctor", e.target.value)}
                    >
                      <option value="">Select</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.doctor_name}
                        </option>
                      ))}
                    </FormSelect>
                    {formErrors.doctor && (
                      <small className="text-danger">{formErrors.doctor}</small>
                    )}
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Remarks"
                      value={formData.remark}
                      onChange={(e) => handleChange("remark", e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Routine Check-Up
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Routine Check-Up Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={data}
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

export default dynamic(() => Promise.resolve(RoutineCheckUp), { ssr: false });