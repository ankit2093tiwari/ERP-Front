"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
import { Row, Col, Container, Button, FormControl } from "react-bootstrap";
import Image from "next/image";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { deleteGalleryImageRecordById, getAllIGalleryImages, updateGalleryImageRecordById } from "@/Services";

const ImageRecord = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setEditFormData({ ...editFormData, image: file });
                }
              }}
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
              <button className="editButton"
                onClick={() => handleUpdate(row._id)}
                disabled={loading}
              >
                <FaSave />
              </button>
              <button className="editButton btn-danger"
                onClick={() => setEditingId(null)}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
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
      const response = await getAllIGalleryImages()
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
    setEditingId(image._id);
    setEditFormData({
      image: image.image || "",
      shortText: image.shortText || "",
      date: image.date || "",
      groupName: image.groupName?._id || ""
    });
  };

  const handleUpdate = async (id) => {
    if (!editFormData.image || !editFormData.shortText.trim() || !editFormData.date) {
      toast.warn("Please fill all required fields.");
      return;
    }
    const formData = new FormData();
    formData.append("image", editFormData.image);
    formData.append("shortText", editFormData.shortText);
    formData.append("date", editFormData.date);
    formData.append("groupName", editFormData.groupName)

    try {
      setLoading(true);
      await updateGalleryImageRecordById(id, formData);
      toast.success("Data Updated Successfully")
      fetchData();
      setEditingId(null);
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
        const response = await deleteGalleryImageRecordById(id)
        if (response?.success) toast.success("Record Deleted Successfully")
        fetchData()
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