"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect } from "react-bootstrap";
import axios from "axios";

const RoutineCheckUp = () => {
  const [data, setData] = useState([]); // Routine Checkup Records
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [formValues, setFormValues] = useState({}); // Form values for adding/editing
  const [editMode, setEditMode] = useState(false); // Toggle edit mode
  const [doctors, setDoctors] = useState([]); // Doctors list for dropdown

  const baseUrl = "https://erp-backend-fy3n.onrender.com/api/routine-checkups";
  const doctorUrl = "https://erp-backend-fy3n.onrender.com/api/doctors";

  // Table columns configuration
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Date", selector: (row) => (row.date ? new Date(row.date).toLocaleDateString() : "N/A"), sortable: true },
    { name: "Doctor Name", selector: (row) => row.doctor?.doctor_name || "N/A", sortable: true },
    { name: "Checkup For", selector: (row) => row.check_up_for || "N/A", sortable: true },
    { name: "Remarks", selector: (row) => row.remark || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch Routine Checkup records
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(baseUrl);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Doctors for dropdown
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(doctorUrl);
      setDoctors(response.data.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctor options.");
    }
  };

  // Add or Edit entry
  const handleSubmit = async () => {
    if (formValues.date && formValues.doctor_name && formValues.check_up_for) {
      try {
        const payload = {
          ...formValues,
          doctor: { _id: formValues.doctor?._id, doctor_name: formValues.doctor?.doctor_name },
        };
        if (editMode) {
          // Update existing record
          await axios.put(`${baseUrl}/${formValues._id}`, payload);
        } else {
          // Add new record
          await axios.post(baseUrl, payload);
        }
        fetchData(); // Refresh data
        setFormValues({});
        setShowAddForm(false);
        setEditMode(false);
      } catch (error) {
        console.error("Error submitting data:", error);
        setError("Failed to submit data. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  // Edit entry
  const handleEdit = (row) => {
    setFormValues(row);
    setShowAddForm(true);
    setEditMode(true);
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${baseUrl}/${id}`);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchDoctors();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          {showAddForm ? "Close Form" : "Add Routine Checkup"}
        </Button>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Today Date</FormLabel>
                <FormControl
                  type="date"
                  value={formValues.date || ""}
                  onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Doctor Name</FormLabel>
                <FormSelect
                  value={formValues.doctor?._id || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      doctor: doctors.find((doc) => doc._id === e.target.value),
                    })
                  }
                >
                  <option value="">Select</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.doctor_name}
                    </option>
                  ))}
                </FormSelect>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Checkup For</FormLabel>
                <FormSelect
                  value={formValues.check_up_for || ""}
                  onChange={(e) => setFormValues({ ...formValues, check_up_for: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Staff">Staff</option>
                  <option value="Student">Student</option>
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel>Remarks</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Remarks"
                  value={formValues.remark || ""}
                  onChange={(e) => setFormValues({ ...formValues, remark: e.target.value })}
                />
              </Col>
            </Row>
            <Button className="mt-3" onClick={handleSubmit}>
              {editMode ? "Update" : "Submit"}
            </Button>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2>Routine Checkup Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(RoutineCheckUp), { ssr: false });
