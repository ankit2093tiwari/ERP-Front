"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect } from "react-bootstrap";
import axios from "axios";

const AddDoctorProfile = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [formValues, setFormValues] = useState({
    doctorName: "",
    mobileNo: "",
    emailId: "",
    address: "",
    specialist: "",
    description: "",
  });

  // Table columns configuration
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    {
      name: "Doctor Name",
      selector: (row) => String(row.doctorName || "N/A"), // Ensures it's a string
      sortable: true,
    },
    {
      name: "Mobile No",
      selector: (row) => String(row.mobileNo || "N/A"), // Ensures it's a string
      sortable: false,
    },
    {
      name: "Email Id",
      selector: (row) => String(row.emailId || "N/A"), // Ensures it's a string
      sortable: false,
    },
    {
      name: "Address",
      selector: (row) => String(row.address || "N/A"), // Ensures it's a string
      sortable: false,
    },
    {
      name: "Specialist",
      selector: (row) => String(row.specialist || "N/A"), // Ensures it's a string
      sortable: false,
    },
    {
      name: "Description",
      selector: (row) => String(row.description || "N/A"), // Ensures it's a string
      sortable: true,
    },
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/doctors");
      const mappedData = (response.data.data || []).map((item) => ({
        _id: item._id,
        doctorName: String(item.doctor_name || "N/A"), // Ensure all fields are strings
        mobileNo: String(item.mobile_no || "N/A"), // Ensure all fields are strings
        emailId: String(item.email_id || "N/A"), // Ensure all fields are strings
        address: String(item.address || "N/A"), // Ensure all fields are strings
        specialist: String(item.specialist || "N/A"), // Ensure all fields are strings
        description: String(item.description || "N/A"), // Ensure all fields are strings
      }));
      setData(mappedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing entry
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new name:", item?.doctorName || "");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/doctors/${id}`, {
          doctorName: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, doctorName: updatedName } : row
          )
        );
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update data. Please try again later.");
      }
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/doctors/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Add a new entry
  const handleAdd = async () => {
    const { doctorName, mobileNo, emailId, address, specialist, description } = formValues;
    if (doctorName.trim() && mobileNo.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/doctors", {
          doctor_name: doctorName,
          mobile_no: mobileNo,
          email_id: emailId,
          address,
          specialist,
          description,
        });
        const newDoctor = {
          _id: response.data.data._id,
          doctorName: response.data.data.doctor_name,
          mobileNo: response.data.data.mobile_no,
          emailId: response.data.data.email_id,
          address: response.data.data.address,
          specialist: response.data.data.specialist,
          description: response.data.data.description,
        };
        setData((prevData) => [...prevData, newDoctor]);
        setFormValues({
          doctorName: "",
          mobileNo: "",
          emailId: "",
          address: "",
          specialist: "",
          description: "",
        });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add data. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add Doctor Profile
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Doctor Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Doctor Name"
                  value={formValues.doctorName}
                  onChange={(e) => setFormValues({ ...formValues, doctorName: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Specialist</FormLabel>
                <FormSelect
                  value={formValues.specialist}
                  onChange={(e) => setFormValues({ ...formValues, specialist: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                </FormSelect>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Mobile No.</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Mobile No."
                  value={formValues.mobileNo}
                  onChange={(e) => setFormValues({ ...formValues, mobileNo: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Email ID</FormLabel>
                <FormControl
                  type="email"
                  placeholder="Enter Email ID"
                  value={formValues.emailId}
                  onChange={(e) => setFormValues({ ...formValues, emailId: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Description</FormLabel>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Address</FormLabel>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formValues.address}
                  onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button onClick={handleAdd} className={styles.search}>
                  Add Doctor Profile
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Doctor Profile Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddDoctorProfile), { ssr: false });
