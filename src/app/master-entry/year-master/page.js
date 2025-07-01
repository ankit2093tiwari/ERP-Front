"use client";

import React, { useState, useEffect } from "react";
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

const SessionMasterPage = () => {
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      const grouped = groupSessionsByClass(res.data || []);
      setData(grouped);
    } catch {
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const groupSessionsByClass = (sessions) => {
    const grouped = {};
    sessions.forEach((session) => {
      session.class_id.forEach((cls) => {
        const classId = cls.class?._id;
        const className = cls.class?.class_name;
        if (!grouped[classId]) {
          grouped[classId] = {
            _id: classId,
            class_name: className,
            sessions: [],
          };
        }
        grouped[classId].sessions.push({
          _id: session._id,
          sessionName: session.sessionName,
          start_date: session.start_date,
          end_date: session.end_date,
          class_id: session.class_id,
        });
      });
    });
    return Object.values(grouped);
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
    if (!formData.class_id.length) errors.class_id = "At least one class is required";
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
      name: "Class Name",
      selector: (row) => row.class_name,
    },
    {
      name: "Sessions",
      cell: (row) => (
        <div>
          {row.sessions.map((session) => (
            <div key={session._id} className="d-flex justify-content-between align-items-center mb-1">
              <div>
                <strong>{session.sessionName}</strong>
                {/* ({new Date(session.start_date).toLocaleDateString()} -{" "}
                {new Date(session.end_date).toLocaleDateString()}) */}
              </div>
              <div className="d-flex gap-1">
                <button
                  className="editButton btn-sm"
                  onClick={() => handleEdit(session)}
                >
                  <FaEdit />
                </button>
                <button
                  className="editButton btn-sm btn-danger"
                  onClick={() => handleDelete(session._id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Session Name", "Start Date", "End Date"];
    const rows = data.flatMap((row, index) =>
      row.sessions.map((s) =>
        `${index + 1}\t${row.class_name}\t${s.sessionName}\t${new Date(s.start_date).toLocaleDateString()}\t${new Date(s.end_date).toLocaleDateString()}`
      )
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "Class Name", "Session Name", "Start Date", "End Date"]];
    const rows = data.flatMap((row, index) =>
      row.sessions.map((s) => [
        index + 1,
        row.class_name,
        s.sessionName,
        new Date(s.start_date).toLocaleDateString(),
        new Date(s.end_date).toLocaleDateString(),
      ])
    );
    printContent(headers, rows);
  };

  useEffect(() => {
    fetchClasses();
    fetchData();
  }, []);

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

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit" : "Add"} Session</h2>
                <button className="closeForm" onClick={() => setIsFormOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Session Name</FormLabel>
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
                    <FormLabel className="labelForm">Start Date</FormLabel>
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
                    <FormLabel className="labelForm">End Date</FormLabel>
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

                <Button className="mt-3" onClick={handleSubmit}>
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
