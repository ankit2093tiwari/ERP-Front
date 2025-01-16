"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";

const AddNotice = () => {
  const [newNotice, setNewNotice] = useState({ date: "", short_text: "", image: null });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAdd = async () => {
    // Validation for all fields
    if (!newNotice.date) {
      setError("Date field is required.");
      setSuccessMessage("");
      return;
    }
    if (!newNotice.short_text) {
      setError("Short text field is required.");
      setSuccessMessage("");
      return;
    }
    if (!newNotice.image) {
      setError("Image field is required.");
      setSuccessMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("date", newNotice.date);
    formData.append("short_text", newNotice.short_text);
    formData.append("image", newNotice.image);

    try {
      await axios.post("https://erp-backend-fy3n.onrender.com/api/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewNotice({ date: "", short_text: "", image: null });
      setSuccessMessage("Notice added successfully!");
      setError("");
    } catch (error) {
      console.error("Error adding notice:", error);
      setError("Failed to add notice.");
      setSuccessMessage("");
    }
  };

  return (
    <Container className={styles.formContainer}>
      <h2 style={{ fontSize: "22px" }}>Add Notice</h2>
      <Form className={styles.form}>
        <Row>
          <Col lg={6}>
            <FormLabel className={styles.class}>Date</FormLabel>
            <FormControl
              required
              type="date"
              value={newNotice.date}
              onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
            />
          </Col>
          <Col lg={6}>
            <FormLabel className={styles.class}>Short-Text</FormLabel>
            <FormControl
              as="textarea"
              rows={1}
              required
              value={newNotice.short_text}
              onChange={(e) => setNewNotice({ ...newNotice, short_text: e.target.value })}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col lg={6}>
            <FormLabel className={styles.class}>
              Image (Format Support: jpeg, jpg, png, gif)
            </FormLabel>
            <FormControl
              type="file"
              required
              name="file"
              onChange={(e) => setNewNotice({ ...newNotice, image: e.target.files[0] })}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Button className={styles.search} onClick={handleAdd}>
              Add Notice
            </Button>
          </Col>
        </Row>
        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddNotice), { ssr: false });
