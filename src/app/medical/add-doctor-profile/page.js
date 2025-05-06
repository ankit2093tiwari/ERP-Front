"use client";
import React, { useState, useEffect } from "react";
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
  Alert,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddDoctorProfile = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [specialistOptions, setSpecialistOptions] = useState([]);
  const [formData, setFormData] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Doctor Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.doctor_name}
            onChange={(e) => setEditFormData({...editFormData, doctor_name: e.target.value})}
          />
        ) : (
          row.doctor_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Mobile No",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.mobile_no}
            onChange={(e) => setEditFormData({...editFormData, mobile_no: e.target.value})}
          />
        ) : (
          row.mobile_no || "N/A"
        ),
    },
    {
      name: "Email ID",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="email"
            value={editFormData.email_id}
            onChange={(e) => setEditFormData({...editFormData, email_id: e.target.value})}
          />
        ) : (
          row.email_id || "N/A"
        ),
    },
    {
      name: "Address",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.address}
            onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
          />
        ) : (
          row.address || "N/A"
        ),
    },
    {
      name: "Specialist",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.specialist}
            onChange={(e) => setEditFormData({...editFormData, specialist: e.target.value})}
          >
            <option value="">Select</option>
            {specialistOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {option.check_up_type}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.specialist?.check_up_type || "N/A"
        ),
    },
    {
      name: "Description",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            as="textarea"
            value={editFormData.description}
            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
          />
        ) : (
          row.description || "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/doctors");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/checkup-types");
      setSpecialistOptions(response.data.data || []);
    } catch (err) {
      console.error("Error fetching specialists:", err);
      setError("Failed to load specialist options.");
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setEditFormData({
      doctor_name: doctor.doctor_name || "",
      mobile_no: doctor.mobile_no || "",
      email_id: doctor.email_id || "",
      address: doctor.address || "",
      specialist: doctor.specialist?._id || "",
      description: doctor.description || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/doctors/${id}`, editFormData);
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update doctor. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/doctors/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete doctor. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    const { doctor_name, mobile_no } = formData;
    if (doctor_name.trim() && mobile_no.trim()) {
      try {
        const existingDoctor = data.find(
          (doctor) => doctor.email_id === formData.email_id
        );
        if (existingDoctor) {
          setError("Doctor with this email already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/doctors", formData);
        fetchData();
        setFormData({
          doctor_name: "",
          mobile_no: "",
          email_id: "",
          address: "",
          specialist: "",
          description: "",
        });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add doctor. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Doctor Name", "Mobile No", "Email ID", "Address", "Specialist", "Description"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.doctor_name || "N/A",
      row.mobile_no || "N/A",
      row.email_id || "N/A",
      row.address || "N/A",
      row.specialist?.check_up_type || "N/A",
      row.description || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Doctor Name", "Mobile No", "Email ID", "Address", "Specialist", "Description"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.doctor_name || "N/A"}\t${row.mobile_no || "N/A"}\t${row.email_id || "N/A"}\t${row.address || "N/A"}\t${row.specialist?.check_up_type || "N/A"}\t${row.description || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
    fetchSpecialists();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Add Doctor Profile", link: "null" },
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
          
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Doctor Profile
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Doctor Profile</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Doctor Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Doctor Name"
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Mobile No</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Mobile Number"
                      value={formData.mobile_no}
                      onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Email ID</FormLabel>
                    <FormControl
                      type="email"
                      placeholder="Enter Email ID"
                      value={formData.email_id}
                      onChange={(e) => setFormData({...formData, email_id: e.target.value})}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Address</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Specialist</FormLabel>
                    <FormSelect
                      value={formData.specialist}
                      onChange={(e) => setFormData({...formData, specialist: e.target.value})}
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
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Doctor Profile
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Doctor Profile Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
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

export default dynamic(() => Promise.resolve(AddDoctorProfile), { ssr: false });