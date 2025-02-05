"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const Appointment = () => {
  const [showAddForm, setShowAddForm] = useState(false);
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

  // Static data for the table
  const data = [
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
    {
      id: 2,
      student: "Jane Doe",
      class: "12th",
      personalName: "Jane",
      whomeToMeet: "Dr. Lee",
      timeDuration: "45 minutes",
      action: "Check-up",
      emailId: "jane@example.com",
      purpose: "Routine check-up",
      remark: "N/A",
    },
  ];

  const columns = [
    { name: "#", selector: (row) => row.id, sortable: true, width: "80px" },
    { name: "Student", selector: (row) => row.student, sortable: false },
    { name: "Class", selector: (row) => row.class, sortable: false },
    { name: "Personal Name", selector: (row) => row.personalName, sortable: false },
    { name: "Whom to Meet", selector: (row) => row.whomeToMeet, sortable: false },
    { name: "Time Duration", selector: (row) => row.timeDuration, sortable: false },
    { name: "Action", selector: (row) => row.action, sortable: false },
    { name: "Email Id", selector: (row) => row.emailId, sortable: false },
    { name: "Purpose", selector: (row) => row.purpose, sortable: false },
    { name: "Remark", selector: (row) => row.remark, sortable: false },
  ];

  const handleEdit = (id) => {
    const item = data.find((row) => row.id === id);
    const updatedName = prompt("Enter new name:", item.name);

    // Updating logic (for static data in this case, you can directly modify the state if needed)
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      // Remove item from static data
    }
  };

  return (
    <Container className={styles.formContainer}>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/appointments">Appointments</Breadcrumb.Item>
        <Breadcrumb.Item active>Appointment Records</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mt-1 mb-1">
        <Col>
          <Button onClick={() => setShowAddForm(true)} className="btn btn-primary mb-4">
            <CgAddR /> Add Appointment
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Appointment</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Student</FormLabel>
                    <FormControl
                      type="text"
                      value={newAppointment.student}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, student: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Class</FormLabel>
                    <FormControl
                      type="text"
                      value={newAppointment.class}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, class: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Personal Name</FormLabel>
                    <FormControl
                      type="text"
                      value={newAppointment.personalName}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, personalName: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={() => setShowAddForm(false)} className="btn btn-primary">
                  Add Appointment
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Appointment Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Appointment), { ssr: false });
