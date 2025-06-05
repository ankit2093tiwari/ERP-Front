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

const ExamGradeMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    gradeName: ''
  });

  const [editData, setEditData] = useState({
    from: '',
    to: '',
    gradeName: ''
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "From",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="number"
          value={editData.from}
          onChange={(e) => setEditData({...editData, from: e.target.value})}
        />
      ) : (
        row.from || "N/A"
      ),
      sortable: true,
    },
    {
      name: "To",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="number"
          value={editData.to}
          onChange={(e) => setEditData({...editData, to: e.target.value})}
        />
      ) : (
        row.to || "N/A"
      ),
      sortable: true,
    },
    {
      name: "Grade Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editData.gradeName}
          onChange={(e) => setEditData({...editData, gradeName: e.target.value})}
        />
      ) : (
        row.gradeName || "N/A"
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
    const tableHeaders = [["#", "From", "To", "Grade Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.from || "N/A",
      row.to || "N/A",
      row.gradeName || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "From", "To", "Grade Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.from || "N/A"}\t${row.to || "N/A"}\t${row.gradeName || "N/A"}`
    );

    copyContent(headers, rows);
  };

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/examGrade");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch exam grades. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditData({
      from: row.from,
      to: row.to,
      gradeName: row.gradeName
    });
  };

  // Handle save action
  const handleSave = async (id) => {
    if (!editData.from || !editData.to || !editData.gradeName) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/examGrade/${id}`,
        editData
      );
      
      setData(prevData => 
        prevData.map(row => 
          row._id === id ? response.data.data : row
        )
      );
      setEditingId(null);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update exam grade. Please try again later.");
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this exam grade?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/examGrade/${id}`);
        setData(prevData => prevData.filter(row => row._id !== id));
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete exam grade. Please try again later.");
      }
    }
  };

  // Handle add action
  const handleAdd = async () => {
    if (!formData.from || !formData.to || !formData.gradeName) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/examGrade",
        formData
      );
      
      setData(prevData => [...prevData, response.data.data]);
      setFormData({ from: '', to: '', gradeName: '' });
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add exam grade. Please try again later.");
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
    { label: "Exam Grade Master", link: null }
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
            <CgAddR /> Add Exam Grade
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Exam Grade</h2>
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
                  <Col lg={4}>
                    <FormLabel className="labelForm">From</FormLabel>
                    <FormControl
                      type="number"
                      name="from"
                      placeholder="Enter From Mark"
                      value={formData.from}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">To</FormLabel>
                    <FormControl
                      type="number"
                      name="to"
                      placeholder="Enter To Mark"
                      value={formData.to}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col lg={4}>
                    <FormLabel className="labelForm">Grade Name</FormLabel>
                    <FormControl
                      type="text"
                      name="gradeName"
                      placeholder="Enter Grade Name"
                      value={formData.gradeName}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>
                {error && <p className="text-danger">{error}</p>}
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Grade
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Exam Grade Records</h2>
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

export default dynamic(() => Promise.resolve(ExamGradeMaster), { ssr: false });