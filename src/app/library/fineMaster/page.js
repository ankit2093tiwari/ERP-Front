"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { getFineMaster, updateFineMaster } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const FineMaster = () => {
  const {hasEditAccess}=usePagePermission()
  const [formData, setFormData] = useState({
    teacherFine: "",
    studentFine: "",
  });

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" },
    { label: "Fine Master", link: null },
  ];

  // Load existing fine values from backend
  const fetchFineMaster = async () => {
    try {
      const res = await getFineMaster();
      setFormData(res?.data || { teacherFine: "", studentFine: "" });
    } catch (err) {
      console.log("Failed to fetch fineMaster", err)
      // toast.error("Failed to load fine data.");
    }
  };

  useEffect(() => {
    fetchFineMaster();
  }, []);

  const validateForm = () => {
    const { teacherFine, studentFine } = formData;

    if (teacherFine === "" || studentFine === "") {
      toast.error("Both fields are required.");
      return false;
    }

    const teacher = Number(teacherFine);
    const student = Number(studentFine);

    if (isNaN(teacher) || isNaN(student)) {
      toast.error("Only numeric values are allowed.");
      return false;
    }

    if (teacher < 0 || student < 0) {
      toast.error("Fine amount cannot be negative.");
      return false;
    }

    if (teacher > 100 || student > 100) {
      toast.error("Fine should not exceed 100.");
      return false;
    }

    return true;
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update fine values
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    try {
      await updateFineMaster(formData);
      toast.success("Fine updated successfully.");
      fetchFineMaster();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to update fine.";
      toast.error(errorMessage);
    }
  };

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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Fine Master</h2>
            </div>
            <Form className="formSheet" onSubmit={handleSubmit}>
              <Row>
                <Col lg={4}>
                  <FormLabel className="labelForm">Per day fine of Teacher <span className="text-danger">*</span></FormLabel>
                  <FormControl
                    required
                    type="number"
                    name="teacherFine"
                    value={formData.teacherFine}
                    onChange={handleChange}
                  />
                </Col>
                <Col lg={4}>
                  <FormLabel className="labelForm">Per day fine of Student <span className="text-danger">*</span></FormLabel>
                  <FormControl
                    required
                    type="number"
                    name="studentFine"
                    value={formData.studentFine}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              {hasEditAccess &&(
                <Row className="mt-3">
                <Col>
                  <Button type="submit" variant="success">
                    Update Fine
                  </Button>
                </Col>
              </Row>
              )}
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(FineMaster), { ssr: false });
