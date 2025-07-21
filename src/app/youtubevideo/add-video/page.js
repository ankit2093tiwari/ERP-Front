"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    Button, Col, Container, Form, FormControl, FormLabel, Row,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { getYoutubeVideoGroups, getClasses, getSections, addNewYoutubeVideo } from "@/Services";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";

const YOUTUBE_EMBED_REGEX = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;

const AddYoutubeVideo = () => {
    const { hasSubmitAccess } = usePagePermission();

    const [groupOptions, setGroupOptions] = useState([]);
    const [classOptions, setClassOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);

    const [formData, setFormData] = useState({
        date: "",
        groupName: "",
        class: "",
        section: "",
        youtubeLink: "",
    });

    const [fieldError, setFieldError] = useState({});

    const breadcrumbItems = [
        { label: "Youtube Video", link: "/youtubevideo/all-module" },
        { label: "Add Video", link: null },
    ];

    const fetchOptions = async () => {
        try {
            const [groupsRes, classesRes] = await Promise.all([
                getYoutubeVideoGroups(),
                getClasses(),
            ]);
            setGroupOptions(groupsRes?.data || []);
            setClassOptions(classesRes?.data || []);
        } catch {
            toast.error("Failed to fetch dropdown options.");
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    const handleInputChange = (field, value) => {
        const newValue = ["class", "groupName", "section"].includes(field)
            ? value?.toString()
            : value;
        setFormData((prev) => ({ ...prev, [field]: newValue }));

        if (fieldError[field]) {
            setFieldError({ ...fieldError, [field]: "" });
        }
    };

    const handleClassChange = async (selectedClassId) => {
        handleInputChange("class", selectedClassId);
        handleInputChange("section", "");
        if (!selectedClassId) {
            setSectionOptions([]);
            return;
        }
        try {
            const res = await getSections(selectedClassId);
            setSectionOptions(res?.data || []);
        } catch {
            toast.error("Failed to fetch sections.");
            setSectionOptions([]);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.date) errors.date = "Date is required.";
        if (!formData.groupName) errors.groupName = "Group is required.";
        if (!formData.class) errors.class = "Class is required.";
        if (!formData.section) errors.section = "Section is required.";
        if (!formData.youtubeLink || !YOUTUBE_EMBED_REGEX.test(formData.youtubeLink))
            errors.youtubeLink = "Enter a valid YouTube embed link.";
        setFieldError(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            date: "",
            groupName: "",
            class: "",
            section: "",
            youtubeLink: "",
        });
        setFieldError({});
        setSectionOptions([]);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.warning("Please fill in all required fields.");
            return;
        }
        try {
            await addNewYoutubeVideo(formData);
            toast.success("Video added successfully.");
            resetForm();
        } catch {
            toast.error("Failed to add video.");
        }
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
                    <div className="cover-sheet">
                        <div className="studentHeading">
                            <h2>Add New Video</h2>
                        </div>
                        <Form className="formSheet">
                            <Row className="mb-3">
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Date<span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange("date", e.target.value)}
                                        isInvalid={!!fieldError.date}
                                    />
                                    {fieldError.date && <div className="text-danger">{fieldError.date}</div>}
                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Group Name<span className="text-danger">*</span></FormLabel>
                                    <Form.Select
                                        value={formData.groupName}
                                        onChange={(e) => handleInputChange("groupName", e.target.value)}
                                        isInvalid={!!fieldError.groupName}
                                    >
                                        <option value="">-- Select Group --</option>
                                        {groupOptions.map((g) => (
                                            <option key={g._id} value={g._id.toString()}>
                                                {g.groupName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {fieldError.groupName && <div className="text-danger">{fieldError.groupName}</div>}
                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Class<span className="text-danger">*</span></FormLabel>
                                    <Form.Select
                                        value={formData.class}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        isInvalid={!!fieldError.class}
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classOptions.map((c) => (
                                            <option key={c._id} value={c._id.toString()}>
                                                {c.class_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {fieldError.class && <div className="text-danger">{fieldError.class}</div>}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Section<span className="text-danger">*</span></FormLabel>
                                    <Form.Select
                                        value={formData.section}
                                        onChange={(e) => handleInputChange("section", e.target.value)}
                                        isInvalid={!!fieldError.section}
                                    >
                                        <option value="">-- Select Section --</option>
                                        {sectionOptions.map((s) => (
                                            <option key={s._id} value={s._id.toString()}>
                                                {s.section_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {fieldError.section && <div className="text-danger">{fieldError.section}</div>}
                                </Col>
                                <Col lg={8}>
                                    <FormLabel className="labelForm">YouTube Embed Link<span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="text"
                                        placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                        value={formData.youtubeLink}
                                        onChange={(e) => handleInputChange("youtubeLink", e.target.value)}
                                        isInvalid={!!fieldError.youtubeLink}
                                    />
                                    {fieldError.youtubeLink && <div className="text-danger">{fieldError.youtubeLink}</div>}
                                </Col>
                            </Row>
                            {
                                hasSubmitAccess && (
                                    <Button onClick={handleSubmit} className="btn btn-primary">
                                        Add Video
                                    </Button>
                                )
                            }
                        </Form>
                    </div>
                </Container>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(AddYoutubeVideo), { ssr: false });
