"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Row, Col, Container, Button, FormControl, Form, FormLabel } from "react-bootstrap";
import Image from "next/image";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  deleteGalleryImageRecordById,
  getAllIGalleryImages,
  updateGalleryImageRecordById,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ImageRecord = () => {
  const { hasEditAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    shortText: "",
    date: "",
    groupName: "",
  });

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
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
            alt="Gallery"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        );
      },
    },
    {
      name: "Short Text",
      selector: (row) => row.shortText || "N/A",
    },
    {
      name: "Date",
      selector: (row) => (row.date ? new Date(row.date).toLocaleDateString() : "N/A"),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button size="sm" variant="success" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ].filter(Boolean);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllIGalleryImages();
      const fetchedData = response.data || [];
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
    setEditId(image._id);
    setFormData({
      image: image.image || "",
      shortText: image.shortText || "",
      date: image.date ? new Date(image.date).toISOString().split("T")[0] : "",
      groupName: image.groupName?._id || "",
    });
    setIsFormOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.shortText.trim() || !formData.date) {
      toast.warn("Please fill all required fields.");
      return;
    }

    const updateData = new FormData();
    if (formData.image instanceof File) {
      updateData.append("image", formData.image);
    }
    updateData.append("shortText", formData.shortText);
    updateData.append("date", formData.date);
    updateData.append("groupName", formData.groupName);

    try {
      setLoading(true);
      await updateGalleryImageRecordById(editId, updateData);
      toast.success("Data Updated Successfully");
      fetchData();
      closeForm();
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
        const response = await deleteGalleryImageRecordById(id);
        if (response?.success) toast.success("Record Deleted Successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditId(null);
    setFormData({
      image: "",
      shortText: "",
      date: "",
      groupName: "",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Gallery", link: "/gallery/all-module" },
    { label: "Image Record", link: "null" },
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
          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Image Record</h2>
                <button className="closeForm" onClick={closeForm}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Image</FormLabel>
                    <FormControl
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData({ ...formData, image: file });
                        }
                      }}
                    />
                    {formData.image && !(formData.image instanceof File) && (
                      <div className="mt-2">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          width={80}
                          height={80}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </Col>
                  <Col lg={6}>
                    <FormLabel>Short Text</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.shortText}
                      onChange={(e) => setFormData({ ...formData, shortText: e.target.value })}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Date</FormLabel>
                    <FormControl
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </Col>
                  {/* <Col lg={6}>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    />
                  </Col> */}
                </Row>
                <Button variant="success" onClick={handleUpdate} disabled={loading}>
                  Update Record
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Images Records</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Table columns={columns} data={data} pagination highlightOnHover responsive />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ImageRecord), { ssr: false });
