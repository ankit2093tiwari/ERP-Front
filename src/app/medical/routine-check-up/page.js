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

const RoutineCheckUp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [nextFormNo, setNextFormNo] = useState(1);
  const [formData, setFormData] = useState({
    form_no: "",
    remark: "",
    check_up_for: "",
    doctor: "",
  });
  const [editFormData, setEditFormData] = useState({
    form_no: "",
    remark: "",
    check_up_for: "",
    doctor: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
      sortable: true,
    },
    {
      name: "Doctor Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.doctor}
            onChange={(e) => setEditFormData({...editFormData, doctor: e.target.value})}
          >
            <option value="">Select</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.doctor_name}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.doctor?.doctor_name || "N/A"
        ),
    },
    {
      name: "Checkup For",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.check_up_for}
            onChange={(e) => setEditFormData({...editFormData, check_up_for: e.target.value})}
          >
            <option value="">Select</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </FormSelect>
        ) : (
          row.check_up_for || "N/A"
        ),
    },
    
    {
      name: "Remarks",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.remark}
            onChange={(e) => setEditFormData({...editFormData, remark: e.target.value})}
          />
        ) : (
          row.remark || "N/A"
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/routine-checkups");
      const sortedData = response.data.data.sort((a, b) => {
        const numA = parseInt(a.form_no) || 0;
        const numB = parseInt(b.form_no) || 0;
        return numA - numB;
      });
      setData(sortedData || []);
      
      // Calculate the next form number
      if (sortedData.length > 0) {
        const lastFormNo = parseInt(sortedData[sortedData.length - 1].form_no) || 0;
        setNextFormNo(lastFormNo + 1);
      } else {
        setNextFormNo(1);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch routine check-ups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/doctors");
      setDoctors(response.data.data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError("Failed to load doctor options.");
    }
  };

  const handleEdit = (checkUp) => {
    setEditingId(checkUp._id);
    setEditFormData({
      form_no: checkUp.form_no || "",
      remark: checkUp.remark || "",
      check_up_for: checkUp.check_up_for || "",
      doctor: checkUp.doctor?._id || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/routine-checkups/${id}`, editFormData);
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update routine check-up. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this routine check-up?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/routine-checkups/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete routine check-up. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    const { form_no, check_up_for, doctor } = formData;
    if (check_up_for && doctor) {
      try {
        // Auto-generate form number
        const generatedFormNo = nextFormNo.toString();
        
        const existingCheckUp = data.find(
          (checkUp) => checkUp.form_no === generatedFormNo
        );
        if (existingCheckUp) {
          setError("Check-up with this form number already exists.");
          return;
        }

        const payload = {
          ...formData,
          form_no: generatedFormNo
        };

        await axios.post("https://erp-backend-fy3n.onrender.com/api/routine-checkups", payload);
        fetchData();
        setFormData({
          form_no: "",
          remark: "",
          check_up_for: "",
          doctor: "",
        });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add routine check-up. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Date", "Checkup For", "Doctor", "Remarks"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      // row.form_no || "N/A",
      row.check_up_for || "N/A",
      row.doctor?.doctor_name || "N/A",
      row.remark || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Checkup For", "Doctor", "Remarks"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.check_up_for || "N/A"}\t${row.doctor?.doctor_name || "N/A"}\t${row.remark || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
    fetchDoctors();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Routine Check-Up", link: "null" },
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
            onClick={() => {
              setIsPopoverOpen(true);
              // Set the next form number in the form data when opening the popover
              setFormData(prev => ({
                ...prev,
                form_no: nextFormNo.toString()
              }));
            }}
            className="btn-add"
          >
            <CgAddR /> Add Routine Check-Up
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Routine Check-Up</h2>
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
                    <FormLabel className="labelForm">Form No</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.form_no}
                      readOnly
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Checkup For</FormLabel>
                    <FormSelect
                      value={formData.check_up_for}
                      onChange={(e) => setFormData({...formData, check_up_for: e.target.value})}
                      required
                    >
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Doctor</FormLabel>
                    <FormSelect
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      required
                    >
                      <option value="">Select</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.doctor_name}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Remarks</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Remarks"
                      value={formData.remark}
                      onChange={(e) => setFormData({...formData, remark: e.target.value})}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Routine Check-Up
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Routine Check-Up Records</h2>
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

export default dynamic(() => Promise.resolve(RoutineCheckUp), { ssr: false });