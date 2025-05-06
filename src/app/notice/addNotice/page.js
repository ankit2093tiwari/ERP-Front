"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddNotice = () => {
  const [newNotice, setNewNotice] = useState({
    short_text: "",
    image: null
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAdd = async () => {
    const formData = new FormData();

    // Only append fields that have values
    if (newNotice.short_text) formData.append("short_text", newNotice.short_text);
    if (newNotice.image) formData.append("image", newNotice.image);

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewNotice({ short_text: "", image: null });
      setSuccessMessage("Notice added successfully!");
      setError("");
    } catch (error) {
      console.error("Error adding notice:", error);
      setError(error.response?.data?.message || "Failed to add notice.");
      setSuccessMessage("");
    }
  };

  const breadcrumbItems = [
    { label: "Notice", link: "/notice/all-module" },
    { label: "Add Notice", link: "null" }
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
                  <FormLabel className="labelForm">Date</FormLabel>
                  <FormControl
                    required
                    type="date"
                    value={newNotice.date}
                    onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                  />
                </Col>
                <Col lg={6}>
                  <FormLabel className="labelForm">Short Text (Optional)</FormLabel>
                  <FormControl
                    as="textarea"
                    rows={3}
                    value={newNotice.short_text}
                    onChange={(e) => setNewNotice({ ...newNotice, short_text: e.target.value })}
                  />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col lg={12}>
                  <FormLabel className="labelForm">
                    Image (Optional - Format Support: jpeg, jpg, png, gif)
                  </FormLabel>
                  <FormControl
                    type="file"
                    name="file"
                    onChange={(e) => setNewNotice({ ...newNotice, image: e.target.files[0] })}
                  />
                </Col>
              </Row>
              <Button onClick={handleAdd} className="btn btn-primary mt-3">
                Add Notice
              </Button>
              {successMessage && <p className="text-success mt-2">{successMessage}</p>}
              {error && <p className="text-danger mt-2">{error}</p>}
            </Form>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddNotice), { ssr: false });