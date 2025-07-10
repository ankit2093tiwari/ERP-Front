"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewNotice } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const AddNotice = () => {
  const { hasSubmitAccess } = usePagePermission()

  const today = new Date().toISOString().split("T")[0];
  const [newNotice, setNewNotice] = useState({
    date: today,
    short_text: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!newNotice.short_text.trim()) {
      formErrors.short_text = "Notice text is required!";
      isValid = false;
    }

    if (newNotice.image) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(newNotice.image.type)) {
        formErrors.image = "Invalid image format (jpeg/jpg/png/gif allowed)";
        isValid = false;
      } else if (newNotice.image.size > 5 * 1024 * 1024) {
        formErrors.image = "File size should be less than 5MB.";
        isValid = false;
      }
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      toast.warn("Please fix form errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("date", newNotice.date || "");
    formData.append("short_text", newNotice.short_text || "");
    if (newNotice.image) {
      formData.append("image", newNotice.image);
    }

    try {
      const response = await addNewNotice(formData)
      setNewNotice({ date: today, short_text: "", image: null });
      setErrors({});
      toast.success("Notice added successfully!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to add notice. Please try again.";
      toast.error(errorMsg);
      console.error("Error adding notice:", error);
    }
  };

  const breadcrumbItems = [
    { label: "Notice", link: "/notice/all-module" },
    { label: "Add Notice", link: "null" },
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
          <div className="cover-sheet">
            <div className="studentHeading">
              <h2>Add Notice</h2>
            </div>

            <Form className="formSheet">
              <Row>
                <Col lg={6}>
                  <FormLabel className="labelForm">Date (Optional)</FormLabel>
                  <FormControl
                    type="date"
                    value={newNotice.date}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, date: e.target.value })
                    }
                  />
                </Col>
                <Col lg={6}>
                  <FormLabel className="labelForm">
                    Short Text <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    as="textarea"
                    rows={3}
                    maxLength={200}
                    value={newNotice.short_text}
                    onChange={(e) => {
                      setNewNotice({ ...newNotice, short_text: e.target.value });
                      setErrors((prev) => ({ ...prev, short_text: "" }));
                    }}
                    placeholder="Enter notice text"
                    isInvalid={!!errors.short_text}
                  />
                  {errors.short_text && (
                    <div className="text-danger mt-1">{errors.short_text}</div>
                  )}
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={12}>
                  <FormLabel className="labelForm">
                    Image (Optional - jpeg, jpg, png, gif)
                  </FormLabel>
                  <FormControl
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setNewNotice({ ...newNotice, image: file });
                      setErrors((prev) => ({ ...prev, image: "" }));
                    }}
                    isInvalid={!!errors.image}
                  />
                  <small className="text-muted">Max file size: 5MB</small>
                  {errors.image && (
                    <div className="text-danger mt-1">{errors.image}</div>
                  )}
                </Col>
              </Row>

              {hasSubmitAccess && (
                <div className="d-flex justify-content-between mt-3">
                  <Button variant="primary" onClick={handleAdd}>
                    Add Notice
                  </Button>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success mt-3">
                  {successMessage}
                </div>
              )}
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddNotice), { ssr: false });
