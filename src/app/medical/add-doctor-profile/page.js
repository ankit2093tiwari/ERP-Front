"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
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
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [specialistOptions, setSpecialistOptions] = useState([]);
  const [formData, setFormData] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState({
    doctor_name: "",
    mobile_no: "",
    email_id: "",
    address: "",
    specialist: "",
    description: "",
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Doctor Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.doctor_name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, doctor_name: e.target.value })
            }
          />
        ) : (
          row.doctor_name || "N/A"
        ),
    },
    {
      name: "Mobile No",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.mobile_no}
            onChange={(e) =>
              setEditFormData({ ...editFormData, mobile_no: e.target.value })
            }
          />
        ) : (
          row.mobile_no || "N/A"
        ),
    },
    {
      name: "Email ID",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="email"
            value={editFormData.email_id}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email_id: e.target.value })
            }
          />
        ) : (
          row.email_id || "N/A"
        ),
    },
    {
      name: "Address",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.address}
            onChange={(e) =>
              setEditFormData({ ...editFormData, address: e.target.value })
            }
          />
        ) : (
          row.address || "N/A"
        ),
    },
    {
      name: "Specialist",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editFormData.specialist}
            onChange={(e) =>
              setEditFormData({ ...editFormData, specialist: e.target.value })
            }
          >
            <option value="">Select</option>
            {specialistOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {option.check_up_type}
              </option>
            ))}
          </FormSelect>
        ) : (
          row.specialist?.check_up_type || "N/A"
        ),
    },
    {
      name: "Description",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            as="textarea"
            value={editFormData.description}
            onChange={(e) =>
              setEditFormData({ ...editFormData, description: e.target.value })
            }
          />
        ) : (
          row.description || "N/A"
        ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setEditingId(null)}
              >
                <FaTimes />
              </Button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllDoctors()
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
      const res = await getAllCheckupTypes()
      setSpecialistOptions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load specialist options");
    }
  };

  const handleEdit = (doctor) => {
    setEditingId(doctor._id);
    setEditFormData({
      doctor_name: doctor.doctor_name || "",
      mobile_no: doctor.mobile_no || "",
      email_id: doctor.email_id || "",
      address: doctor.address || "",
      specialist: doctor.specialist?._id || "",
      description: doctor.description || "",
    });
  };

  const handleUpdate = async (id) => {
    const { doctor_name, mobile_no, email_id, specialist, address } = editFormData;

    if (!doctor_name.trim() || !mobile_no.trim() || !email_id.trim() || !specialist || !address.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
      toast.error("Enter valid email address.");
      return;
    }

    try {
      const response = await updateDoctorProfileById(id, editFormData);
      toast.success(response?.message || "Profile updated successfully");
      fetchData();
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteDoctorProfileById(id)
        toast.success("Doctor deleted");
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Delete failed");
      }
    }
  };

  const handleAdd = async () => {
    const { doctor_name, mobile_no, email_id, address, specialist } = formData;
    let errors = {};

    if (!doctor_name.trim()) errors.doctor_name = "doctor name is required";
    else if (!/^[a-zA-Z\s]+$/.test(doctor_name)) errors.doctor_name = "Only letters";

    if (!mobile_no.trim()) errors.mobile_no = "mobile no. is required";
    else if (!/^\d{10}$/.test(mobile_no)) errors.mobile_no = "10 digit number";

    if (!email_id.trim()) errors.email_id = "email id is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) errors.email_id = "Invalid email";

    if (!address.trim()) errors.address = "address is required";
    if (!specialist) errors.specialist = "Select a specialist";

    if (Object.keys(errors).length) {
      setFieldError(errors);
      return;
    }

    try {
      const exists = data.find((doc) => doc.email_id === email_id);
      if (exists) {
        toast.error("Email already exists");
        return;
      }

      const response = await addNewDoctorProfile(formData);
      toast.success(response?.message || "Doctor added");
      fetchData();
      setFormData({
        doctor_name: "",
        mobile_no: "",
        email_id: "",
        address: "",
        specialist: "",
        description: "",
      });
      setIsPopoverOpen(false);
      setFieldError({});
    } catch (err) {
      console.error(err);
      toast.error("Add failed");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Doctor Name", "Mobile", "Email", "Address", "Specialist", "Description"]];
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

  useEffect(() => {
    fetchData();
    fetchSpecialists();
  }, []);

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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Doctor Profile
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Doctor</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>

              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Doctor Name<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => {
                        setFormData({ ...formData, doctor_name: e.target.value });
                        if (fieldError.doctor_name) setFieldError((prev) => ({ ...prev, doctor_name: "" }));
                      }}
                      isInvalid={!!fieldError.doctor_name}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError.doctor_name}</Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Mobile No<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={formData.mobile_no}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile_no: e.target.value });
                        if (fieldError.mobile_no) setFieldError((prev) => ({ ...prev, mobile_no: "" }));
                      }}
                      isInvalid={!!fieldError.mobile_no}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError.mobile_no}</Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Email ID<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="email"
                      value={formData.email_id}
                      onChange={(e) => {
                        setFormData({ ...formData, email_id: e.target.value });
                        if (fieldError.email_id) setFieldError((prev) => ({ ...prev, email_id: "" }));
                      }}
                      isInvalid={!!fieldError.email_id}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError.email_id}</Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Address<span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (fieldError.address) setFieldError((prev) => ({ ...prev, address: "" }));
                      }}
                      isInvalid={!!fieldError.address}
                    />
                    <Form.Control.Feedback type="invalid">{fieldError.address}</Form.Control.Feedback>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Specialist<span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formData.specialist}
                      onChange={(e) => {
                        setFormData({ ...formData, specialist: e.target.value });
                        if (fieldError.specialist) setFieldError((prev) => ({ ...prev, specialist: "" }));
                      }}
                      isInvalid={!!fieldError.specialist}
                    >
                      <option value="">Select</option>
                      {specialistOptions.map((s) => (
                        <option key={s._id} value={s._id}>{s.check_up_type}</option>
                      ))}
                    </FormSelect>
                    <Form.Control.Feedback type="invalid">{fieldError.specialist}</Form.Control.Feedback>
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Description</FormLabel>
                    <FormControl
                      as="textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Col>
                </Row>

                <Button onClick={handleAdd} className="btn btn-primary">Add Doctor</Button>
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
