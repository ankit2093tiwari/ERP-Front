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
import { useSelector } from "react-redux";
import usePagePermission from "@/hooks/usePagePermission";

const ExistingUser = () => {
  const { hasEditAccess } = usePagePermission();
  const userAuthorities = useSelector((state) => state.auth.authorities);
  const userType = useSelector((state) => state.auth.user.usertype);


  const isSuperAdmin = userType === "superadmin";

  // Constants for superadmin
  const allModules = [
    "masterentry", "students", "transport", "stock", "library", "fees", "hrd", "frontoffice", "studentattendance",
    "exam", "notice", "accounts", "advertising", "thought", "medical", "gallery",
    "servicecall", "syllabus", "timetable", "homework", "copycorrection",
    "balbank", "youtubevideo", "events", "hostel", "sendsms", "chartfilling", "visitordetails",
    "dailydairy", "complaintdetails", "appoinmentdetails", "importantsms", "usermanagement", "websitemanagement"
  ];
  const allActions = ["view", "edit", "submit"];

  const allowedModules = isSuperAdmin ? allModules : Object.keys(userAuthorities);
  const allowedActions = isSuperAdmin
    ? allActions
    : Array.from(new Set(Object.values(userAuthorities).flat()));

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
  const [selectedActions, setSelectedActions] = useState({
    view: false,
    edit: false,
    submit: false,
    delete: false,
    export: false,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setData(res.data || []);
    } catch {
      toast.error("Failed to fetch users");
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const convertAuthoritiesForAPI = () =>
    selectedModules
      .map((module) => ({
        module,
        actions: Object.entries(selectedActions)
          .filter(([_, checked]) => checked)
          .map(([action]) => action),
      }))
      .filter(({ actions }) => actions.length > 0);

  const handleEdit = (user) => {
    const authorities = user.authorities || [];
    const modList = authorities.map((a) => a.module);
    const actMap = { view: false, edit: false, submit: false, delete: false, export: false };
    authorities.forEach((a) =>
      a.actions.forEach((act) => {
        actMap[act] = true;
      })
    );
    if (isSuperAdmin && !modList.includes("usermanagement")) {
      modList.push("usermanagement");
    }

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
    if (!editingId) return;

    const authoritiesPayload = convertAuthoritiesForAPI();
    if (authoritiesPayload.length === 0) {
      toast.error("Please select at least one module with actions.");
      return;
    }

    const payload = new FormData();
    payload.append("username", formData.username);
    if (formData.password) payload.append("password", formData.password);
    payload.append("usertype", formData.usertype);
    payload.append("status", formData.status);
    payload.append("userfullname", formData.userfullname);
    if (formData.userimg) payload.append("userimg", formData.userimg);
    payload.append("authorities", JSON.stringify(authoritiesPayload));

    try {
      await axios.put(`${BASE_URL}/api/update-user/${editingId}`, payload);
      toast.success("User updated successfully.");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BASE_URL}/api/delete-user/${id}`);
        toast.success("User deleted.");
        fetchData();
      } catch (error) {
        console.error("failed to delete User:", error);
        toast.error(error.response?.data?.message || "Failed to delete user.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleActionChange = (e) => {
    const { name, checked } = e.target;
    setSelectedActions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleModuleChange = (mod) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
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
    setSelectedActions({ view: false, edit: false, submit: false, delete: false, export: false });
  };

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Username", selector: (row) => row.username },
    { name: "Full Name", selector: (row) => row.userfullname },
    { name: "User Type", selector: (row) => row.usertype },
    { name: "Status", selector: (row) => row.status },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size='sm' variant="success" className="me-1" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const breadcrumbItems = [
    { label: "User Management", link: "/userManagement/all-module" },
    { label: "Existing User", link: null },
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
          {success && (
            <Alert
              variant="success"
              onClose={() => setSuccess("")}
              dismissible
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert
              variant="danger"
              onClose={() => setError("")}
              dismissible
            >
              {error}
            </Alert>
          )}

          {editingId && (
            <div className="cover-sheet mb-4">
              <div className="studentHeading d-flex justify-content-between align-items-center">
                <h2>Edit User</h2>
                {isSuperAdmin && <span className="badge bg-primary">Superadmin Mode</span>}
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col>
                    <FormLabel>Username <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col>
                    <FormLabel>Password </FormLabel>
                    <FormControl
                      name="password"
                      value={formData.password}
                      type="password"
                      onChange={handleChange}
                      placeholder="Leave blank if unchanged"
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <FormLabel>User Type <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="usertype"
                      value={formData.usertype}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="admin">Admin</option>
                      <option value="fees">Fees</option>
                      <option value="other">Other</option>
                    </FormSelect>
                  </Col>
                  <Col>
                    <FormLabel>Status <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="active">Active</option>
                      <option value="deactive">Deactive</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <FormLabel>Full Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="userfullname"
                      value={formData.userfullname}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl
                      name="userimg"
                      type="file"
                      onChange={handleChange}
                      placeholder="Choose file"
                    />
                  </Col>
                </Row>

                <h5>Authorities <span className="text-danger">*</span></h5>
                {allowedActions.length > 0 ? (
                  <>
                    <Row className="mb-3">
                      {allowedActions.map((action) => (
                        <Col lg={2} key={action}>
                          <Form.Check
                            type="checkbox"
                            label={action}
                            name={action}
                            checked={selectedActions[action] || false}
                            onChange={handleActionChange}
                          />
                        </Col>
                      ))}
                    </Row>
                    <Row>
                      {allowedModules.map((module) => (
                        <Col lg={3} key={module}>
                          <Form.Check
                            type="checkbox"
                            label={
                              module.charAt(0).toUpperCase() +
                              module.slice(1).toLowerCase()
                            }
                            checked={selectedModules.includes(module)}
                            onChange={() => handleModuleChange(module)}
                          />
                        </Col>
                      ))}
                    </Row>
                  </>
                ) : (
                  <Alert variant="info">
                    You do not have any modules assigned.
                  </Alert>
                )}

                <div className="mt-3">
                  <Button onClick={handleUpdate} variant="success">Update User</Button>
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Existing User Records</h2>
              {isSuperAdmin && <span className="badge bg-primary">Superadmin Mode</span>}
            </div>
            {loading ? <p>Loading...</p> : <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExistingUser), { ssr: false });
