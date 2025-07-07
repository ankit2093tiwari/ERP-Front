"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Breadcrumb } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { getAllStudents } from "@/Services";

const ChequeBounce = () => {
  const [students, setStudents] = useState([]);
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
    // Fetch student list from backend
    const fetchStudents = async () => {
      try {
        const res = await getAllStudents()
        setStudents(res.data);
      } catch (err) {
        toast.error("Failed to load students");
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validations
    if (!formData.studentId || !formData.chequeNo || !formData.amount) {
      toast.warning("Please fill required fields.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/fees/cheque-bounce`, formData);
      toast.success("Cheque bounce entry submitted.");
      setFormData({
        studentId: "",
        feeMonth: "",
        amount: "",
        chequeNo: "",
        chequeDate: "",
        bounceReason: "",
        entryDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error("Error submitting entry.");
    }
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
                  <Form.Label>Student</Form.Label>
                  <Form.Select name="studentId" value={formData.studentId} onChange={handleChange} required>
                    <option value="">Select Student</option>
                    {students?.map((stu) => (
                      <option key={stu._id} value={stu._id}>
                        {stu.first_name} {stu.last_name} ({stu.registration_id})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>Fee Month</Form.Label>
                  <Form.Control type="month" name="feeMonth" value={formData.feeMonth} onChange={handleChange} />
                </Col>

              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Amount<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label>Cheque No.<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="chequeNo" value={formData.chequeNo} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label>Cheque Date<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" name="chequeDate" value={formData.chequeDate} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label>Entry Date<span className="text-danger">*</span></Form.Label>
                  <Form.Control type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} readOnly />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Bounce Reason<span className="text-danger">*</span></Form.Label>
                  <Form.Control as="textarea" name="bounceReason" value={formData.bounceReason} onChange={handleChange} />
                </Col>
              </Row>

              <Button type="submit" variant="primary">Submit Entry</Button>
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default ChequeBounce;
