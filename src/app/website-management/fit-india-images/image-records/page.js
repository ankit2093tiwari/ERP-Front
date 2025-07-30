"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Row, Col, Container, Button, Form, FormControl, FormLabel } from "react-bootstrap";
import Image from "next/image";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
    deleteFitIndiaImageById,
    getAllFitIndiaImages,
    updateFitIndiaImageById,
    getAllFitIndiaGroups,
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const ImageRecords = () => {
    const { hasEditAccess } = usePagePermission();
    const fileInputRef = useRef(null);
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingImageData, setEditingImageData] = useState(null);
    const [formData, setFormData] = useState({ date: "", image: null, groupName: "", shortText: "" });
    const [preview, setPreview] = useState("");
    const [errors, setErrors] = useState({});

    const fetchGroups = async () => {
        try {
            const res = await getAllFitIndiaGroups();
            setGroups(res.data || []);
        } catch {
            toast.error("Failed to fetch groups");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAllFitIndiaImages();
            const fetchedData = response.data || [];
            setData(fetchedData);
        } catch (err) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchData();
    }, []);

    const handleEdit = (row) => {
        setEditingImageData(row);
        setFormData({
            date: row.date?.split("T")[0] || "",
            image: row.image || null,
            groupName: row.groupName?._id || "",
            shortText: row.shortText || "",
        });
        setPreview(row.image || "");
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image || !formData.groupName) {
            setErrors({
                image: !formData.image ? "Please select image" : "",
                groupName: !formData.groupName ? "Please select group" : "",
            });
            return;
        }
        try {
            setLoading(true);
            const updateFormData = new FormData();
            updateFormData.append("date", formData.date);
            updateFormData.append("shortText", formData.shortText);
            updateFormData.append("groupName", formData.groupName);
            updateFormData.append("image", formData.image);
            await updateFitIndiaImageById(editingImageData._id, updateFormData);
            toast.success("Updated successfully");
            setEditingImageData(null);
            setPreview("");
            fetchData();
        } catch (err) {
            toast.error("Failed to update");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this entry?")) {
            try {
                setLoading(true);
                const response = await deleteFitIndiaImageById(id);
                if (response?.success) toast.success("Record Deleted Successfully");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete data");
            } finally {
                setLoading(false);
            }
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
            cell: (row) => (
                row.image ? (
                    <Image src={row.image} alt="Image" width={50} height={50} style={{ objectFit: "cover" }} />
                ) : (
                    <span>No Image</span>
                )
            ),
            width: "80px",
        },
        {
            name: "Short Text",
            selector: (row) => row.shortText || "N/A",
        },
        {
            name: "Date",
            selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
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
    ].filter(Boolean)
    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Fit India Images", link: "/website-management/fit-india-images/all-module" },
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
                    {!editingImageData ? (
                        <div className="tableSheet">
                            <h2>Images Records</h2>
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <Table
                                    columns={columns}
                                    data={data}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Edit Image</h2>
                            </div>
                            <Form onSubmit={handleUpdateSubmit} className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Date</FormLabel>
                                        <FormControl
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </Col>
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Upload Image</FormLabel>
                                        <FormControl
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setFormData({ ...formData, image: file });
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {errors.image && <div className="text-danger mt-1">{errors.image}</div>}
                                        {preview && (
                                            <div className="mt-2">
                                                <Image src={preview} alt="Preview" height={80} width={120}/>
                                            </div>
                                        )}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Group Name</FormLabel>
                                        <Form.Select
                                            name="groupName"
                                            value={formData.groupName}
                                            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                        >
                                            <option value="">Select a group</option>
                                            {groups.map((group) => (
                                                <option key={group._id} value={group._id}>
                                                    {group.groupName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors.groupName && <div className="text-danger mt-1">{errors.groupName}</div>}
                                    </Col>

                                    <Col lg={6}>
                                        <FormLabel className="labelForm">Short Text</FormLabel>
                                        <FormControl
                                            as="textarea"
                                            name="shortText"
                                            rows={1}
                                            value={formData.shortText}
                                            onChange={(e) => setFormData({ ...formData, shortText: e.target.value })}
                                        />
                                    </Col>
                                </Row>

                                {hasEditAccess && (
                                    <div className="mt-4">
                                        <Button type="submit" disabled={loading} className="btn btn-primary me-2">
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button variant="secondary" onClick={() => setEditingImageData(null)}>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(ImageRecords), { ssr: false });