"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Modal,
  Form
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const NoticeRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);
  const [formData, setFormData] = useState({
    short_text: "",
    image: null
  });

  const columns = [
    { 
      name: "#", 
      selector: (row, index) => index + 1, 
      sortable: false, 
      width: "80px" 
    },
    { 
      name: "Image", 
      cell: (row) => (
        row.image ? (
          <img 
            src={row.image} 
            alt="Notice" 
            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
          />
        ) : "N/A"
      ),
      sortable: false 
    },
    { 
      name: "Short Text", 
      selector: (row) => row.short_text || "N/A", 
      sortable: true 
    },
    { 
      name: "Date", 
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A", 
      sortable: true 
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleEditClick(row)}
            className="editButton"
          >
            <FaEdit />
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDelete(row._id)}
            className="editButton"
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/notices");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching notices:", err);
      setError("Failed to fetch notices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (notice) => {
    setCurrentNotice(notice);
    setFormData({
      short_text: notice.short_text || "",
      image: null
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      if (formData.short_text) formData.append("short_text", formData.short_text);
      if (formData.image) formData.append("image", formData.image);

      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/notices/${currentNotice._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      fetchData();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating notice:", error);
      setError("Failed to update notice.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting notice:", error);
        setError("Failed to delete notice.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Date", "Short Text"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.short_text || "N/A"
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Short Text"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.short_text || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Notice", link: "/notice/all-module" }, 
    { label: "Notice Records", link: "null" }
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className='mt-1 mb-1'>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="tableSheet">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Notice Records</h2>
            </div>

            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                handleCopy={handleCopy}
                handlePrint={handlePrint}
              />
            )}
          </div>
        </Container>
      </section>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Short Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.short_text}
                onChange={(e) => setFormData({...formData, short_text: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
              />
              {currentNotice?.image && (
                <img 
                  src={currentNotice.image} 
                  alt="Current Notice" 
                  style={{ width: '100px', marginTop: '10px' }} 
                />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });