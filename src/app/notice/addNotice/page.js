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

const AddNotice = () => {
  const [newNotice, setNewNotice] = useState({
    date: "",
    short_text: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAdd = async () => {
    const formData = new FormData();
    formData.append("date", newNotice.date || "");
    formData.append("short_text", newNotice.short_text || "");
    if (newNotice.image) {
      formData.append("image", newNotice.image);
    }

    // Debug: log formData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/notices",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setNewNotice({ date: "", short_text: "", image: null });
      setSuccessMessage("Notice added successfully!");
      setError("");
      console.log("Notice created:", response.data);
    } catch (error) {
      console.error("Error adding notice:", error);
      setError(
        error.response?.data?.message ||
          "Failed to add notice. Please try again."
      );
      setSuccessMessage("");
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
                    Short Text (Optional, max 200 chars)
                  </FormLabel>
                  <FormControl
                    as="textarea"
                    rows={3}
                    maxLength={200}
                    value={newNotice.short_text}
                    onChange={(e) =>
                      setNewNotice({
                        ...newNotice,
                        short_text: e.target.value,
                      })
                    }
                    placeholder="Enter notice text"
                  />
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
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setError("File size should be less than 5MB.");
                          return;
                        }
                        setNewNotice({ ...newNotice, image: file });
                        setError("");
                      }
                    }}
                  />
                  <small className="text-muted">Max file size: 5MB</small>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="primary"
                  onClick={handleAdd}
                  disabled={
                    !newNotice.date &&
                    !newNotice.short_text.trim() &&
                    !newNotice.image
                  }
                >
                  Add Notice
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() =>
                    setNewNotice({ date: "", short_text: "", image: null })
                  }
                >
                  Clear Form
                </Button>
              </div>

              {successMessage && (
                <div className="alert alert-success mt-3">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-3">{error}</div>
              )}
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddNotice), { ssr: false });
