"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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
import { toast } from "react-toastify";
import {
  addDailyDiaryRecord,
  deleteDailyDiaryRecord,
  getAllTeachers,
  getDailyDiaryRecords,
  updateDailyDiaryRecord,
} from "@/Services";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const DailyDiary = () => {
  const [data, setData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newEntry, setNewEntry] = useState({
    entryDate: "",
    teacherName: "",
    workDetails: "",
  });
  const [editEntry, setEditEntry] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});

  const breadcrumbItems = [{ label: "Daily Diary", link: "/dailyDiary" }];

  const validateForm = (entry) => {
    const errors = {};
    if (!entry.entryDate) errors.entryDate = "Entry date is required";
    if (!entry.teacherName) errors.teacherName = "Teacher name is required";
    if (!entry.workDetails.trim()) errors.workDetails = "Work details are required";
    return errors;
  };

  const fetchTeachers = async () => {
    try {
      const response = await getAllTeachers();
      setTeachers(response?.data || []);
    } catch (err) {
      toast.error("Failed to fetch teachers");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getDailyDiaryRecords();
      setData(response?.data || []);
    } catch (err) {
      toast.error("Failed to fetch diary records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchData();
  }, []);

  const handleAdd = async () => {
    const errors = validateForm(newEntry);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.warn("Please fix the errors in the form.");
      return;
    }

    try {
      const response = await addDailyDiaryRecord(newEntry);
      toast.success(response?.message || "Entry added successfully!");
      setNewEntry({ entryDate: "", teacherName: "", workDetails: "" });
      setFieldErrors({});
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add entry.");
    }
  };

  const handleEdit = (entry) => {
    setEditEntry({
      ...entry,
      teacherName: entry.teacherName?._id || "",
    });
    setFieldErrors({});
  };

  const handleUpdate = async () => {
    const errors = validateForm(editEntry);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.warn("Please fix the errors in the form.");
      return;
    }

    try {
      const { _id, entryDate, teacherName, workDetails } = editEntry;
      const response = await updateDailyDiaryRecord(_id, {
        entryDate,
        teacherName,
        workDetails,
      });
      toast.success(response?.message || "Entry updated successfully!");
      setEditEntry(null);
      setFieldErrors({});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update entry.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        const response = await deleteDailyDiaryRecord(id);
        toast.success(response?.message || "Entry deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete entry.");
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Entry Date",
      selector: (row) =>
        row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "N/A",
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
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Entry
          </Button>

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
                    {fieldErrors.entryDate && (
                      <div className="text-danger">{fieldErrors.entryDate}</div>
                    )}
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
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.first_name} {t.last_name}
                        </option>
                      ))}
                    </FormControl>
                    {fieldErrors.teacherName && (
                      <div className="text-danger">{fieldErrors.teacherName}</div>
                    )}
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
                    {fieldErrors.workDetails && (
                      <div className="text-danger">{fieldErrors.workDetails}</div>
                    )}
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
                      value={
                        editEntry.entryDate
                          ? new Date(editEntry.entryDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditEntry({ ...editEntry, entryDate: e.target.value })
                      }
                    />
                    {fieldErrors.entryDate && (
                      <div className="text-danger">{fieldErrors.entryDate}</div>
                    )}
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
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.first_name} {t.last_name}
                        </option>
                      ))}
                    </FormControl>
                    {fieldErrors.teacherName && (
                      <div className="text-danger">{fieldErrors.teacherName}</div>
                    )}
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
                    {fieldErrors.workDetails && (
                      <div className="text-danger">{fieldErrors.workDetails}</div>
                    )}
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
            {loading ? <p>Loading...</p> : <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(DailyDiary), { ssr: false });
