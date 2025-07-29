"use client";
import usePagePermission from "@/hooks/usePagePermission";
import { getContactDetails, updateContactDetail } from "@/Services";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const ContactDetailsForm = () => {
    const { hasEditAccess } = usePagePermission()
    const [formData, setFormData] = useState({
        schoolName: "",
        phone1: "",
        phone2: "",
        email: "",
        address: "",
        headerLogo: null,
        footerLogo: null,
    });
    const [errors, setErrors] = useState({});
    const [headerPreview, setHeaderPreview] = useState(null);
    const [footerPreview, setFooterPreview] = useState(null);

    const fetchContactDetails = async () => {
        try {
            const res = await getContactDetails();
            const data = res?.data;
            if (data) {
                setFormData({
                    schoolName: data.schoolName || "",
                    phone1: data.phone1 || "",
                    phone2: data.phone2 || "",
                    email: data.email || "",
                    address: data.address || "",
                    headerLogo: null,
                    footerLogo: null,
                });
                setHeaderPreview(data.headerLogo || null);
                setFooterPreview(data.footerLogo || null);
            }
        } catch (error) {
            toast.error("Failed to load contact details");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchContactDetails();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!formData.schoolName || formData.schoolName.length < 3 || formData.schoolName.length > 100) {
            newErrors.schoolName = "School name must be between 3 and 100 characters.";
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone1)) {
            newErrors.phone1 = "Phone number must be a valid 10-digit number.";
        }

        if (!phoneRegex.test(formData.phone2)) {
            newErrors.phone2 = "Phone number must be a valid 10-digit number.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email address is not valid.";
        }

        if (!formData.address || formData.address.length < 10 || formData.address.length > 300) {
            newErrors.address = "Address must be between 10 and 300 characters.";
        }

        if (!formData.headerLogo && !headerPreview) {
            newErrors.headerLogo = "Header logo is required.";
        }

        if (!formData.footerLogo && !footerPreview) {
            newErrors.footerLogo = "Footer logo is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "headerLogo" || name === "footerLogo") {
            const file = files[0];
            setFormData((prev) => ({ ...prev, [name]: file }));
            const previewUrl = URL.createObjectURL(file);
            name === "headerLogo" ? setHeaderPreview(previewUrl) : setFooterPreview(previewUrl);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formPayload = new FormData();
        for (let key in formData) {
            if (formData[key]) {
                formPayload.append(key, formData[key]);
            }
        }

        try {
            await updateContactDetail(formPayload);
            toast.success("Contact Details Updated successfully!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update contact details!");
        }
    };

    return (
        <section>
            <Container>
                <div className="cover-sheet">
                    <div className="studentHeading">
                        <h2>Contact Details</h2>
                    </div>
                    <Form className="formSheet" onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>School Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="schoolName"
                                                value={formData.schoolName}
                                                onChange={handleChange}
                                            />
                                            {errors.schoolName && <div className="text-danger">{errors.schoolName}</div>}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone No 1 <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phone1"
                                                value={formData.phone1}
                                                onChange={handleChange}
                                            />
                                            {errors.phone1 && <div className="text-danger">{errors.phone1}</div>}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone No 2 <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phone2"
                                                value={formData.phone2}
                                                onChange={handleChange}
                                            />
                                            {errors.phone2 && <div className="text-danger">{errors.phone2}</div>}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            {errors.email && <div className="text-danger">{errors.email}</div>}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                            {errors.address && <div className="text-danger">{errors.address}</div>}
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row>
                                    <Col md={12} className="mb-4">
                                        <Form.Group>
                                            <Form.Label>Header Logo Image <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="file" name="headerLogo" accept="image/*" onChange={handleChange} />
                                            {errors.headerLogo && <div className="text-danger">{errors.headerLogo}</div>}
                                            {headerPreview && <img src={headerPreview} alt="Header Logo" width={60} className="mt-2 float-end" />}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label>Footer Logo Image <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="file" name="footerLogo" accept="image/*" onChange={handleChange} />
                                            {errors.footerLogo && <div className="text-danger">{errors.footerLogo}</div>}
                                            {footerPreview && <img src={footerPreview} alt="Footer Logo" width={60} className="mt-2 float-end" />}
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        {hasEditAccess && (
                            <Button type="submit" variant="success" className="mt-3">
                                Update
                            </Button>
                        )}
                    </Form>
                </div>
            </Container>
        </section>
    );
};

export default ContactDetailsForm;
