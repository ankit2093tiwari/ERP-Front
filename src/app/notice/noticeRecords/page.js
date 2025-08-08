"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Row, Col, Container, Button, Alert, FormControl, Form, FormLabel } from "react-bootstrap";
import Image from "next/image";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { deleteNoticeById, getAllNotices, updateNoticeById } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import { copyContent, printContent } from "@/app/utils";

const NoticeRecord = () => {
  const { hasEditAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    short_text: "",
    image: null,
    previewImage: "",
    date: ""
  });
  const [errors, setErrors] = useState({
    short_text: "",
    image: ""
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
      selector: (row) => row.short_text || "N/A",
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
      sortable: true,
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}
            disabled={loading}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const handleCopy=()=>{
    const headers=["#","Date","Text"]
    const rows=data?.map((row,index)=>(
      [index+1,new Date(row.date).toLocaleDateString() || "N/A",row.short_text || "N/A"].join('\t')
    ))
    copyContent(headers,rows)
  }
  const handlePrint=()=>{
    const headers=[["#","Date","Text"]]
    const rows=data?.map((row,index)=>(
      [index+1,new Date(row.date).toLocaleDateString() || "N/A",row.short_text || "N/A"]
    ))
    printContent(headers,rows)
  }
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllNotices();
      setData(response?.data || []);
    } catch (err) {
      console.error("Error fetching notices:", err);
      toast.error("Failed to fetch notices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

 const handleEdit = (notice) => {
  setEditingId(notice._id);
  
  // Convert the date to YYYY-MM-DD format for the input field
  const formattedDate = notice.date 
    ? new Date(notice.date).toISOString().split('T')[0] 
    : "";
    
  setEditFormData({
    short_text: notice.short_text || "",
    image: null,
    previewImage: notice.image || "",
    date: formattedDate
  });
  
  setErrors({
    short_text: "",
    image: ""
  });
};

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      short_text: "",
      image: null,
      previewImage: "",
      date: ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate form
    let isValid = true;
    const newErrors = { ...errors };

    if (!editFormData.short_text.trim()) {
      newErrors.short_text = "Short text is required";
      isValid = false;
    } else {
      newErrors.short_text = "";
    }

    if (editFormData.image) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(editFormData.image.type)) {
        newErrors.image = "Invalid file format (only jpeg, jpg, png, gif allowed)";
        isValid = false;
      } else if (editFormData.image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image must be smaller than 5MB";
        isValid = false;
      } else {
        newErrors.image = "";
      }
    }

    setErrors(newErrors);
    if (!isValid) return;

    const formData = new FormData();
    formData.append("short_text", editFormData.short_text);
    if (editFormData.image) {
      formData.append("image", editFormData.image);
    }
    if (editFormData.date) {
      formData.append("date", editFormData.date);
    }

    try {
      setLoading(true);
      const response = await updateNoticeById(editingId, formData);
      toast.success(response?.message || "Notice Record Updated Successfully");
      fetchData();
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating notice:", error);
      toast.error("Failed to update notice. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      try {
        setLoading(true);
        const response = await deleteNoticeById(id);
        toast.success(response?.message || "Notice deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting notice:", error);
        toast.error("Failed to delete notice. Please try again later.");
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
          {editingId && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Notice</h2>
              </div>
              <Form className="formSheet" onSubmit={handleUpdate}>
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date (Optional)</FormLabel>
                    <FormControl
                      type="date"
                      value={editFormData.date}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, date: e.target.value })
                      }
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Short Text <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      as="textarea"
                      rows={3}
                      maxLength={200}
                      value={editFormData.short_text}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, short_text: e.target.value });
                        setErrors({ ...errors, short_text: "" });
                      }}
                      placeholder="Enter notice text"
                      isInvalid={!!errors.short_text}
                    />
                    {errors.short_text && (
                      <div className="text-danger mt-1">{errors.short_text}</div>
                    )}
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
                        setEditFormData({
                          ...editFormData,
                          image: file,
                          previewImage: file ? URL.createObjectURL(file) : editFormData.previewImage
                        });
                        setErrors({ ...errors, image: "" });
                      }}
                      isInvalid={!!errors.image}
                    />
                    {editFormData.previewImage && (
                      <div className="mt-2">
                        <Image
                          src={editFormData.previewImage}
                          alt="Preview"
                          width={100}
                          height={100}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <small className="text-muted">Max file size: 5MB</small>
                    {errors.image && (
                      <div className="text-danger mt-1">{errors.image}</div>
                    )}
                  </Col>
                </Row>

                <div className="d-flex mt-3 gap-1">
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="danger" onClick={handleCancelEdit} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}
          <div className="tableSheet">
            <h2>Notice Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={data}
                  handleCopy={handleCopy}
                  handlePrint={handlePrint}
                />
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(NoticeRecord), { ssr: false });