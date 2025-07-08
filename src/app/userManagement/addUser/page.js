"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { BASE_URL, getAllUsers } from "@/Services";

const allModules = [
  "masterentry", "student", "library", "hostel", "fees", "hrd", "frontoffice", "attendance",
  "exams", "timetable", "transport", "stock", "notice", "events", "accounts", "advertising",
  "circular", "servicecall", "syllabus", "mess", "thought", "homework", "medical",
  "visitor", "gallery", "balbank", "youtubevideo", "sendsms", "chartfilling",
  "dailydairy", "copycorrection", "usermanagement",
  "complaintdetails", "appoinmentdetails", "importantsms"
];

const allActions = ["view", "edit", "submit"];

const AddUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedActions, setSelectedActions] = useState({ view: false, edit: false, submit: false });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    usertype: "",
    status: "",
    userfullname: "",
    userimg: null,
  });

  const convertAuthoritiesForAPI = () => {
    return selectedModules.map(module => ({
      module,
      actions: Object.entries(selectedActions).filter(([_, v]) => v).map(([a]) => a)
    }));
  };

  const resetForm = () => {
    setFormData({ username: "", password: "", usertype: "", status: "", userfullname: "", userimg: null });
    setSelectedModules([]);
    setSelectedActions({ view: false, edit: false, submit: false });
    setEditingId(null);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setData(response.data || []);
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    const modList = [];
    const actionMap = { view: false, edit: false, submit: false };
    (user.authorities || []).forEach(({ module, actions }) => {
      modList.push(module);
      actions.forEach(a => actionMap[a] = true);
    });

    setEditingId(user._id);
    setSelectedModules(modList);
    setSelectedActions(actionMap);
    setFormData({
      username: user.username || "",
      password: "",
      usertype: user.usertype || "",
      status: user.status || "",
      userfullname: user.userfullname || "",
      userimg: null,
    });
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    Object.entries({ ...formData, authorities: JSON.stringify(convertAuthoritiesForAPI()) })
      .forEach(([key, val]) => {
        if (key === 'userimg' && val) payload.append("userimg", val);
        else if (key !== 'userimg') payload.append(key, val);
      });

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/update-user/${editingId}`, payload);
        setSuccess("User updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/create-user`, payload);
        setSuccess("User created successfully");
      }
      fetchData();
      resetForm();
    } catch {
      setError("Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BASE_URL}/api/delete-user/${id}`);
        setSuccess("User deleted successfully");
        fetchData();
      } catch {
        setError("Failed to delete user");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleActionChange = (e) => {
    const { name, checked } = e.target;
    setSelectedActions(prev => ({ ...prev, [name]: checked }));
  };

  const handleModuleChange = (mod) => {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, i) => i + 1 },
    { name: "Username", selector: row => row.username },
    { name: "Full Name", selector: row => row.userfullname },
    { name: "User Type", selector: row => row.usertype },
    { name: "Status", selector: row => row.status },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={handleSubmit}><FaSave /></button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}><FaEdit /></button>
          )}
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></button>
        </div>
      )
    },
  ];

  const breadcrumbItems = [
    { label: "User Management", link: "/userManagement/all-module" },
    { label: "Add User", link: "null" }
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className="mt-1 mb-1">
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>
      <section>
        <Container>
          {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}
          {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
          <div className="cover-sheet">
            <div className="studentHeading"><h2>{editingId ? "Edit User" : "Add New User"}</h2></div>
            <Form className="formSheet">
              <Row className="mb-3">
                <Col><FormLabel>Username</FormLabel><FormControl name="username" value={formData.username} onChange={handleChange} /></Col>
                <Col><FormLabel>Password</FormLabel><FormControl name="password" type="password" value={formData.password} onChange={handleChange} placeholder={editingId ? "Leave blank" : ""} /></Col>
              </Row>
              <Row className="mb-3">
                <Col><FormLabel>User Type</FormLabel><FormSelect name="usertype" value={formData.usertype} onChange={handleChange}><option value="">Select</option><option value="fees">Fees</option><option value="other">Other</option></FormSelect></Col>
                <Col><FormLabel>Status</FormLabel><FormSelect name="status" value={formData.status} onChange={handleChange}><option value="">Select</option><option value="active">Active</option><option value="deactive">Deactive</option></FormSelect></Col>
              </Row>
              <Row className="mb-3">
                <Col><FormLabel>Full Name</FormLabel><FormControl name="userfullname" value={formData.userfullname} onChange={handleChange} /></Col>
                <Col><FormLabel>Upload Image</FormLabel><FormControl name="userimg" type="file" onChange={handleChange} /></Col>
              </Row>
              <hr />
              <h5 className="mt-4">Select Actions</h5>
              <Row className="mb-3">
                {allActions.map(act => (
                  <Col lg={2} key={act}>
                    <Form.Check
                      type="checkbox"
                      label={act}
                      name={act}
                      checked={selectedActions[act] || false}
                      onChange={handleActionChange}
                    />
                  </Col>
                ))}
              </Row>
              <h5>Select Modules</h5>
              <Row>
                {allModules.map(mod => (
                  <Col lg={3} key={mod} className="mb-2">
                    <Form.Check
                      label={mod.toUpperCase()}
                      checked={selectedModules.includes(mod)}
                      onChange={() => handleModuleChange(mod)}
                    />
                  </Col>
                ))}
              </Row>

              <Button className="mt-3" onClick={handleSubmit}>{editingId ? "Update User" : "Add User"}</Button>
            </Form>
          </div>
          <hr />
          <div className="tableSheet">
            <h2>Existing Users</h2>
            {
              loading ? <p>Loading...</p> : <Table columns={columns} data={data} />
            }

          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddUser), { ssr: false });
