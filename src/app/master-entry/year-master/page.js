"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
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
import Select from "react-select";
import { toast } from "react-toastify";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import {
  getClasses,
  getSessions,
  addNewSession,
  updateSessionById,
  deleteSessionById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const SessionMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: "",
    class_id: [],
    start_date: "",
    end_date: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Session Master", link: "null" },
  ];

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data || []);
    } catch {
      toast.error("Failed to fetch classes");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      const grouped = groupClassesBySession(res.data || []);
      setData(grouped);
    } catch {
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  // Group by session, not class
  const groupClassesBySession = (sessions) => {
    return sessions.map((session) => ({
      _id: session._id,
      sessionName: session.sessionName,
      start_date: session.start_date,
      end_date: session.end_date,
      class_id: session.class_id,
      classes: session.class_id.map((c) => c.class?.class_name).filter(Boolean),
    }));
  };

  const handleEdit = (session) => {
    setEditingId(session._id);
    setIsFormOpen(true);
    setFormData({
      sessionName: session.sessionName,
      class_id: session.class_id.map((c) => ({
        value: c.class?._id,
        label: c.class?.class_name,
      })),
      start_date: session.start_date?.split("T")[0] || "",
      end_date: session.end_date?.split("T")[0] || "",
    });
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteSessionById(id);
        fetchData();
        toast.success("Session deleted successfully");
      } catch {
        toast.error("Failed to delete session");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.sessionName.trim()) errors.sessionName = "Session name is required";
    if (!formData.start_date) errors.start_date = "Start date is required";
    if (!formData.end_date) errors.end_date = "End date is required";
    if (formData.start_date > formData.end_date) errors.end_date = "End date must be after start date";
    // if (!formData.class_id.length) errors.class_id = "At least one class is required";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix form errors");
      return;
    }

    const payload = {
      sessionName: formData.sessionName.trim(),
      start_date: formData.start_date,
      end_date: formData.end_date,
      class_id: formData.class_id.map((c) => ({ class: c.value })),
    };

    try {
      if (editingId) {
        await updateSessionById(editingId, payload);
        toast.success("Session updated successfully");
      } else {
        await addNewSession(payload);
        toast.success("Session added successfully");
      }

      setFormData({
        sessionName: "",
        class_id: [],
        start_date: "",
        end_date: "",
      });
      setIsFormOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message;
      if (rawMsg.includes("E11000")) {
        toast.error("Duplicate session name");
      } else {
        toast.error(rawMsg);
      }
    }
  };

  const classOptions = classes.map((cls) => ({
    value: cls._id,
    label: cls.class_name,
  }));

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Session Name",
      selector: (row) => row.sessionName,
    },
    {
      name: "Date Range",
      cell: (row) =>
        `${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}`,
    },
    {
      name: "Classes",
      cell: (row) => (
        <div>
          {row.classes.length > 0 ? (
            row.classes.map((cls, idx) => <div key={idx}>{cls}</div>)
          ) : (
            <em>No classes</em>
          )}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) =>
        hasEditAccess && (
          <div className="d-flex gap-1">
            <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
              <FaEdit />
            </Button>
            <Button
              size="sm" variant="danger"
              onClick={() => handleDelete(row._id)}
            >
              <FaTrashAlt />
            </Button>
          </div>
        ),
      ignoreRowClick: true,
    },
  ];

  const handleCopy = () => {
    const headers = ["#", "Session Name", "Date Range", "Classes"];
    const rows = data.map((row, i) =>
      `${i + 1}\t${row.sessionName}\t${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}\t${row.classes.join(", ")}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Session Name", "Date Range", "Classes"]];
    const rows = data.map((row, i) => [
      i + 1,
      row.sessionName,
      `${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}`,
      row.classes.join(", "),
    ]);
    printContent(headers, rows);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ sessionName: "", class_id: [], start_date: "", end_date: "" });
    setFieldErrors({});
  };

  useEffect(() => {
    fetchClasses();
    fetchData();
  }, [fetchData]);

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
          {hasSubmitAccess && (
            <Button
              className="btn-add mb-3"
              onClick={() => {
                setIsFormOpen(true);
                setEditingId(null);
                setFormData({ sessionName: "", class_id: [], start_date: "", end_date: "" });
                setFieldErrors({});
              }}
            >
              <CgAddR /> Add Session
            </Button>
          )}

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit" : "Add"} Session</h2>
                <button className="closeForm" onClick={handleCloseForm}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Session Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={formData.sessionName}
                      onChange={(e) =>
                        setFormData({ ...formData, sessionName: e.target.value })
                      }
                    />
                    {fieldErrors.sessionName && (
                      <div className="text-danger">{fieldErrors.sessionName}</div>
                    )}
                  </Col>
                  <Col lg={3}>
                    <FormLabel className="labelForm">Start Date<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                    {fieldErrors.start_date && (
                      <div className="text-danger">{fieldErrors.start_date}</div>
                    )}
                  </Col>
                  <Col lg={3}>
                    <FormLabel className="labelForm">End Date<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                    {fieldErrors.end_date && (
                      <div className="text-danger">{fieldErrors.end_date}</div>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <FormLabel className="labelForm">Select Classes</FormLabel>
                    <Select
                      isMulti
                      options={classOptions}
                      value={formData.class_id}
                      onChange={(selected) =>
                        setFormData({ ...formData, class_id: selected })
                      }
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {fieldErrors.class_id && (
                      <div className="text-danger">{fieldErrors.class_id}</div>
                    )}
                  </Col>
                </Row>

                <Button className="mt-3" onClick={handleSubmit} variant="success">
                  {editingId ? "Update" : "Add"} Session
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Session Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
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

export default dynamic(() => Promise.resolve(SessionMasterPage), { ssr: false });
