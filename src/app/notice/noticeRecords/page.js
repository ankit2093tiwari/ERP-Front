"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";

const NoticeRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newNotice, setNewNotice] = useState({ image: "", shortText: "", date: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Image", selector: (row) => row.image || "N/A", sortable: false },
    { name: "Short Text", selector: (row) => row.short_text || "N/A", sortable: false },
    { name: "Date", selector: (row) => row.date || "N/A", sortable: false },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/notices");
      const notices = Array.isArray(response.data.data) ? response.data.data : [];
      setData(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newNotice.image && newNotice.shortText && newNotice.date) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/notices", newNotice);
        setData((prevData) => [...prevData, response.data]);
        setNewNotice({ image: "", short_text: "", date: "" });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding notice:", error);
        setError("Failed to add notice.");
      }
    }
  };

  const handleEdit = async (id) => {
    const notice = data.find((row) => row._id === id);
    const updatedImage = prompt("Enter new image URL:", notice?.image || "");
    const updatedShortText = prompt("Enter new short text:", notice?.short_text || "");
    const updatedDate = prompt("Enter new date (YYYY-MM-DD):", notice?.date || "");

    if (updatedImage && updatedShortText && updatedDate) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`, {
          image: updatedImage,
          short_text: updatedShortText,
          date: updatedDate,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, image: updatedImage, short_text: updatedShortText, date: updatedDate } : row
          )
        );
      } catch (error) {
        console.error("Error updating notice:", error);
        setError("Failed to update notice.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting notice:", error);
        setError("Failed to delete notice.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add Notice
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={4}>
                <FormLabel>Image</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Image URL"
                  value={newNotice.image}
                  onChange={(e) => setNewNotice({ ...newNotice, image: e.target.value })}
                />
              </Col>
              <Col lg={4}>
                <FormLabel>Short Text</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Short Text"
                  value={newNotice.short_text}
                  onChange={(e) => setNewNotice({ ...newNotice, short_text: e.target.value })}
                />
              </Col>
              <Col lg={4}>
                <FormLabel>Date</FormLabel>
                <FormControl
                  type="date"
                  value={newNotice.date}
                  onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Notice
            </Button>
          </div>
        )}
        <h2>Notice Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data || []} />}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });
