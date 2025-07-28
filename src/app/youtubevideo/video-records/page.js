"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Col, Container, Form, FormControl, FormLabel, Row, } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";
import {
    getAllYoutubeVideos, deleteYoutubeVideoById,
    updateYoutubeVideoById, getClasses, getSections, getYoutubeVideoGroups,
} from "@/Services";
import { copyContent, printContent } from "@/app/utils";

const YOUTUBE_EMBED_REGEX = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;

const VideoRecords = () => {
    const { hasEditAccess } = usePagePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [fieldError, setFieldError] = useState({});

    const [groupOptions, setGroupOptions] = useState([]);
    const [classOptions, setClassOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);

    const breadcrumbItems = [
        { label: "Youtube Video", link: "/youtubevideo/all-module" },
        { label: "Video Records", link: null },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [videosRes, groupsRes, classesRes] = await Promise.all([
                getAllYoutubeVideos(),
                getYoutubeVideoGroups(),
                getClasses(),
            ]);
            setData(videosRes?.data || []);
            setGroupOptions(groupsRes?.data || []);
            setClassOptions(classesRes?.data || []);
        } catch {
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = async (row) => {
        setEditingId(row._id);
        setFormData({
            date: row.date?.substring(0, 10),
            groupName: row.groupName?._id,
            class: row.class?._id,
            section: row.section?._id,
            youtubeLink: row.youtubeLink,
        });
        if (row.class?._id) {
            const secRes = await getSections(row.class._id);
            setSectionOptions(secRes?.data || []);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this video?")) return;
        try {
            await deleteYoutubeVideoById(id);
            toast.success("Video deleted.");
            fetchData();
        } catch {
            toast.error("Failed to delete video.");
        }
    };

    const handleInputChange = (field, value) => {
        const newVal = ["class", "groupName", "section"].includes(field)
            ? value?.toString()
            : value;
        setFormData((prev) => ({ ...prev, [field]: newVal }));
        setFieldError((prev) => ({ ...prev, [field]: "" }));
    };

    const handleClassChange = async (classId) => {
        handleInputChange("class", classId);
        handleInputChange("section", "");
        if (!classId) {
            setSectionOptions([]);
            return;
        }
        const res = await getSections(classId);
        setSectionOptions(res?.data || []);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.date) errors.date = "Date is required.";
        if (!formData.groupName) errors.groupName = "Group is required.";
        if (!formData.class) errors.class = "Class is required.";
        if (!formData.section) errors.section = "Section is required.";
        if (!formData.youtubeLink || !YOUTUBE_EMBED_REGEX.test(formData.youtubeLink))
            errors.youtubeLink = "Invalid YouTube embed link.";
        setFieldError(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validateForm()) {
            toast.warning("Fix errors in the form.");
            return;
        }
        try {
            await updateYoutubeVideoById(editingId, formData);
            toast.success("Video updated.");
            fetchData();
            setEditingId(null);
            setFormData({});
            setFieldError({});
        } catch {
            toast.error("Failed to update video.");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
        setFieldError({});
        setSectionOptions([]);
    };

    const columns = [
        { name: "#", selector: (_, i) => i + 1, width: "60px" },
        { name: "Group", selector: (row) => row.groupName?.groupName || "N/A", sortable: true },
        { name: "Class", selector: (row) => row.class?.class_name || "N/A", sortable: true },
        { name: "Section", selector: (row) => row.section?.section_name || "N/A", sortable: true },
        { name: "Date", selector: (row) => row.date?.substring(0, 10) || "N/A", sortable: true },
        // { name: "YouTube Link", selector: (row) => row.youtubeLink },
        {
            name: "YouTube Video",
            cell: (row) =>
                row.youtubeLink ? (
                    <iframe
                        width="200"
                        height="113"
                        src={row.youtubeLink}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video"
                    />
                ) : (
                    "N/A"
                ),
            width: "220px",
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

    const handlePrint = () => {
        const headers = [["#", "Group", "Class", "Section", "Date", "Link"]];
        const rows = data.map((v, i) => [
            i + 1,
            v.groupName?.groupName || "N/A",
            v.class?.class_name || "N/A",
            v.section?.section_name || "N/A",
            v.date?.substring(0, 10) || "N/A",
            v.youtubeLink || "N/A",
        ]);
        printContent(headers, rows);
    };

    const handleCopy = () => {
        const headers = ["#", "Group", "Class", "Section", "Date", "Link"];
        const rows = data.map((v, i) =>
            `${i + 1}\t${v.groupName?.groupName}\t${v.class?.class_name}\t${v.section?.section_name}\t${v.date?.substring(0, 10)}\t${v.youtubeLink}`
        );
        copyContent(headers, rows);
    };

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
                        <div className="cover-sheet mb-4">
                            <div className="studentHeading">
                                <h2>Edit Video</h2>
                            </div>
                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={4}>
                                        <FormLabel>Date<span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange("date", e.target.value)}
                                            isInvalid={!!fieldError.date}
                                        />
                                        <div className="text-danger">{fieldError.date}</div>
                                    </Col>
                                    <Col lg={4}>
                                        <FormLabel>Group<span className="text-danger">*</span></FormLabel>
                                        <Form.Select
                                            value={formData.groupName}
                                            onChange={(e) => handleInputChange("groupName", e.target.value)}
                                            isInvalid={!!fieldError.groupName}
                                        >
                                            <option value="">-- Select Group --</option>
                                            {groupOptions.map((g) => (
                                                <option key={g._id} value={g._id}>{g.groupName}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{fieldError.groupName}</div>
                                    </Col>
                                    <Col lg={4}>
                                        <FormLabel>Class<span className="text-danger">*</span></FormLabel>
                                        <Form.Select
                                            value={formData.class}
                                            onChange={(e) => handleClassChange(e.target.value)}
                                            isInvalid={!!fieldError.class}
                                        >
                                            <option value="">-- Select Class --</option>
                                            {classOptions.map((c) => (
                                                <option key={c._id} value={c._id}>{c.class_name}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{fieldError.class}</div>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col lg={4}>
                                        <FormLabel>Section<span className="text-danger">*</span></FormLabel>
                                        <Form.Select
                                            value={formData.section}
                                            onChange={(e) => handleInputChange("section", e.target.value)}
                                            isInvalid={!!fieldError.section}
                                        >
                                            <option value="">-- Select Section --</option>
                                            {sectionOptions.map((s) => (
                                                <option key={s._id} value={s._id}>{s.section_name}</option>
                                            ))}
                                        </Form.Select>
                                        <div className="text-danger">{fieldError.section}</div>
                                    </Col>
                                    <Col lg={8}>
                                        <FormLabel>YouTube Embed Link<span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="text"
                                            value={formData.youtubeLink}
                                            onChange={(e) => handleInputChange("youtubeLink", e.target.value)}
                                            isInvalid={!!fieldError.youtubeLink}
                                        />
                                        <div className="text-danger">{fieldError.youtubeLink}</div>
                                    </Col>
                                </Row>
                                <Button className="me-2" onClick={handleUpdate}>Update</Button>
                                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2>Video Records</h2>
                        {loading ? (
                            <p>Loading...</p>
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
        </>
    );
};

export default dynamic(() => Promise.resolve(VideoRecords), { ssr: false });
