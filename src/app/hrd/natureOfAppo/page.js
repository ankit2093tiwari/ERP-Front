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
  Button
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const NatureOfAppointmentPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAppoName, setNewAppoName] = useState("");
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
      name: "Appointment Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.AppoName || "N/A"
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
            <button className="editButton" onClick={() => handleEdit(row._id, row.AppoName)}>
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

  const handlePrint = () => {
    const tableHeaders = [["#", "Appointment Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.AppoName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Appointment Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.AppoName || "N/A"}`);
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-nature");
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
      setError("Appointment name cannot be empty");
      return;
    }
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-nature/${id}`, {
        AppoName: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Appointment name already exists");
      } else {
        setError("Failed to update appointment. Try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-nature/${id}`);
        fetchData();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete appointment. Try again.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newAppoName.trim()) {
      setError("Appointment name cannot be empty");
      return;
    }

    try {
      const existing = data.find(
        (item) => item.AppoName.toLowerCase() === newAppoName.toLowerCase()
      );
      if (existing) {
        setError("Appointment name already exists");
        return;
      }

      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-nature", {
        AppoName: newAppoName,
      });
      setNewAppoName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Appointment name already exists");
      } else {
        setError("Failed to add appointment. Try again.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Nature of Appointment", link: null },
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
            <CgAddR /> Add Appointment
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Appointment</h2>
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
                    <FormLabel className="labelForm">Appointment Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Appointment Name"
                      value={newAppoName}
                      onChange={(e) => {
                        setNewAppoName(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Appointment
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Appointment Records</h2>
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

export default dynamic(() => Promise.resolve(NatureOfAppointmentPage), { ssr: false });
