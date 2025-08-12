"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Breadcrumb } from "react-bootstrap";
import { toast } from "react-toastify";
import { addNewChequeBounceEntry, deleteChequeBounceEntryById, getAllChequeBounceEntries, getAllStudents } from "@/Services";
import { copyContent, printContent } from "@/app/utils";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";

const ChequeBounce = () => {
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    studentId: "",
    feeMonth: "",
    amount: "",
    chequeNo: "",
    chequeDate: "",
    bounceReason: "",
    entryDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getAllStudents();
        setStudents(res.data);
      } catch (err) {
        toast.error("Failed to load students");
      }
    };
    fetchStudents();
    fetchAllChequeBounceEntries();
  }, []);

  const fetchAllChequeBounceEntries = async () => {
    try {
      const response = await getAllChequeBounceEntries();
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching cheque bounce entries:", error);
      toast.error("Failed to load cheque bounce entries");
    }
  };
  const validateForm = () => {
    const errors = {};

    // Basic required field validations
    if (!formData.studentId) errors.studentId = "Student is required";
    if (!formData.amount) errors.amount = "Amount is required";
    if (!formData.chequeNo) errors.chequeNo = "Cheque number is required";
    if (!formData.chequeDate) errors.chequeDate = "Cheque date is required";
    if (!formData.bounceReason) errors.bounceReason = "Bounce reason is required";
    if (!formData.feeMonth) errors.feeMonth = "Fee month is required";

    // Amount validation - must be positive number
    if (formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) <= 0)) {
      errors.amount = "Amount must be a positive number";
    }

    // Cheque number validation - 6-15 digits
    if (formData.chequeNo && !/^\d{6,15}$/.test(formData.chequeNo)) {
      errors.chequeNo = "Cheque number must be 6-15 digits";
    }

    // Cheque date validation - not in future
    if (formData.chequeDate && new Date(formData.chequeDate) > new Date()) {
      errors.chequeDate = "Cheque date cannot be in the future";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("Please fill all required fields correctly");
      return;
    }

    try {
      await addNewChequeBounceEntry(formData);
      toast.success("Cheque bounce entry submitted successfully");
      setFormData({
        studentId: "",
        feeMonth: "",
        amount: "",
        chequeNo: "",
        chequeDate: "",
        bounceReason: "",
        entryDate: new Date().toISOString().split("T")[0],
      });
      fetchAllChequeBounceEntries();
    } catch (err) {
      console.error("Error submitting entry:", err);
      toast.error(err.response?.data?.message || "Error submitting entry");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await deleteChequeBounceEntryById(id);
      toast.success("Cheque bounce entry deleted successfully");
      fetchAllChequeBounceEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
      toast.error("Error deleting entry");
    }
  };

  const columns = [
    {
      name: "Student",
      selector: row => `${row.studentId?.first_name} ${row.studentId?.last_name} (${row.studentId?.registration_id})`,
      sortable: true
    },
    { name: "Fee Month", selector: row => row.feeMonth || "N/A", sortable: true },
    { name: "Amount", selector: row => row.amount || "N/A", sortable: true },
    { name: "Cheque No", selector: row => row.chequeNo || "N/A", sortable: true },
    { name: "Cheque Date", selector: row => row.chequeDate ? new Date(row.chequeDate).toLocaleDateString() : "N/A", sortable: true },
    { name: "Entry Date", selector: row => row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "N/A", sortable: true },
    { name: "Bounce Reason", selector: row => row.bounceReason || "N/A", sortable: true },
    {
      name: "Actions",
      cell: row => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
          <FaTrashAlt />
        </Button>
      )
    }
  ];

  const handlePrint = () => {
    const headers = [["Student", "Fee Month", "Amount", "Cheque No", "Cheque Date", "Entry Date", "Bounce Reason"]];
    const rows = data.map(row => [
      `${row.studentId?.first_name} ${row.studentId?.last_name} (${row.studentId?.registration_id})`,
      row.feeMonth || "N/A",
      row.amount || "N/A",
      row.chequeNo || "N/A",
      row.chequeDate ? new Date(row.chequeDate).toLocaleDateString() : "N/A",
      row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "N/A",
      row.bounceReason || "N/A"
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["Student", "Fee Month", "Amount", "Cheque No", "Cheque Date", "Entry Date", "Bounce Reason"];
    const rows = data.map(row => [
      `${row.studentId?.first_name} ${row.studentId?.last_name} (${row.studentId?.registration_id})`,
      row.feeMonth || "N/A",
      row.amount || "N/A",
      row.chequeNo || "N/A",
      row.chequeDate ? new Date(row.chequeDate).toLocaleDateString() : "N/A",
      row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "N/A",
      row.bounceReason || "N/A"
    ].join("\t"));
    copyContent(headers, rows);
  };

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col>
              <Breadcrumb>
                <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                <Breadcrumb.Item href="/fees/all-module">Fees</Breadcrumb.Item>
                <Breadcrumb.Item active>Cheque Bounce Entry</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Cheque Bounce Entry</h2>
            </div>

            <Form className="formSheet" onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Student<span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    isInvalid={!!formErrors.studentId}
                  >
                    <option value="">Select Student</option>
                    {students?.map((stu) => (
                      <option key={stu._id} value={stu._id}>
                        {stu.first_name} {stu.last_name} ({stu.registration_id})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.studentId}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Fee Month<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="month"
                    name="feeMonth"
                    value={formData.feeMonth}
                    onChange={handleChange}
                    isInvalid={!!formErrors.feeMonth}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.feeMonth}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Amount<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    isInvalid={!!formErrors.amount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.amount}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Cheque No.<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="chequeNo"
                    value={formData.chequeNo}
                    onChange={handleChange}
                    isInvalid={!!formErrors.chequeNo}
                    placeholder="Enter 6-15 digit cheque number"
                    maxLength={15}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.chequeNo}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Cheque Date<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleChange}
                    isInvalid={!!formErrors.chequeDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.chequeDate}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6}>
                  <Form.Label>Entry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="entryDate"
                    value={formData.entryDate}
                    onChange={handleChange}
                    readOnly
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Bounce Reason<span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    name="bounceReason"
                    value={formData.bounceReason}
                    onChange={handleChange}
                    isInvalid={!!formErrors.bounceReason}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.bounceReason}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              <Button type="submit" variant="success">Submit Entry</Button>
            </Form>
          </div>

          {data.length > 0 && (
            <div className="tableSheet">
              <Table
                data={data}
                columns={columns}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            </div>
          )}
        </Container>
      </section>
    </>
  );
};

export default ChequeBounce;