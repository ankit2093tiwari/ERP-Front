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
  Button,
  FormSelect,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const DesignationMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Teaching");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState("Teaching");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Designation Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.designation_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Designation Type",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedType}
            onChange={(e) => setEditedType(e.target.value)}
          >
            <option value="Teaching">Teaching</option>
            <option value="Non-Teaching">Non-Teaching</option>
          </FormSelect>
        ) : (
          row.designation_type || "N/A"
        ),
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-designations");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedName(row.designation_name);
    setEditedType(row.designation_type);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setError("Designation name cannot be empty");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-designations/${id}`, {
        designation_name: editedName,
        designation_type: editedType,
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Designation name already exists");
      } else {
        setError("Failed to update designation. Try again later.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this designation?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-designations/${id}`);
        fetchData();
      } catch (error) {
        setError("Failed to delete designation.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("Designation name cannot be empty");
      return;
    }

    try {
      const existing = data.find(
        (item) => item.designation_name.toLowerCase() === newName.toLowerCase()
      );
      if (existing) {
        setError("Designation name already exists");
        return;
      }

      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-designations", {
        designation_name: newName,
        designation_type: newType,
      });

      setNewName("");
      setNewType("Teaching");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      setError("Failed to add designation.");
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Designation Name", "Designation Type"];
    const rows = data.map((row, index) => `${index + 1}\t${row.designation_name}\t${row.designation_type}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Designation Name", "Designation Type"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.designation_name,
      row.designation_type,
    ]);
    printContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Designation Master", link: "null" },
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
            <CgAddR /> Add Designation
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Designation</h2>
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
                    <FormLabel className="labelForm">Designation Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Designation Name"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Designation Type*</FormLabel>
                    <FormSelect
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      <option value="Teaching">Teaching</option>
                      <option value="Non-Teaching">Non-Teaching</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Designation
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Designation Records</h2>
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

export default dynamic(() => Promise.resolve(DesignationMasterPage), { ssr: false });
