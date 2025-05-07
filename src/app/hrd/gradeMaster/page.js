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
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const GradeMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newGradeName, setNewGradeName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Grade Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.grade_name || "N/A"
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
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.grade_name)}
            >
              <FaEdit />
            </button>
          )}
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const handlePrint = () => {
    const tableHeaders = [["#", "Grade Name"]];
    const tableRows = data.map((row, index) => [index + 1, row.grade_name || "N/A"]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Grade Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.grade_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-grade");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setError("Grade name cannot be empty");
      return;
    }
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-grade/${id}`, {
        grade_name: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Grade name already exists");
      } else {
        setError("Failed to update grade. Try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-grade/${id}`);
        fetchData();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete grade. Try again.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newGradeName.trim()) {
      setError("Grade name cannot be empty");
      return;
    }

    const existing = data.find(
      (item) => item.grade_name.toLowerCase() === newGradeName.toLowerCase()
    );
    if (existing) {
      setError("Grade name already exists");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-grade", {
        grade_name: newGradeName,
      });
      setNewGradeName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Grade name already exists");
      } else {
        setError("Failed to add grade. Try again.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Grade Master", link: null },
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
            <CgAddR /> Add Grade
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Grade</h2>
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
                    <FormLabel className="labelForm">Grade Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Grade Name"
                      value={newGradeName}
                      onChange={(e) => {
                        setNewGradeName(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Grade
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Grade Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
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

export default dynamic(() => Promise.resolve(GradeMasterPage), { ssr: false });
