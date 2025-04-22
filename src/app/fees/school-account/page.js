"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Modal } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const SchoolAccount = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/schools/all");
      const schoolData = response.data.data || [];
      setData(schoolData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch school data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSchoolName.trim()) {
      setError("School name cannot be empty");
      return;
    }

    try {
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/schools", {
        school_name: newSchoolName
      });
      setData([...data, response.data.data]);
      setNewSchoolName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding school:", error);
      setError(error.response?.data?.message || "Failed to add school");
    }
  };

  const handleEdit = (school) => {
    setEditingId(school._id);
    setEditedName(school.school_name);
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      setError("School name cannot be empty");
      return;
    }

    try {
      const response = await axios.put("https://erp-backend-fy3n.onrender.com/api/schools", {
        school_name: editedName
      });
      setData(data.map(row => 
        row._id === id ? { ...row, school_name: editedName } : row
      ));
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Error updating school:", error);
      setError(error.response?.data?.message || "Failed to update school");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this school?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/schools/${id}`);
        setData(data.filter(row => row._id !== id));
        fetchData();
      } catch (error) {
        console.error("Error deleting school:", error);
        setError("Failed to delete school");
      }
    }
  };

  const handleCopy = () => {
    const headers = ["#", "School Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.school_name || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = async () => {
    const tableHeaders = [["#", "School Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.school_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "School Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="inline-edit-input"
          />
        ) : (
          row.school_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <Button variant="success" size="sm" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="sm" onClick={() => handleEdit(row)}>
                <FaEdit />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" }, 
    { label: "school-account", link: "null" }
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
          {/* <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add School
          </Button> */}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New School</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={12}>
                    <FormLabel className="labelForm">School Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter School Name"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add School
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>School Records</h2>
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

export default dynamic(() => Promise.resolve(SchoolAccount), { ssr: false });