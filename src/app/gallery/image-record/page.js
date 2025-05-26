"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Row, Col, Container, Button, Alert, FormControl } from "react-bootstrap";
import Image from "next/image";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const ImageRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    image: "",
    shortText: "",
    date: "",
    groupName: ""
  });

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "80px",
    },
    {
      name: "Group",
      selector: (row) => row.groupName?.groupName || "N/A",
      sortable: false,
    },
    {
      name: "Image",
      cell: (row) => {
        if (editingId === row._id) {
          return (
            <FormControl
              type="text"
              value={editFormData.image}
              onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
              placeholder="Image URL"
            />
          );
        }

        const imageUrl = row.image;
        if (!imageUrl || !isValidUrl(imageUrl)) {
          return <span>No Image</span>;
        }
        return (
          <Image
            src={imageUrl}
            alt="Gallery"
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        );
      },
      sortable: false,
    },
    {
      name: "Short Text",
      cell: (row) => {
        if (editingId === row._id) {
          return (
            <FormControl
              type="text"
              value={editFormData.shortText}
              onChange={(e) => setEditFormData({ ...editFormData, shortText: e.target.value })}
              placeholder="Short Text"
            />
          );
        }
        return row.shortText || "N/A";
      },
      sortable: true,
    },
    {
      name: "Date",
      cell: (row) => {
        if (editingId === row._id) {
          return (
            <FormControl
              type="date"
              value={editFormData.date ? new Date(editFormData.date).toISOString().split('T')[0] : ""}
              onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
            />
          );
        }
        return new Date(row.date).toLocaleDateString() || "N/A";
      },
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdate(row._id)}
                disabled={loading}
              >
                <FaSave />
              </Button>
              <Button
                // variant="danger"
                className="editButton btn-danger"
                size="sm"
                onClick={() => setEditingId(null)}
              >
                <FaTrashAlt />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </Button>
              <Button
                // variant="danger"
                size="sm"
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
                disabled={loading}
              >
                <FaTrashAlt />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

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
          groupName: item.groupName || {},
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (image) => {
    setEditingId(image._id);
    setEditFormData({
      image: image.image || "",
      shortText: image.shortText || "",
      date: image.date || "",
      groupName: image.groupName?._id || ""
    });
  };

  const handleUpdate = async (id) => {
    if (!editFormData.image.trim() || !editFormData.shortText.trim() || !editFormData.date) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/images/${id}`, editFormData);
      fetchData();
      setEditingId(null);
      // setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update image. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        setLoading(true);
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/images/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        setSuccess("Image deleted successfully.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Gallery", link: "/gallery/all-module" },
    { label: "Image Record", link: "null" }
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
          <div className="tableSheet">
            <h2>Images Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                responsive
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ImageRecord), { ssr: false });