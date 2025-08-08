"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";
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
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import {
  addNewRoutineCheckup,
  deleteRoutineCheckupById,
  getAllDoctors,
  getAllRoutineCheckups,
  updateRoutineCheckupById,
  getAllStudents,
  getAllEmployee,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const RoutineCheckUp = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCheckupId, setCurrentCheckupId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [nextFormNo, setNextFormNo] = useState(1);
  const [formData, setFormData] = useState({
    form_no: "",
    remark: "",
    check_up_for: "",
    doctor: "",
    person: "", // New field to store selected student/staff
  });
  const [formErrors, setFormErrors] = useState({});

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
      selector: (row) => row.doctor?.doctor_name || "N/A",
      sortable:true,
    },
    {
      name: "Check-Up For",
      selector: (row) => row.check_up_for || "N/A",
      sortable:true,
    },
    {
      name: "Person",
      selector: (row) => {
        if (row.check_up_for === "student") {
          return row.student?.first_name || "N/A";
        } else if (row.check_up_for === "staff") {
          return row.staff?.employee_name || "N/A";
        }
        return "N/A";
      },
      sortable:true,
    },
    {
      name: "Remarks",
      selector: (row) => row.remark || "N/A",
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
    fetchDoctors();
    fetchStudents();
    fetchStaffs();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllRoutineCheckups();
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
      const res = await getAllDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      setError("Failed to fetch doctors.");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data || []);
    } catch (err) {
      setError("Failed to fetch students.");
    }
  };

  const fetchStaffs = async () => {
    try {
      const res = await getAllEmployee();
      setStaffs(res.data || []);
    } catch (err) {
      setError("Failed to fetch staff.");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.check_up_for) errors.check_up_for = "Please select check-up type.";
    if (!formData.doctor) errors.doctor = "Please select doctor.";
    if (!formData.person) errors.person = "Please select person.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));

    // Reset person selection when check_up_for changes
    if (field === "check_up_for") {
      setFormData(prev => ({ ...prev, person: "" }));
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentCheckupId(null);
    setFormData({
      form_no: nextFormNo.toString(),
      remark: "",
      check_up_for: "",
      doctor: "",
      person: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentCheckupId(item._id);
    setFormData({
      form_no: item.form_no,
      remark: item.remark,
      check_up_for: item.check_up_for,
      doctor: item.doctor?._id || "",
      person: item.student?._id || item.staff?._id || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        form_no: formData.form_no,
        remark: formData.remark,
        check_up_for: formData.check_up_for,
        doctor: formData.doctor,
        [formData.check_up_for === "student" ? "student" : "staff"]: formData.person
      };

      if (isEditing) {
        await updateRoutineCheckupById(currentCheckupId, payload);
        toast.success("Check-up updated successfully");
      } else {
        await addNewRoutineCheckup(payload);
        toast.success("Routine Check-Up added successfully");
      }
      fetchData();
      setIsFormOpen(false);
    } catch (err) {
      toast.error(`Failed to ${isEditing ? "update" : "add"} check-up`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this check-up?")) {
      try {
        await deleteRoutineCheckupById(id);
        toast.success("Check-up deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete check-up");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Date", "Check-Up For", "Person", "Doctor", "Remarks"]];
    const rows = data.map((r, i) => [
      i + 1,
      new Date(r.date).toLocaleDateString(),
      r.check_up_for,
      r.check_up_for === "student"
        ? r.student?.first_name || "N/A"
        : r.staff?.employee_name || "N/A",
      r.doctor?.doctor_name || "N/A",
      r.remark || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Check-Up For", "Person", "Doctor", "Remarks"];
    const rows = data.map((r, i) =>
      `${i + 1}\t${new Date(r.date).toLocaleDateString()}\t${r.check_up_for}\t${r.check_up_for === "student"
        ? r.student?.first_name || "N/A"
        : r.staff?.employee_name || "N/A"
      }\t${r.doctor?.doctor_name || "N/A"}\t${r.remark || "N/A"}`
    );
    copyContent(headers, rows);
  };

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
            <Button onClick={handleAddClick} className="btn-add">
              <CgAddR /> Add Routine Check-Up
            </Button>
          )}

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? "Edit Routine Check-Up" : "Add New Routine Check-Up"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormErrors({});
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Form No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      value={formData.form_no}
                      readOnly
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Check-Up For<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.check_up_for}
                      onChange={(e) => handleChange("check_up_for", e.target.value)}
                      isInvalid={!!formErrors.check_up_for}
                    >
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.check_up_for}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Doctor<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.doctor}
                      onChange={(e) => handleChange("doctor", e.target.value)}
                      isInvalid={!!formErrors.doctor}
                    >
                      <option value="">Select</option>
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.doctor_name}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.doctor}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>
                      {formData.check_up_for === "student"
                        ? "Student"
                        : formData.check_up_for === "staff"
                          ? "Staff"
                          : "Person"}
                      <span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      value={formData.person}
                      onChange={(e) => handleChange("person", e.target.value)}
                      isInvalid={!!formErrors.person}
                      disabled={!formData.check_up_for}
                    >
                      <option value="">Select {formData.check_up_for || "person"}</option>
                      {formData.check_up_for === "student" && students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {`${s.first_name} ${s.last_name || ""} (${s.registration_id})`}
                        </option>
                      ))}
                      {formData.check_up_for === "staff" && staffs.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.employee_name}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.person}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Remarks"
                      value={formData.remark}
                      onChange={(e) => handleChange("remark", e.target.value)}
                    />
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleSubmit}>
                    {isEditing ? "Update Check-Up" : "Add Check-Up"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
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