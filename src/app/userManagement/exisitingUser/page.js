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
import { toast } from "react-toastify";

const allModules = [
  "masterentry", "students", "transport", "stock", "library", "fees", "hrd", "frontoffice", "studentattendance",
  "exams", "notice", "accounts", "advertising", "thought", "medical", "gallery",
  "circular", "servicecall", "syllabus", "timetable", "mess", "homework", "copycorrection",
  "visitor", "balbank", "youtubevideo", "events", "hostel", "sendsms", "chartfilling",
  "dailydairy", "complaintdetails", "appoinmentdetails", "importantsms", "usermanagement",
];

const allActions = ["view", "edit", "submit"];

const ExistingUser = () => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    usertype: "",
    status: "",
    userfullname: "",
    userimg: null,
  });
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedActions, setSelectedActions] = useState({ view: false, edit: false, submit: false });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch Users")
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const convertAuthoritiesForAPI = () => {
    return selectedModules.map(module => ({
      module,
      actions: Object.entries(selectedActions).filter(([_, v]) => v).map(([a]) => a)
    }));
  };

  const handleEdit = (user) => {
    const authorities = user.authorities || [];
    const modList = authorities.map(a => a.module);
    const actMap = { view: false, edit: false, submit: false };
    authorities.forEach(a => a.actions.forEach(act => actMap[act] = true));

    setFormData({
      username: user.username || "",
      password: "",
      usertype: user.usertype || "",
      status: user.status || "",
      userfullname: user.userfullname || "",
      userimg: null,
    });
    setEditingId(user._id);
    setSelectedModules(modList);
    setSelectedActions(actMap);
  };

  const handleUpdate = async () => {
    const payload = new FormData();
    payload.append("username", formData.username);
    if (formData.password) payload.append("password", formData.password);
    payload.append("usertype", formData.usertype);
    payload.append("status", formData.status);
    payload.append("userfullname", formData.userfullname);
    if (formData.userimg) payload.append("userimg", formData.userimg);
    payload.append("authorities", JSON.stringify(convertAuthoritiesForAPI()));

    try {
      await axios.put(`${BASE_URL}/api/update-user/${editingId}`, payload);
      setSuccess("User updated successfully.");
      toast.success("User updated successfully.");
      resetForm();
      fetchData();
    } catch (err) {
      toast.error("Failed to update user")
      setError("Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await axios.delete(`${BASE_URL}/api/delete-user/${id}`);
        setSuccess("User deleted.");
        fetchData();
      } catch {
        setError("Delete failed.");
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

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: "",
      password: "",
      usertype: "",
      status: "",
      userfullname: "",
      userimg: null,
    });
    setSelectedModules([]);
    setSelectedActions({ view: false, edit: false, submit: false });
  };

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
            <button className="editButton" onClick={handleUpdate}><FaSave /></button>
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
    { label: "Existing User", link: "null" },
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

          {editingId && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading"><h2>Edit User</h2></div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col><FormLabel>Username</FormLabel><FormControl name="username" value={formData.username} onChange={handleChange} /></Col>
                  <Col><FormLabel>Password</FormLabel><FormControl name="password" value={formData.password} type="password" onChange={handleChange} placeholder="Leave blank if unchanged" /></Col>
                </Row>
                <Row className="mb-3">
                  <Col><FormLabel>User Type</FormLabel><FormSelect name="usertype" value={formData.usertype} onChange={handleChange}><option value="">Select</option><option value="fees">Fees</option><option value="other">Other</option></FormSelect></Col>
                  <Col><FormLabel>Status</FormLabel><FormSelect name="status" value={formData.status} onChange={handleChange}><option value="">Select</option><option value="active">Active</option><option value="deactive">Deactive</option></FormSelect></Col>
                </Row>
                <Row className="mb-3">
                  <Col><FormLabel>Full Name</FormLabel><FormControl name="userfullname" value={formData.userfullname} onChange={handleChange} /></Col>
                  <Col><FormLabel>Upload Image</FormLabel><FormControl name="userimg" type="file" onChange={handleChange} /></Col>
                </Row>

                <h5>Authorities</h5>
                <Row className="mb-3">
                  {allActions.map(action => (
                    <Col lg={2} key={action}>
                      <Form.Check type="checkbox" label={action} name={action} checked={selectedActions[action] || false} onChange={handleActionChange} />
                    </Col>
                  ))}
                </Row>

                <Row>
                  {allModules.map(module => (
                    <Col lg={3} key={module}>
                      <Form.Check type="checkbox" label={module.toUpperCase()} checked={selectedModules.includes(module)} onChange={() => handleModuleChange(module)} />
                    </Col>
                  ))}
                </Row>

                <div className="mt-3">
                  <Button onClick={handleUpdate}>Update User</Button>
                  <Button variant="secondary" className=" ms-2" onClick={resetForm}>Cancel</Button>
                </div>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Existing User Records</h2>
            {loading ? <p>Loading...</p> : (
              <Table columns={columns} data={data} />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExistingUser), { ssr: false });
