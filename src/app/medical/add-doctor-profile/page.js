"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, FormSelect, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';

const AddDoctorProfile = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  // const [showAddForm, setShowAddForm] = useState(false);
  const [specialistOptions, setSpecialistOptions] = useState([]); // Specialist dropdown options
  const [formValues, setFormValues] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });

  // Table columns configuration
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Doctor Name", selector: (row) => String(row.doctor_name || "N/A"), sortable: true },
    { name: "Mobile No", selector: (row) => String(row.mobile_no || "N/A"), sortable: false },
    { name: "Email Id", selector: (row) => String(row.email_id || "N/A"), sortable: false },
    { name: "Address", selector: (row) => String(row.address || "N/A"), sortable: false },
    { name: "Specialist", selector: (row) => String(row.specialist?.check_up_type || "N/A"), sortable: false },
    { name: "Description", selector: (row) => String(row.description || "N/A"), sortable: true },
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

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);


  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/doctors");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch specialist options
  const fetchSpecialists = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/checkup-types");
      setSpecialistOptions(response.data.data || []);
    } catch (err) {
      console.error("Error fetching specialists:", err);
      setError("Failed to load specialist options.");
    }
  };

  // Edit existing entry
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new name:", item?.doctor_name || "");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/doctors/${id}`, {
          doctor_name: updatedName,
        });
        fetchData(); // Refresh data
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
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Add a new entry
  const handleAdd = async () => {
    const { doctor_name, mobile_no, email_id, address, specialist, description } = formValues;
    if (doctor_name.trim() && mobile_no.trim()) {
      try {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/doctors", {
          doctor_name,
          mobile_no,
          email_id,
          address,
          specialist,
          description,
        });
        fetchData(); // Refresh data
        setFormValues({
          doctor_name: "",
          mobile_no: "",
          email_id: "",
          address: "",
          specialist: "",
          description: "",
        });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Please select different email.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchSpecialists();
  }, []);

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/medical/all-module">
              Medical
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Add Doctor Profile</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Button onClick={onOpen} className="btn btn-primary">
         <CgAddR /> Add Doctor Profile
      </Button>

      {isPopoverOpen && (

<div className="cover-sheet">
  <div className="studentHeading"><h2>Add Doctor Profile</h2>
  <button className='closeForm' onClick={onClose}> X </button>
  </div>
  <Form className="formSheet">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Doctor Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Doctor Name"
                  value={formValues.doctor_name}
                  onChange={(e) => setFormValues({ ...formValues, doctor_name: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Mobile No</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={formValues.mobile_no}
                  onChange={(e) => setFormValues({ ...formValues, mobile_no: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Email ID</FormLabel>
                <FormControl
                  type="email"
                  placeholder="Enter Email ID"
                  value={formValues.email_id}
                  onChange={(e) => setFormValues({ ...formValues, email_id: e.target.value })}
                />
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Address</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Address"
                  value={formValues.address}
                  onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel className="labelForm">Specialist</FormLabel>
                <FormSelect
                  value={formValues.specialist}
                  onChange={(e) => setFormValues({ ...formValues, specialist: e.target.value })}
                >
                  <option value="">Select</option>
                  {specialistOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.check_up_type}
                    </option>
                  ))}
                </FormSelect>
              </Col>
              <Col lg={6}>
                <FormLabel className="labelForm">Description</FormLabel>
                <FormControl
                  as="textarea"
                  placeholder="Enter Description"
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                />
              </Col>
            </Row>
            <Button className="btn btn-primary mt-4" onClick={handleAdd}>
              Submit
            </Button>
            </Form>
          </div>
        )}

        {/* Table Section */}
        <Row>
          <Col>
          <div className="tableSheet">
            <h2>Doctor Profile Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}

            </div>
          </Col>
        </Row>
     
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddDoctorProfile), { ssr: false });
