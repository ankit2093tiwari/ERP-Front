"use client";
import React, { useState } from "react";
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
  Breadcrumb,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const Appointment = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      student: "John Doe",
      class: "10th",
      personalName: "John",
      whomeToMeet: "Dr. Smith",
      timeDuration: "30 minutes",
      action: "Check-up",
      emailId: "john@example.com",
      purpose: "Routine check-up",
      remark: "None",
    },
  ]);
  const [newAppointment, setNewAppointment] = useState({
    student: "",
    class: "",
    personalName: "",
    whomeToMeet: "",
    timeDuration: "",
    action: "",
    emailId: "",
    purpose: "",
    remark: "",
  });

  const columns = [
    { name: "#", selector: (row) => row.id, sortable: true, width: "80px" },
    { name: "Student", selector: (row) => row.student, sortable: true },
    { name: "Class", selector: (row) => row.class, sortable: true },
    { name: "Personal Name", selector: (row) => row.personalName, sortable: true },
    { name: "Whom to Meet", selector: (row) => row.whomeToMeet, sortable: true },
    { name: "Time Duration", selector: (row) => row.timeDuration, sortable: true },
    { name: "Action", selector: (row) => row.action, sortable: true },
    { name: "Email Id", selector: (row) => row.emailId, sortable: true },
    { name: "Purpose", selector: (row) => row.purpose, sortable: true },
    { name: "Remark", selector: (row) => row.remark, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button className="btn-warning btn-sm" onClick={() => handleEdit(row.id)}>
            <FaEdit />
          </Button>
          <Button className="btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (id) => {
    setEditId(id);
    const item = appointments.find((row) => row.id === id);
    setNewAppointment(item);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setAppointments(appointments.filter((row) => row.id !== id));
    }
  };

  const handleSave = () => {
    if (editId) {
      setAppointments(
        appointments.map((row) => (row.id === editId ? { ...newAppointment, id: editId } : row))
      );
      setEditId(null);
    } else {
      setAppointments([...appointments, { ...newAppointment, id: appointments.length + 1 }]);
    }
    setShowAddForm(false);
  };

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp items={[{ label: "Appointment", link: "/appointment" }]} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container >
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> {editId ? "Edit Appointment" : "Add Appointment"}
          </Button>
          <Row className="mt-3 mb-3">
            <Col>


              {showAddForm && (
                <div className="cover-sheet">
                  <div className="studentHeading">
                    <h2>{editId ? "Edit Appointment" : "Add New Appointment"}</h2>
                    <button className="closeForm" onClick={() => setShowAddForm(false)}>
                      X
                    </button>
                  </div>
                  <Form className="formSheet">
                    <Row className="mb-3">
                      <Col lg={6}>
                        <FormLabel className="labelForm">Student</FormLabel>
                        <FormControl
                          type="text"
                          value={newAppointment.student}
                          onChange={(e) => setNewAppointment({ ...newAppointment, student: e.target.value })}
                        />
                      </Col>
                      <Col lg={6}>
                        <FormLabel className="labelForm">Class</FormLabel>
                        <FormControl
                          type="text"
                          value={newAppointment.class}
                          onChange={(e) => setNewAppointment({ ...newAppointment, class: e.target.value })}
                        />
                      </Col>
                    </Row>
                    <Button onClick={handleSave} className="btn btn-success">
                      <FaSave /> {editId ? "Update" : "Save"}
                    </Button>
                  </Form>
                </div>
              )}

              <div className="tableSheet">
                <h2>Appointment Records</h2>
                <Table columns={columns} data={appointments} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(Appointment), { ssr: false });