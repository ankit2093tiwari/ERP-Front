"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { addNewAppointment, deleteAppointmentById, getAllAppointments, getAllEmployee } from "@/Services";
import { copyContent, printContent } from "../utils";
import usePagePermission from "@/hooks/usePagePermission";
import { CgAddR } from "react-icons/cg";

const ScheduleAppointment = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission()

  const [appointments, setAppointments] = useState([]);
  const [errors, setErrors] = useState({});
  const [employee, setEmployee] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    whomToMeet: "",
    emailId: "",
    mobileNo: "",
    purpose: "",
    address: "",
    from: "",
    to: "",
    remark: "",
  });

  const fetchAppointmentData = async () => {
    const response = await getAllAppointments();
    setAppointments(response?.data)
  }
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const res = await getAllEmployee();
      setEmployee(res?.data || []);
    };
    fetchEmployeeData();
    fetchAppointmentData()
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const isAddressValid = (address) => {
    return /[a-zA-Z]/.test(address);
  };

  const isTimeValid = (fromTime, toTime) => {
    if (!fromTime || !toTime) return false;
    const [fromHours, fromMinutes] = fromTime.split(":"),
      [toHours, toMinutes] = toTime.split(":"),
      from = parseInt(fromHours) * 60 + parseInt(fromMinutes),
      to = parseInt(toHours) * 60 + parseInt(toMinutes),
      diff = to - from;
    return diff >= 10 && diff <= 60;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.whomToMeet) newErrors.whomToMeet = "Select whom to meet";
    if (!formData.emailId || !/\S+@\S+\.\S+/.test(formData.emailId)) newErrors.emailId = "Valid Email is required";
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo)) newErrors.mobileNo = "Valid 10-digit mobile number is required";
    if (!formData.purpose) newErrors.purpose = "Purpose is required";
    if (!formData.address || !isAddressValid(formData.address)) newErrors.address = "Address is required";
    if (!formData.from) newErrors.from = "Start time is required";
    if (!formData.to) newErrors.to = "End time is required";
    else if (!isTimeValid(formData.from, formData.to)) newErrors.to = "Time should be between 10 minutes to 1 hour";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      name: "",
      whomToMeet: "",
      emailId: "",
      mobileNo: "",
      purpose: "",
      address: "",
      from: "",
      to: "",
      remark: "",
    });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addNewAppointment(formData);
      fetchAppointmentData()
      toast.success("Appointment scheduled successfully");
      resetForm()
      setIsFormOpen(false)
    } catch (error) {
      console.error('failed to schedule appointment!', error)
      toast.error(error.response?.data?.message || "Failed to schedule appointment");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!confirm("Are you sure want to delete appointment?")) return
      const res = await deleteAppointmentById(id)
      toast.success("Appointment deleted");
      fetchAppointmentData()
    } catch (error) {
      console.error('failed to delete appointment', error)
      toast.error("failed to delete appointment");
    }

  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "60px" },
    { name: "Date", selector: (row) => new Date(row.date).toLocaleDateString() },
    { name: "Name", selector: (row) => row.name },
    {
      name: "Whom to Meet",
      selector: (row) => {
        return row.whomToMeet.employee_name || "Unknown";
      },
    },
    { name: "Email", selector: (row) => row.emailId },
    { name: "Mobile No", selector: (row) => row.mobileNo },
    { name: "Purpose", selector: (row) => row.purpose },
    { name: "Address", selector: (row) => row.address },
    {
      name: "Time Duration",
      selector: (row) => `${row.from} - ${row.to}`,
    },
    { name: "Remark", selector: (row) => row.remark },
    hasEditAccess && {
      name: "Actions",
      cell: (row, index) => (
        <div className="d-flex gap-1">
          {/* <Button size="sm" variant="success" className="me-1"><FaEdit /></Button> */}
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const handleCopy = () => {
    const headers = [
      "#", "Date", "Name", "Phone", "Whom to Meet", "Time Duration"
    ]
    const rows = appointments.map((row, index) => (
      [index + 1, new Date(row.date).toLocaleDateString() || "N/A", row.name || "N/A", row.mobileNo || "N/A", row.whomToMeet.employee_name || "N/A", `${row.from} - ${row.to}` || "N/A",].join('\t')
    ))
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [
      ["#", "Date", "Name", "Phone", "Whom to Meet", "Time Duration"]
    ]
    const rows = appointments.map((row, index) => (
      [index + 1, new Date(row.date).toLocaleDateString() || "N/A", row.name || "N/A", row.mobileNo || "N/A", row.whomToMeet.employee_name || "N/A", `${row.from} - ${row.to}` || "N/A",]
    ))
    printContent(headers, rows)
  }


  const breadcrumbItems = [
    { label: "Appointments", link: "null" },
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
            <Button onClick={() => setIsFormOpen(true)} className="btn-add">
              <CgAddR /> Add New Appointment
            </Button>
          )}
          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Schedule Appointment</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm()
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Date<span className="text-danger">*</span></FormLabel>
                    <FormControl type="date" name="date" value={formData.date} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Name<span className="text-danger">*</span></FormLabel>
                    <FormControl name="name" value={formData.name} onChange={handleChange} isInvalid={!!errors.name} />
                    <FormControl.Feedback type="invalid">{errors.name}</FormControl.Feedback>
                  </FormGroup>
                </Row>

                <Row className="mb-3">
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Whom to Meet<span className="text-danger">*</span></FormLabel>
                    <FormSelect name="whomToMeet" value={formData.whomToMeet} onChange={handleChange} isInvalid={!!errors.whomToMeet}>
                      <option value="">Select</option>
                      {employee.map((e) => (
                        <option key={e._id} value={e._id}>{e.employee_name}({e?.designation_name?.designation_name})</option>
                      ))}
                    </FormSelect>
                    <FormControl.Feedback type="invalid">{errors.whomToMeet}</FormControl.Feedback>
                  </FormGroup>
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Email ID<span className="text-danger">*</span></FormLabel>
                    <FormControl type="email" name="emailId" value={formData.emailId} onChange={handleChange} isInvalid={!!errors.emailId} />
                    <FormControl.Feedback type="invalid">{errors.emailId}</FormControl.Feedback>
                  </FormGroup>
                </Row>

                <Row className="mb-3">
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Mobile No<span className="text-danger">*</span></FormLabel>
                    <FormControl name="mobileNo" value={formData.mobileNo} onChange={handleChange} isInvalid={!!errors.mobileNo} />
                    <FormControl.Feedback type="invalid">{errors.mobileNo}</FormControl.Feedback>
                  </FormGroup>
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Purpose<span className="text-danger">*</span></FormLabel>
                    <FormControl name="purpose" value={formData.purpose} onChange={handleChange} isInvalid={!!errors.purpose} />
                    <FormControl.Feedback type="invalid">{errors.purpose}</FormControl.Feedback>
                  </FormGroup>
                </Row>

                <Row className="mb-3">
                  <FormGroup as={Col} md="6">
                    <FormLabel className="labelForm">Address<span className="text-danger">*</span></FormLabel>
                    <FormControl name="address" value={formData.address} onChange={handleChange} isInvalid={!!errors.address} />
                    <FormControl.Feedback type="invalid">{errors.address}</FormControl.Feedback>
                  </FormGroup>
                  <FormGroup as={Col} md="3">
                    <FormLabel className="labelForm">From<span className="text-danger">*</span></FormLabel>
                    <FormControl type="time" name="from" value={formData.from} onChange={handleChange} isInvalid={!!errors.from} />
                    <FormControl.Feedback type="invalid">{errors.from}</FormControl.Feedback>
                  </FormGroup>
                  <FormGroup as={Col} md="3">
                    <FormLabel className="labelForm">To<span className="text-danger">*</span></FormLabel>
                    <FormControl type="time" name="to" value={formData.to} onChange={handleChange} isInvalid={!!errors.to} />
                    <FormControl.Feedback type="invalid">{errors.to}</FormControl.Feedback>
                  </FormGroup>
                </Row>

                <Row className="mb-3">
                  <FormGroup as={Col} md="12">
                    <FormLabel className="labelForm">Remark</FormLabel>
                    <FormControl name="remark" value={formData.remark} onChange={handleChange} />
                  </FormGroup>
                </Row>
                <Button variant="primary" type="submit">Submit</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Appointment Records</h2>
            <Table columns={columns} data={appointments} handleCopy={handleCopy} handlePrint={handlePrint} />
          </div>

        </Container>
      </section>
    </>
  );
};

export default ScheduleAppointment;
