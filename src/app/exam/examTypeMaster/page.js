"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const ExamTypeMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    examTypeName: ''
  });

  const [editData, setEditData] = useState({
    examTypeName: ''
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Exam Type Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editData.examTypeName}
          onChange={(e) => setEditData({...editData, examTypeName: e.target.value})}
        />
      ) : (
        row.examTypeName || "N/A"
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
              <FaEdit />
            </button>
          )}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handlePrint = async () => {
    const tableHeaders = [["#", "Exam Type Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.examTypeName || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Exam Type Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.examTypeName || "N/A"}`
    );

    copyContent(headers, rows);
  };

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/examType");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch exam types. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditData({
      examTypeName: row.examTypeName
    });
  };

  // Handle save action
  const handleSave = async (id) => {
    if (!editData.examTypeName) {
      setError("Exam type name is required");
      return;
    }

    try {
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/examType/${id}`,
        { examTypeName: editData.examTypeName }
      );
      
      setData(prevData => 
        prevData.map(row => 
          row._id === id ? response.data.data : row
        )
      );
      setEditingId(null);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update exam type. Please try again later.");
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this exam type?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/examType/${id}`);
        setData(prevData => prevData.filter(row => row._id !== id));
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete exam type. Please try again later.");
      }
    }
  };

  // Handle add action
  const handleAdd = async () => {
    if (!formData.examTypeName) {
      setError("Exam type name is required");
      return;
    }

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/examType",
        { examTypeName: formData.examTypeName }
      );
      
      setData(prevData => [...prevData, response.data.data]);
      setFormData({ examTypeName: '' });
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add exam type. Please try again later.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Exams", link: "/exam/all-module" }, 
    { label: "Exam Type Master", link: null }
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Exam Type
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Exam Type</h2>
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
                  <Col lg={12}>
                    <FormLabel className="labelForm">Exam Type Name</FormLabel>
                    <FormControl
                      type="text"
                      name="examTypeName"
                      placeholder="Enter Exam Type Name"
                      value={formData.examTypeName}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>
                {error && <p className="text-danger">{error}</p>}
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Exam Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Exam Type Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
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

export default dynamic(() => Promise.resolve(ExamTypeMaster), { ssr: false });