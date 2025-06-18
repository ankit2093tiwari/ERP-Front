"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Row, Col, Container, Button, Alert, FormControl } from "react-bootstrap";
import Image from "next/image";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { deleteNoticeById, getAllNotices, updateNoticeById } from "@/Services";
import { toast } from "react-toastify";

const NoticeRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    short_text: "",
    image: null,
    previewImage: ""
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
      name: "Image",
      cell: (row) => {
        if (editingId === row._id) {
          return (
            <div>
              <FormControl
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditFormData({
                    ...editFormData,
                    image: file,
                    previewImage: URL.createObjectURL(file),
                  });
                }}
              />
              {editFormData.previewImage && (
                <Image
                  src={editFormData.previewImage}
                  alt="Preview"
                  width={50}
                  height={50}
                  style={{ objectFit: "cover", marginTop: 4 }}
                />
              )}
            </div>
          );
        }

        const imageUrl = row.image;
        if (!imageUrl || !isValidUrl(imageUrl)) {
          return <span>No Image</span>;
        }
        return (
          <Image
            src={imageUrl}
            alt="Notice"
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
              as="textarea"
              rows={3}
              value={editFormData.short_text}
              onChange={(e) => setEditFormData({ ...editFormData, short_text: e.target.value })}
              placeholder="Short Text"
            />
          );
        }
        return row.short_text || "N/A";
      },
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
      sortable: true,
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
      const response = await getAllNotices()
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching notices:", err);
      setError("Failed to fetch notices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingId(notice._id);
    setEditFormData({
      short_text: notice.short_text || "",
      image: null,
      previewImage: notice.image || ""
    });
  };

  const handleUpdate = async (id) => {
    if (!editFormData.short_text.trim()) {
      alert("Please enter a short text.");
      return;
    }

    const formData = new FormData();
    formData.append("short_text", editFormData.short_text);
    if (editFormData.image) {
      formData.append("image", editFormData.image);
    }

    try {
      setLoading(true);
      const response = await updateNoticeById(id, formData)
      toast.success(response?.message || "Notice Record Updated Successfully")
      fetchData();
      setEditingId(null);
      // setSuccess("Notice updated successfully.");
      // setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating notice:", error);
      setError("Failed to update notice. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        setLoading(true);
        const response = await deleteNoticeById(id);
        toast.success(response?.message || "Notice Record Updated Successfully")
        toast.success
        fetchData()
        setSuccess("Notice deleted successfully.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error deleting notice:", error);
        setError("Failed to delete notice. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
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
          <Row className="mt-1 mb-1">
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="tableSheet">
            <h2>Notice Records</h2>
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

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });
