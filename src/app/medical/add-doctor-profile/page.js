"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Alert,
  FormSelect,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewDoctorProfile,
  deleteDoctorProfileById,
  getAllCheckupTypes,
  getAllDoctors,
  updateDoctorProfileById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AddDoctorProfile = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [specialistOptions, setSpecialistOptions] = useState([]);
  const [formData, setFormData] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    { name: "Doctor Name", selector: (row) => row.doctor_name || "N/A" },
    { name: "Mobile No", selector: (row) => row.mobile_no || "N/A" },
    { name: "Email ID", selector: (row) => row.email_id || "N/A" },
    { name: "Address", selector: (row) => row.address || "N/A" },
    {
      name: "Specialist",
      selector: (row) => row.specialist?.check_up_type || "N/A",
    },
    { name: "Description", selector: (row) => row.description || "N/A" },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
    fetchSpecialists();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllDoctors();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const res = await getAllCheckupTypes();
      setSpecialistOptions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load specialist options");
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentDoctorId(null);
    setFormData({
      doctor_name: "",
      mobile_no: "",
      email_id: "",
      address: "",
      specialist: "",
      description: "",
    });
    setFieldError({});
    setIsFormOpen(true);
  };

  const handleEdit = (doctor) => {
    setIsEditing(true);
    setCurrentDoctorId(doctor._id);
    setFormData({
      doctor_name: doctor.doctor_name || "",
      mobile_no: doctor.mobile_no || "",
      email_id: doctor.email_id || "",
      address: doctor.address || "",
      specialist: doctor.specialist?._id || "",
      description: doctor.description || "",
    });
    setFieldError({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const { doctor_name, mobile_no, email_id, address, specialist } = formData;
    let errors = {};

    if (!doctor_name.trim()) errors.doctor_name = "Doctor name is required";
    else if (!/^[a-zA-Z\s]+$/.test(doctor_name))
      errors.doctor_name = "Only letters allowed";

    if (!mobile_no.trim()) errors.mobile_no = "Mobile number is required";
    else if (!/^\d{10}$/.test(mobile_no))
      errors.mobile_no = "Must be 10 digits";

    if (!email_id.trim()) errors.email_id = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id))
      errors.email_id = "Invalid email format";

    if (!address.trim()) errors.address = "Address is required";
    if (!specialist) errors.specialist = "Specialist is required";

    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (fieldError[name]) {
      setFieldError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing) {
        const response = await updateDoctorProfileById(
          currentDoctorId,
          formData
        );
        toast.success(response?.message || "Doctor updated successfully");
      } else {
        const exists = data.some((doc) => doc.email_id === formData.email_id);
        if (exists) {
          toast.error("Email already exists");
          return;
        }
        const response = await addNewDoctorProfile(formData);
        toast.success(response?.message || "Doctor added successfully");
      }
      fetchData();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditing ? "update" : "add"} doctor`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      try {
        await deleteDoctorProfileById(id);
        toast.success("Doctor deleted successfully");
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete doctor");
      }
    }
  };

  const handlePrint = () => {
    const headers = [
      ["#", "Doctor Name", "Mobile", "Email", "Address", "Specialist", "Description"]
    ];
    const rows = data.map((row, i) => [
      i + 1,
      row.doctor_name || "N/A",
      row.mobile_no || "N/A",
      row.email_id || "N/A",
      row.address || "N/A",
      row.specialist?.check_up_type || "N/A",
      row.description || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Doctor Name", "Mobile", "Email", "Address", "Specialist", "Description"];
    const rows = data.map((row, i) =>
      `${i + 1}\t${row.doctor_name || "N/A"}\t${row.mobile_no || "N/A"}\t${row.email_id || "N/A"}\t${row.address || "N/A"}\t${row.specialist?.check_up_type || "N/A"}\t${row.description || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Add Doctor Profile", link: "null" },
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
          {hasSubmitAccess && (
            <Button onClick={handleAddClick} className="btn-add">
              <CgAddR /> Add Doctor Profile
            </Button>
          )}

          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{isEditing ? "Edit Doctor" : "Add New Doctor"}</h2>
                <button 
                  className="closeForm" 
                  onClick={() => setIsFormOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Doctor Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="doctor_name"
                      type="text"
                      value={formData.doctor_name}
                      onChange={handleInputChange}
                      isInvalid={!!fieldError.doctor_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError.doctor_name}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Mobile No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="mobile_no"
                      type="text"
                      value={formData.mobile_no}
                      onChange={handleInputChange}
                      isInvalid={!!fieldError.mobile_no}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError.mobile_no}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Email ID<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="email_id"
                      type="email"
                      value={formData.email_id}
                      onChange={handleInputChange}
                      isInvalid={!!fieldError.email_id}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError.email_id}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Address<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      isInvalid={!!fieldError.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError.address}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Specialist<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      name="specialist"
                      value={formData.specialist}
                      onChange={handleInputChange}
                      isInvalid={!!fieldError.specialist}
                    >
                      <option value="">Select</option>
                      {specialistOptions.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.check_up_type}
                        </option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">
                      {fieldError.specialist}
                    </Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Description</FormLabel>
                    <FormControl
                      name="description"
                      as="textarea"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <div className="d-flex gap-1">
                  <Button variant="success" onClick={handleSubmit} >
                    {isEditing ? "Update Doctor" : "Add Doctor"}
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Doctor Records</h2>
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

export default dynamic(() => Promise.resolve(AddDoctorProfile), { ssr: false });