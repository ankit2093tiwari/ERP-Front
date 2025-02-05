"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const Complaint = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    studentDetail: "",
    classSection: "",
    complaintDate: "",
    subject: "",
    complaintDetail: "",
    replyMessage: "",
    replyBy: "",
  });

  // Static data for the table
  const data = [
    {
      id: 1,
      studentDetail: "John Doe",
      classSection: "10A",
      complaintDate: "2025-02-01",
      subject: "Disruptive behavior",
      complaintDetail: "Disrupting class during lecture.",
      replyMessage: "Student warned.",
      replyBy: "Mr. Smith",
    },
    {
      id: 2,
      studentDetail: "Jane Doe",
      classSection: "12B",
      complaintDate: "2025-02-02",
      subject: "Late submission",
      complaintDetail: "Assignment submitted late.",
      replyMessage: "Warning issued.",
      replyBy: "Ms. Johnson",
    },
  ];

  const columns = [
    { name: "#", selector: (row) => row.id, sortable: true, width: "80px" },
    { name: "Student Details", selector: (row) => row.studentDetail, sortable: false },
    { name: "Class Section", selector: (row) => row.classSection, sortable: false },
    { name: "Complaint Date", selector: (row) => row.complaintDate, sortable: false },
    { name: "Subject", selector: (row) => row.subject, sortable: false },
    { name: "Complaint Details", selector: (row) => row.complaintDetail, sortable: false },
    { name: "Reply Message", selector: (row) => row.replyMessage, sortable: false },
    { name: "Reply By", selector: (row) => row.replyBy, sortable: false },
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
        <Breadcrumb.Item href="/complaints">Complaints</Breadcrumb.Item>
        <Breadcrumb.Item active>Complaint Records</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mt-1 mb-1">
        <Col>
          <Button onClick={() => setShowAddForm(true)} className="btn btn-primary mb-4">
            <CgAddR /> Add Complaint
          </Button>

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Complaint</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Student Details</FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.studentDetail}
                      onChange={(e) =>
                        setNewComplaint({ ...newComplaint, studentDetail: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Class Section</FormLabel>
                    <FormControl
                      type="text"
                      value={newComplaint.classSection}
                      onChange={(e) =>
                        setNewComplaint({ ...newComplaint, classSection: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Complaint Date</FormLabel>
                    <FormControl
                      type="date"
                      value={newComplaint.complaintDate}
                      onChange={(e) =>
                        setNewComplaint({ ...newComplaint, complaintDate: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={() => setShowAddForm(false)} className="btn btn-primary">
                  Add Complaint
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Complaint Records</h2>
            <Table columns={columns} data={data} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(Complaint), { ssr: false });
