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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sessionName: "",
    class_id: [],
    date: ""
  });
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-classes");
        
        let classesData = [];
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }

        setClasses(classesData);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Session Name",
      selector: (row) => row.sessionName,
      sortable: true,
    },
    {
      name: "Classes",
      cell: (row) => (
        <div className="d-flex flex-column gap-2">
          {row.class_id.map((classItem, idx) => (
            <div key={idx}>
              {classItem.class?.class_name} ({classItem.class?.class_code})
            </div>
          ))}
        </div>
      ),
      sortable: false,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
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
        </div>
      ),
      sortable: false,
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-session/");
      
      let fetchedData = [];
      if (Array.isArray(response.data)) {
        fetchedData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedData = response.data.data;
      }

      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);
    setFormData({
      sessionName: session.sessionName,
      class_id: session.class_id.map(item => item.class._id),
      date: session.date
    });
    setSelectedClasses(session.class_id.map(item => item.class._id));
    setIsPopoverOpen(true);
  };

  const handleUpdate = async (id) => {
    if (!formData.sessionName.trim() || formData.class_id.length === 0) return;

    try {
      const class_id = selectedClasses.map(classId => ({ class: classId }));
      
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-session/${id}`, {
        sessionName: formData.sessionName,
        class_id,
        date: formData.date
      });
      
      fetchData();
      setEditingId(null);
      setFormData({ sessionName: "", class_id: [], date: "" });
      setSelectedClasses([]);
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error updating data:", error);
      if (error.response?.data?.error?.code === 11000) {
        alert("A session with this name already exists.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-session/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.sessionName.trim() || selectedClasses.length === 0) return;

    try {
      const class_id = selectedClasses.map(classId => ({ class: classId }));
      
      await axios.post("https://erp-backend-fy3n.onrender.com/api/create-session", {
        sessionName: formData.sessionName,
        class_id,
        date: formData.date
      });
      
      fetchData();
      setFormData({ sessionName: "", class_id: [], date: "" });
      setSelectedClasses([]);
      setIsPopoverOpen(false);
    } catch (error) {
      console.error("Error adding session:", error);
      if (error.response?.data?.error?.code === 11000) {
        alert("A session with this name already exists.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Session Name", "Classes", "Date"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.sessionName,
      row.class_id.map(c => `${c.class?.class_name} (${c.class?.class_code})`).join(", "),
      new Date(row.date).toLocaleDateString()
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Session Name", "Classes", "Date"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.sessionName}\t${row.class_id.map(c => `${c.class?.class_name} (${c.class?.class_code})`).join(", ")}\t${new Date(row.date).toLocaleDateString()}`
    );
    copyContent(headers, rows);
  };

  const toggleClassSelection = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Year Master", link: "null" },
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
              setIsPopoverOpen(true);
              setEditingId(null);
              setFormData({ sessionName: "", class_id: [], date: "" });
              setSelectedClasses([]);
            }}
            className="btn-add mb-3"
          >
            <CgAddR /> {editingId ? "Edit Session" : "Add Session"}
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit Session" : "Add New Session"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setFormData({ sessionName: "", class_id: [], date: "" });
                    setSelectedClasses([]);
                    setEditingId(null);
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
                    <FormLabel className="labelForm">Select Classes</FormLabel>
                    {classesLoading ? (
                      <p>Loading classes...</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {classes.map((cls) => (
                          <Button
                            key={cls._id}
                            variant={selectedClasses.includes(cls._id) ? "primary" : "outline-primary"}
                            onClick={() => toggleClassSelection(cls._id)}
                          >
                            {cls.class_name} ({cls.class_code})
                          </Button>
                        ))}
                      </div>
                    )}
                  </Col>
                </Row>
                <Button 
                  onClick={editingId ? () => handleUpdate(editingId) : handleAdd} 
                  className="btn btn-primary"
                >
                  {editingId ? "Update Session" : "Add Session"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
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