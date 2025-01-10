// Updated Code for // ADVERTISING RECORDS //ENTER DATA
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, FormSelect, Button } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from "react-icons/cg";

const AdvertisementPage = () => {
  const [data, setData] = useState([]); // Table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [formData, setFormData] = useState({
    advertisement_type: "",
    advertisement_name: "",
    page_no: "",
    size: "",
    amount: "",
    remark: "",
    file: null,
    publish_date: "",
  }); // Form data for adding/editing

  // Table columns configuration
  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Advertisement Type", selector: (row) => row.advertisement_type?.type_name, sortable: true },
    { name: "Advertisement Name", selector: (row) => row.advertisement_name, sortable: true },
    { name: "Page No", selector: (row) => row.page_no, sortable: true },
    { name: "Size", selector: (row) => row.size, sortable: true },
    { name: "Amount", selector: (row) => row.amount, sortable: true },
    { name: "Remark", selector: (row) => row.remark, sortable: true },
    { name: "File", selector: (row) => row.file, sortable: true },
    { name: "Publish Date", selector: (row) => new Date(row.publish_date).toLocaleDateString(), sortable: true },
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

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/advertisements");
      const fetchedData = response.data.data || [];
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  // Add a new advertisement
  const handleAdd = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/advertisements", form);
      setData((prevData) => [...prevData, response.data]);
      setFormData({
        advertisement_type: "",
        advertisement_name: "",
        page_no: "",
        size: "",
        amount: "",
        remark: "",
        file: null,
        publish_date: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding advertisement:", error);
      setError("Failed to add advertisement. Please try again later.");
    }
  };

  // Edit an advertisement
  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new advertisement name:", item?.advertisement_name || "");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/advertisements/${id}`, {
          advertisement_name: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, advertisement_name: updatedName } : row
          )
        );
      } catch (error) {
        console.error("Error updating advertisement:", error);
        setError("Failed to update advertisement. Please try again later.");
      }
    }
  };

  // Delete an advertisement
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/advertisements/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        console.error("Error deleting advertisement:", error);
        setError("Failed to delete advertisement. Please try again later.");
      }
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          <CgAddR /> Add New Advertisement
        </Button>

        {showAddForm && (
          <div className="mb-4">
            <Row className="mb-3">
              <Col lg={6}>
                <FormLabel>Advertisement Type</FormLabel>
                <FormControl
                  type="text"
                  name="advertisement_type"
                  value={formData.advertisement_type}
                  onChange={handleChange}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Publish Date</FormLabel>
                <FormControl type="date" name="publish_date" value={formData.publish_date} onChange={handleChange} />
              </Col>
              <Col lg={6}>
                <FormLabel>Advertisement Name</FormLabel>
                <FormControl
                  type="text"
                  name="advertisement_name"
                  value={formData.advertisement_name}
                  onChange={handleChange}
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Size</FormLabel>
                <FormControl type="text" name="size" value={formData.size} onChange={handleChange} />
              </Col>
              <Col lg={6}>
                <FormLabel>Page No</FormLabel>
                <FormControl type="text" name="page_no" value={formData.page_no} onChange={handleChange} />
              </Col>
              <Col lg={6}>
                <FormLabel>File</FormLabel>
                <FormControl type="file" name="file" onChange={handleChange} />
              </Col>
              <Col lg={6}>
                <FormLabel>Amount</FormLabel>
                <FormControl type="text" name="amount" value={formData.amount} onChange={handleChange} />
              </Col>
              <Col lg={6}>
                <FormLabel>Remark</FormLabel>
                <FormControl as="textarea" rows={1} name="remark" value={formData.remark} onChange={handleChange} />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Advertisement
            </Button>
          </div>
        )}

        <Row>
          <Col>
            <h2 style={{ fontSize: "22px" }}>Advertisement Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AdvertisementPage), { ssr: false });
