"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Button } from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

import { deleteStudentById, getStudentsData } from "@/Services";
import { toast } from "react-toastify";
import useSessionId from "@/hooks/useSessionId";
import usePagePermission from "@/hooks/usePagePermission";

const Studentlist = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const selectedSessionId = useSessionId();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Fetch student data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getStudentsData()
      const students = response.data || [];
      // Reverse to show newest first
      setData(students.reverse());
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Operation
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      try {
        await deleteStudentById(id)
        setData((prevData) => prevData.filter((row) => row._id !== id));
        // fetchData();
        toast.success("Student deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSessionId]);


  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "50px" },
    { name: "Registration ID", selector: (row) => row.registration_id || "N/A" },
    { name: "First Name", selector: (row) => row.first_name || "N/A" },
    { name: "Last Name", selector: (row) => row.last_name || "N/A" },
    { name: "Father's Name", selector: (row) => row.father_name || "N/A" },
    { name: "Gender", selector: (row) => row.gender_name || "N/A" },
    { name: "Phone No", selector: (row) => row.phone_no || "N/A" },
    { name: "Date of Birth", selector: (row) => new Date(row.date_of_birth).toLocaleDateString() || "N/A" },
    { name: "Aadhar No", selector: (row) => row.aadhar_card_no || "N/A" },
    { name: "Country", selector: (row) => row.residence_address?.country || "India" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];
  const handlePrint = () => {
    const headers = [["#", "Reg. ID", "First Name", "Last Name", "Father's Name", "Gender", "Phone", "DOB",]];
    const rows = data.map((row, index) => [
      index + 1,
      row.registration_id || "N/A",
      row.first_name || "N/A",
      row.last_name || "N/A",
      row.father_name || "N/A",
      row.gender_name || "N/A",
      row.phone_no || "N/A",
      new Date(row.date_of_birth).toLocaleDateString() || "N/A",
      // row.aadhar_card_no || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Reg. ID", "First Name", "Last Name", "Father's Name", "Gender", "Phone", "DOB", "Country"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.registration_id || "N/A"}\t${row.first_name || "N/A"}\t${row.last_name || "N/A"}\t${row.father_name || "N/A"}\t${row.gender_name || "N/A"}\t${row.phone_no || "N/A"}\t${new Date(row.date_of_birth).toLocaleDateString() || "N/A"}\t${row.residence_address?.country || "N/A"}`
    );
    copyContent(headers, rows);
  };

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
            {hasSubmitAccess && <Button onClick={() => router.push('/students/add-new-student')} className="btn-add">
              <CgAddR /> Add New Student
            </Button>}
            {hasEditAccess && <Button onClick={() => router.push("/students/update-student")} className="btn-add">
              <CgAddR /> Update Student
            </Button>}

          </div>

          <Row>
            <Col lg={12}>
              <div className="tableSheet">
                <h2>Student Records</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && <Table
                  columns={columns}
                  data={data}
                  handleCopy={handleCopy}
                  handlePrint={handlePrint}
                />
                }
              </div>
            </Col>
          </Row>
        </Container>
      </section>

    </>

  );
};

export default Studentlist;
