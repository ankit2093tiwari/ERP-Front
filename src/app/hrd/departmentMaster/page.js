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

const DepartmentMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Department Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.department_name || "N/A"
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
            <button className="editButton" onClick={() => handleEdit(row._id, row.department_name)}>
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
    const tableHeaders = [["#", "Department Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.department_name || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Department Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.department_name || "N/A"}`);

    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-departments");
      const fetchedData = response.data.data || [];
      const normalizedData = fetchedData.map((item) => ({
        ...item,
        department_name: item.department_name || "N/A",
      }));
      setData(normalizedData);
    } catch (err) {
      console.error("Error fetching data:", err);
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
      setError("Department name cannot be empty");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-departments/${id}`, {
        department_name: editedName,
      });
      setData((prevData) =>
        prevData.map((row) =>
          row._id === id ? { ...row, department_name: editedName } : row
        )
      );
      fetchData();
      setEditingId(null);
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Department name already exists");
      } else {
        setError("Failed to update data. Please try again later.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-departments/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newDepartmentName.trim()) {
      setError("Department name cannot be empty");
      return;
    }

    try {
      const existingDepartment = data.find(
        (dept) => dept.department_name.toLowerCase() === newDepartmentName.toLowerCase()
      );
      if (existingDepartment) {
        setError("Department name already exists");
        return;
      }

      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/create-departments", {
        department_name: newDepartmentName,
      });
      setData((prevData) => [...prevData, response.data]);
      setNewDepartmentName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Department name already exists");
      } else {
        setError("Failed to add data. Please try again later.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" }, 
    { label: "Department Master", link: "null" }
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
            <CgAddR /> Add Department
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Department</h2>
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
                    <FormLabel className="labelForm">Department Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Department Name"
                      value={newDepartmentName}
                      onChange={(e) => {
                        setNewDepartmentName(e.target.value);
                        setError("");
                      }}
                      required
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Department
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Department Records</h2>
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

export default dynamic(() => Promise.resolve(DepartmentMasterPage), { ssr: false });