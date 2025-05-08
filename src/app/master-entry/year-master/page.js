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
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const SessionMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: "",
    class_id: "",
    date: ""
  });
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Class Name",
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              as="select"
              value={formData.class_id}
              onChange={(e) => setFormData({...formData, class_id: e.target.value})}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.class_name}</option>
              ))}
            </FormControl>
          ) : (
            row.class_id[0]?.class?.class_name || "N/A"
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Session Name",
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              type="text"
              value={formData.sessionName}
              onChange={(e) => setFormData({...formData, sessionName: e.target.value})}
            />
          ) : (
            row.sessionName || "N/A"
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Date",
      cell: (row) => (
        <div>
          {editingId === row._id ? (
            <FormControl
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          ) : (
            new Date(row.date).toLocaleDateString() || "N/A"
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    sessionName: "",
                    class_id: "",
                    date: ""
                  });
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
      sortable: false,
    },
  ];

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        setClasses(response.data.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to fetch classes");
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-session/");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);
    setFormData({
      sessionName: session.sessionName,
      class_id: session.class_id[0]?.class?._id || "",
      date: session.date
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.sessionName.trim() || !formData.class_id) {
      setError("Session name and class are required");
      return;
    }

    try {
      const class_id = [{ class: formData.class_id }];
      
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-session/${id}`, {
        sessionName: formData.sessionName,
        class_id,
        date: formData.date
      });
      
      fetchData();
      setEditingId(null);
      setFormData({
        sessionName: "",
        class_id: "",
        date: ""
      });
    } catch (error) {
      console.error("Error updating data:", error);
      setError(error.response?.data?.message || "Failed to update session");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-session/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting session:", error);
        setError("Failed to delete session");
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.sessionName.trim() || !formData.class_id) {
      setError("Session name and class are required");
      return;
    }

    try {
      const class_id = [{ class: formData.class_id }];
      
      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-session", {
        sessionName: formData.sessionName,
        class_id,
        date: formData.date
      });
      
      fetchData();
      setIsFormOpen(false);
      setFormData({
        sessionName: "",
        class_id: "",
        date: ""
      });
    } catch (error) {
      console.error("Error adding session:", error);
      setError(error.response?.data?.message || "Failed to add session");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Class Name", "Session Name", "Date"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.class_id[0]?.class?.class_name || "N/A",
      row.sessionName,
      new Date(row.date).toLocaleDateString()
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Class Name", "Session Name", "Date"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.class_id[0]?.class?.class_name || "N/A"}\t${row.sessionName}\t${new Date(row.date).toLocaleDateString()}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Session Master", link: "null" },
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
          <Button
            onClick={() => {
              setIsFormOpen(true);
              setEditingId(null);
              setFormData({
                sessionName: "",
                class_id: "",
                date: ""
              });
            }}
            className="btn-add mb-3"
          >
            <CgAddR /> Add Session
          </Button>

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Session</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormData({
                      sessionName: "",
                      class_id: "",
                      date: ""
                    });
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Session Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Session Name"
                      value={formData.sessionName}
                      onChange={(e) =>
                        setFormData({...formData, sessionName: e.target.value})
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({...formData, date: e.target.value})
                      }
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={12}>
                    <FormLabel className="labelForm">Select Class</FormLabel>
                    {classesLoading ? (
                      <p>Loading classes...</p>
                    ) : (
                      <FormControl
                        as="select"
                        value={formData.class_id}
                        onChange={(e) =>
                          setFormData({...formData, class_id: e.target.value})
                        }
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.class_name}
                          </option>
                        ))}
                      </FormControl>
                    )}
                  </Col>
                </Row>
                {error && <div className="text-danger mb-3">{error}</div>}
                <Button 
                  onClick={handleAdd} 
                  className="btn btn-primary"
                >
                  Add Session
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Session Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
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