"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Alert, } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addDailyDiaryRecord, deleteDailyDiaryRecord, getAllTeachers, getDailyDiaryRecords, updateDailyDiaryRecord } from "@/Services";

const DailyDiary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [newEntry, setNewEntry] = useState({
    entryDate: "",
    teacherName: "",
    workDetails: "",
  });
  const [editEntry, setEditEntry] = useState(null);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Entry Date",
      selector: (row) => new Date(row.entryDate).toLocaleDateString() || "N/A",
    },
    {
      name: "Teacher Name",
      selector: (row) =>
        `${row.teacherName?.first_name || "N/A"} ${row.teacherName?.last_name || ""}`,
    },
    {
      name: "Work Details",
      selector: (row) => row.workDetails || "N/A",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
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

  const fetchTeachers = async () => {
    try {
      const response = await getAllTeachers()
      setTeachers(response?.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getDailyDiaryRecords()
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const { entryDate, teacherName, workDetails } = newEntry;

    if (!entryDate || !teacherName || !workDetails) {
      toast.warn("Please fill in all fields.");
      return;
    }

    try {
      const response = await addDailyDiaryRecord(newEntry)
      setNewEntry({ entryDate: "", teacherName: "", workDetails: "" });
      setShowAddForm(false);
      // setSuccess("Entry added successfully.");
      toast.success(response?.message || "Entery added Successfully!")
      fetchData();
    } catch (err) {
      console.error("Error adding data:", err);
      toast.error(err.response?.data?.message || "Failed to add Entry.");
      // setError("Failed to add entry. Please try again later.");
    }
  };

  const handleEdit = (entry) => {
    setEditEntry({ ...entry, teacherName: entry.teacherName?._id || "" });
  };


  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        const response = await deleteDailyDiaryRecord(id)
        toast.success(response?.message || "Entry Deleted Successfully")
        fetchData()
        // setSuccess("Entry deleted successfully.");
      } catch (err) {
        console.error("Error deleting data:", err);
        toast.error(err.response?.data?.message || "Failed to delete entry. Please try again later.");
        // setError("Failed to delete entry. Please try again later.");
      }
    }
  };

  const handleUpdate = async () => {
    const { _id, entryDate, teacherName, workDetails } = editEntry;

    if (!entryDate || !teacherName || !workDetails) {
      toast.warn("Please fill in all fields.");
      return;
    }

    try {
      const response = await updateDailyDiaryRecord(_id, {
        entryDate,
        teacherName,
        workDetails,
      })
      toast.success(response?.message || "Entry Updated Successfully")
      fetchData()
      setEditEntry(null);
      // setSuccess("Entry updated successfully.");
    } catch (err) {
      console.error("Error updating entry:", err);
      toast.error(err.response?.data?.message)
      // setError("Failed to update entry. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchTeachers();
  }, []);

  const breadcrumbItems = [{ label: "Daily Diary", link: "/dailyDiary" }]

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Entry
          </Button>

          {success && <Alert variant="success" className="mt-3">{success}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Daily Diary Entry</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Entry Date</FormLabel>
                    <FormControl
                      type="date"
                      value={newEntry.entryDate}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, entryDate: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Teacher Name</FormLabel>
                    <FormControl
                      as="select"
                      value={newEntry.teacherName}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, teacherName: e.target.value })
                      }
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.first_name} {teacher.last_name}
                        </option>
                      ))}
                    </FormControl>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <FormLabel className="labelForm">Work Details</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={3}
                      placeholder="Enter work details"
                      value={newEntry.workDetails}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, workDetails: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Entry
                </Button>
              </Form>
            </div>
          )}
          {editEntry && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Daily Diary Entry</h2>
                <button className="closeForm" onClick={() => setEditEntry(null)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Entry Date</FormLabel>
                    <FormControl
                      type="date"
                      value={new Date(editEntry.entryDate).toISOString().split("T")[0]}

                      onChange={(e) =>
                        setEditEntry({ ...editEntry, entryDate: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Teacher Name</FormLabel>
                    <FormControl
                      as="select"
                      value={editEntry.teacherName}
                      onChange={(e) =>
                        setEditEntry({ ...editEntry, teacherName: e.target.value })
                      }
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.first_name} {teacher.last_name}
                        </option>
                      ))}
                    </FormControl>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <FormLabel className="labelForm">Work Details</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={3}
                      value={editEntry.workDetails}
                      onChange={(e) =>
                        setEditEntry({ ...editEntry, workDetails: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleUpdate} className="btn btn-success mt-3">
                  Update Entry
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Daily Diary Records</h2>
            {loading && <p>Loading...</p>}
            {!loading && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(DailyDiary), { ssr: false });