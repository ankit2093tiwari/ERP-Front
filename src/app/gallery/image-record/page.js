// upadted code
"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, Button } from "react-bootstrap";
import axios from "axios";

const ImageRecord = () => {
  const [data, setData] = useState([]); // Image records data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Group",
      selector: (row) => row.groupName?.groupName || "N/A", // Access nested groupName
      sortable: false,
    },
    {
      name: "Image",
      selector: (row) => <img src={row.image} alt="Gallery" width="100" />,
      sortable: false,
    },
    {
      name: "Short Text",
      selector: (row) => row.shortText || "N/A",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A", // Format date
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/images");
      const fetchedData = response.data.data || [];
      setData(
        fetchedData.map((item) => ({
          _id: item._id,
          date: item.date,
          image: item.image,
          shortText: item.shortText,
          groupName: item.groupName || {}, // Ensures groupName is always present
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/images/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Row>
        <Col>
          <h2 style={{ fontSize: "22px" }}>Images Records</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && <Table columns={columns} data={data} />}
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(ImageRecord), { ssr: false });
