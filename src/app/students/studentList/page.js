"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Form, FormLabel, FormGroup, FormControl, FormSelect, Button } from 'react-bootstrap';
import axios from "axios";
import { CgAddR } from 'react-icons/cg';


const Studentlist = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "https://erp-backend-fy3n.onrender.com/api/";

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "Registration ID", selector: (row) => row.registration_id || "N/A" },
    { name: "First Name", selector: (row) => row.first_name || "N/A" },
    { name: "Last Name", selector: (row) => row.last_name || "N/A" },
    { name: "Father's Name", selector: (row) => row.father_name || "N/A" },
    { name: "Gender", selector: (row) => row.gender || "N/A" },
    { name: "Phone No", selector: (row) => row.phone_no || "N/A" },
    { name: "Date of Birth", selector: (row) => new Date(row.date_of_birth).toLocaleDateString() || "N/A" },
    { name: "Religion", selector: (row) => row.religion || "N/A" },
    { name: "Aadhar No", selector: (row) => row.aadhar_card_no || "N/A" },
    { name: "Last School", selector: (row) => row.last_school_attended || "N/A" },
    { name: "Country", selector: (row) => row.residence_address?.country || "N/A" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}students`);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    console.log("Edit student:", id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${BASE_URL}deleteStudent?id=${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.vehicle}>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/transport/all-module">
              Students
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Student List</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
    <a href="/students/add-new-student" id="submit" type='button'>
    <CgAddR/> Add New Student
  </a>
  <a href="/students/update-student" id="submit" type='button'>
    <CgAddR/> Update Student
  </a>
<Row>
  <Col lg={12}>
    <div className="tableSheet">
      <h2>Student Records</h2>
      {/* {loading && <p>Loading...</p>} */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && <Table columns={columns} data={data} />}
    </div>
    </Col>
    </Row>
    </Container>
  );
};

export default Studentlist;