"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Button } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";


const Studentlist = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const BASE_URL = "https://erp-backend-fy3n.onrender.com/api/";

  // Fetch student data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}students`);
      const students = response.data.data || [];
      // Reverse to show newest first
      setData(students.reverse());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  // Handle Edit (Redirect to update page)
  const handleEdit = (id) => {
    router.push(`/students/update-student?id=${id}`);
  };

  // Handle Delete Operation
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}students/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        // fetchData();
        alert("Student deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "Registration ID", selector: (row) => row.registration_id || "N/A" },
    { name: "First Name", selector: (row) => row.first_name || "N/A" },
    { name: "Last Name", selector: (row) => row.last_name || "N/A" },
    { name: "Father's Name", selector: (row) => row.father_name || "N/A" },
    { name: "Gender", selector: (row) => row.gender_name || "N/A" },
    { name: "Phone No", selector: (row) => row.phone_no || "N/A" },
    { name: "Date of Birth", selector: (row) => new Date(row.date_of_birth).toLocaleDateString() || "N/A" },
    // { name: "Religion", selector: (row) => row.religion_name || "N/A" },
    { name: "Aadhar No", selector: (row) => row.aadhar_card_no || "N/A" },
    // { name: "Last School", selector: (row) => row.last_school_attended || "N/A" },
    { name: "Country", selector: (row) => row.residence_address?.country || "N/A" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {/* <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button> */}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [{ label: "students", link: "/students/all-module" }, { label: "studentList", link: "null" }]

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
        <Container className={styles.vehicle}>

          <div className="d-flex justify-content-between mb-3">
            <Button href="/students/add-new-student" className="btn-add">
              <CgAddR /> Add New Student
            </Button>
            <Button href="/students/update-student" className="btn-add">
              <CgAddR /> Update Student
            </Button>
          </div>

          <Row>
            <Col lg={12}>
              <div className="tableSheet">
                <h2>Student Records</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && !error && <Table columns={columns} data={data} />}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

    </>

  );
};

export default Studentlist;
