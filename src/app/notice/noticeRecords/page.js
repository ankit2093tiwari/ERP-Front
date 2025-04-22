"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const NoticeRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      sortable: false 
    },
    { 
      name: "Date", 
      selector: (row) => row.date || "N/A", 
      sortable: false 
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleEdit(row._id)}
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

  const handleEdit = async (id) => {
    const notice = data.find((row) => row._id === id);
    const updatedShortText = prompt("Enter new short text:", notice?.short_text || "");
    const updatedDate = prompt("Enter new date (YYYY-MM-DD):", notice?.date || "");

    if (updatedShortText && updatedDate) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/notices/${id}`, {
          short_text: updatedShortText,
          date: updatedDate,
        });
        fetchData();
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
        fetchData();
      } catch (error) {
        console.error("Error deleting notice:", error);
        setError("Failed to delete notice.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Notice", link: "/notice/all-module" }, 
    { label: "Notice Record", link: "null" }
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
              <h2>Notice Records</h2>
            </div>
            <div className="formSheet">
              {loading && <p>Loading...</p>}
              {error && <p className="text-danger">{error}</p>}
              {!loading && !error && (
                <Table 
                  columns={columns} 
                  data={data || []} 
                  className="table-striped table-bordered"
                />
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });