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

const HolidayMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newFromDate, setNewFromDate] = useState("");
  const [newToDate, setNewToDate] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedHolidayName, setEditedHolidayName] = useState("");
  const [editedFromDate, setEditedFromDate] = useState("");
  const [editedToDate, setEditedToDate] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Holiday Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedHolidayName}
            onChange={(e) => setEditedHolidayName(e.target.value)}
          />
        ) : (
          row.holiday_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "From Date",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="date"
            value={editedFromDate}
            onChange={(e) => setEditedFromDate(e.target.value)}
          />
        ) : (
          row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A"
        ),
      sortable: true,
    },
    {
      name: "To Date",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="date"
            value={editedToDate}
            onChange={(e) => setEditedToDate(e.target.value)}
          />
        ) : (
          row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A"
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
              onClick={() =>
                handleEdit(row._id, row.holiday_name, row.from_date, row.to_date)
              }
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
    const tableHeaders = [
      ["#", "Holiday Name", "From Date", "To Date"],
    ];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.holiday_name || "N/A",
      row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A",
      row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Holiday Name", "From Date", "To Date"];
    const rows = data.map(
      (row, index) =>
        `${index + 1}\t${row.holiday_name || "N/A"}\t${
          row.from_date ? new Date(row.from_date).toLocaleDateString() : "N/A"
        }\t${row.to_date ? new Date(row.to_date).toLocaleDateString() : "N/A"}`
    );
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-holiday");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, holiday_name, from_date, to_date) => {
    setEditingId(id);
    setEditedHolidayName(holiday_name);
    setEditedFromDate(from_date);
    setEditedToDate(to_date);
  };

  const handleSave = async (id) => {
    if (!editedHolidayName.trim() || !editedFromDate || !editedToDate) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-holiday/${id}`, {
        holiday_name: editedHolidayName,
        from_date: editedFromDate,
        to_date: editedToDate,
      });
      fetchData();
      setEditingId(null);
    } catch (err) {
      setError("Failed to update holiday. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this holiday?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-holiday/${id}`);
        fetchData();
      } catch (err) {
        setError("Failed to delete holiday. Try again.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newHolidayName.trim() || !newFromDate || !newToDate) {
      setError("All fields are required.");
      return;
    }

    const existing = data.find(
      (item) => item.holiday_name.toLowerCase() === newHolidayName.toLowerCase()
    );
    if (existing) {
      setError("Holiday name already exists");
      return;
    }

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-holiday", {
        holiday_name: newHolidayName,
        from_date: newFromDate,
        to_date: newToDate,
      });
      setNewHolidayName("");
      setNewFromDate("");
      setNewToDate("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      setError("Failed to add holiday. Try again.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Holiday Master", link: null },
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
            <CgAddR /> Add Holiday
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Holiday</h2>
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
                    <FormLabel className="labelForm">Holiday Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Holiday Name"
                      value={newHolidayName}
                      onChange={(e) => {
                        setNewHolidayName(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">From Date*</FormLabel>
                    <FormControl
                      type="date"
                      value={newFromDate}
                      onChange={(e) => {
                        setNewFromDate(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">To Date*</FormLabel>
                    <FormControl
                      type="date"
                      value={newToDate}
                      onChange={(e) => {
                        setNewToDate(e.target.value);
                        setError("");
                      }}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Holiday
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Holiday Records</h2>
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

export default dynamic(() => Promise.resolve(HolidayMasterPage), { ssr: false });
