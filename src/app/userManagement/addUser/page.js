"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { CgAddR } from 'react-icons/cg';
import { FaEdit, FaTrashAlt } from "react-icons/fa";
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
import usePagePermission from "@/hooks/usePagePermission";
import { toast } from "react-toastify";

const allModules = [
  "masterentry", "students", "transport", "stock", "library", "fees", "hrd", "frontoffice", "studentattendance",
  "exam", "notice", "accounts", "advertising", "thought", "medical", "gallery", "servicecall", "syllabus",
  "timetable", "homework", "copycorrection", "balbank", "youtubevideo", "events", "hostel", "sendsms", "chartfilling",
  "visitordetails", "dailydairy", "complaintdetails", "appoinmentdetails", "importantsms", "usermanagement", "websitemanagement"
];

const allActions = ["view", "edit", "submit"];

const AddUser = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const { authorities: userAuthorities } = useSelector((state) => state.auth);

  const [data, setData] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Compute allowedModules & allowedActions based on authorities
  const allowedModules = formData.usertype === "superadmin"
    ? allModules
    : Object.keys(userAuthorities || {});

  const allowedActions = formData.usertype === "superadmin"
    ? allActions
    : Array.from(new Set(Object.values(userAuthorities || {}).flat()));

  // Decide what to render for modules/actions
  const visibleModules = formData.usertype === "superadmin"
    ? allModules
    : allModules.filter(mod => allowedModules.includes(mod));

  const visibleActions = formData.usertype === "superadmin"
    ? allActions
    : allActions.filter(act => allowedActions.includes(act));

  const convertAuthoritiesForAPI = () => {
    let authorities = selectedModules.map(module => ({
      module,
      actions: Object.entries(selectedActions)
        .filter(([action, selected]) => selected)
        .map(([action]) => action)
    })).filter(item => item.actions.length > 0);

    if (formData.usertype === "superadmin") {
      authorities = authorities.filter(a => a.module !== "usermanagement");
      authorities.push({ module: "usermanagement", actions: allActions });
    }

    return authorities;
  };


  const resetForm = () => {
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
      if (allModules.includes(module)) {
        modList.push(module);
        actions.forEach(a => {
          if (allActions.includes(a)) {
            actionMap[a] = true;
          }
        });
      }
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
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return false;
    }
    if (!editingId && !formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (!formData.usertype) {
      toast.error("User type is required");
      return false;
    }
    if (!formData.status) {
      toast.error("Status is required");
      return false;
    }
    if (!formData.userfullname.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!selectedModules.length) {
      toast.error("Please select at least one module");
      return false;
    }
    if (!Object.values(selectedActions).some(v => v)) {
      toast.error("Please select at least one action");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = new FormData();
    if (formData.password) payload.append("password", formData.password);
    payload.append("username", formData.username);
    payload.append("usertype", formData.usertype);
    payload.append("status", formData.status);
    payload.append("userfullname", formData.userfullname);
    payload.append("authorities", JSON.stringify(convertAuthoritiesForAPI()));
    if (formData.userimg) payload.append("userimg", formData.userimg);

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/update-user/${editingId}`, payload);
        toast.success("User updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/create-user`, payload);
        toast.success("User created successfully");
      }
      fetchData();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user.");
      setError(err.response?.data?.message || "Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BASE_URL}/api/delete-user/${id}`);
        toast.success("User deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete user.");
        setError(err.response?.data?.message || "Failed to delete user.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "file" ? files[0] : value }));
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

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Username", selector: row => row.username },
    { name: "Full Name", selector: row => row.userfullname },
    { name: "User Type", selector: row => row.usertype },
    { name: "Status", selector: row => row.status },
    // hasEditAccess && {
    //   name: "Actions",
    //   cell: (row) => (
    //     <div className="d-flex gap-1">
    //       <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
    //         <FaEdit />
    //       </Button>
    //       <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
    //         <FaTrashAlt />
    //       </Button>
    //     </div>
    //   )
    // },
  ].filter(Boolean);

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

          {hasSubmitAccess && (
            <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="btn-add">
              <CgAddR />Add New User
            </Button>
          )}

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingId ? "Edit User" : "Add New User"}</h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => { resetForm(); setIsFormOpen(false); }}
                ></button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col>
                    <FormLabel>Username</FormLabel>
                    <FormControl name="username" value={formData.username} onChange={handleChange} />
                  </Col>
                  <Col>
                    <FormLabel>Password</FormLabel>
                    <FormControl
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={editingId ? "Leave blank to keep existing password" : ""}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <FormLabel>User Type</FormLabel>
                    <FormSelect name="usertype" value={formData.usertype} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="fees">Fees</option>
                      <option value="other">Other</option>
                      <option value="superadmin">Superadmin</option>
                      <option value="admin">Admin</option>
                    </FormSelect>
                  </Col>
                  <Col>
                    <FormLabel>Status</FormLabel>
                    <FormSelect name="status" value={formData.status} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="deactive">Deactive</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl name="userfullname" value={formData.userfullname} onChange={handleChange} />
                  </Col>
                  <Col>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl name="userimg" type="file" onChange={handleChange} />
                  </Col>
                </Row>
                <hr />
                <h5 className="mt-4">Select Actions</h5>
                <Row className="mb-3">
                  {visibleActions.map(act => (
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
                  {visibleModules.map(mod => (
                    <Col lg={3} key={mod} className="mb-2">
                      <Form.Check
                        label={mod.charAt(0).toUpperCase() + mod.slice(1).toLowerCase()}
                        checked={selectedModules.includes(mod)}
                        onChange={() => handleModuleChange(mod)}
                      />
                    </Col>
                  ))}
                </Row>
                <Button className="mt-3" onClick={handleSubmit}>
                  {editingId ? "Update User" : "Add User"}
                </Button>
              </Form>
            </div>
          )}
          <hr />
          <div className="tableSheet">
            <h2>Existing Users</h2>
            {loading ? <p>Loading...</p> : <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddUser), { ssr: false });
