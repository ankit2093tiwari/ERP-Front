"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    Form,
    Row,
    Col,
    Container,
    FormLabel,
    FormSelect,
    FormControl,
    Button,
} from "react-bootstrap";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import {
    addNewBookEntry,
    getAllPublishers,
    getAllRacks,
    getBookCategories,
    getLibraryGroups,
    getLibraryVendors,
    getShelfByRackId,
} from "@/Services";
import { toast } from "react-toastify";

const NewBookEntry = () => {
    const [bookCategories, setBookCategories] = useState([]);
    const [libraryGroups, setLibraryGroups] = useState([]);
    const [libraryVendors, setLibraryVendors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [racks, setRacks] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [errors, setErrors] = useState({});

    const initialFormData = {
        itemGroup: "",
        itemVolume: "",
        accessionNo: "",
        accessionDate: "",
        bookTitle: "",
        subject: "",
        subTitle: "",
        description: "",
        classificationNo: "",
        costPrice: "",
        discount: "",
        edition: "",
        bookCategory: "",
        classNo: "",
        bookNo: "",
        itemStatus: "In Stock",
        pageNumber: "",
        authorName1: "",
        authorName2: "",
        authorName3: "",
        language: "",
        publicationYear: "",
        publisher: "",
        rack: "",
        shelf: "",
        isbnNo: "",
        vendor: "",
        billNo: "",
        billDate: "",
    };

    const handleRackChange = async (e) => {
        const rackId = e.target.value;
        setFormData((prev) => ({ ...prev, rack: rackId, shelf: "" }));
        const response = await getShelfByRackId(rackId);
        setShelves(response?.data || []);
        // Clear errors when user selects a rack
        setErrors((prev) => ({
            ...prev,
            rack: "",
            shelf: ""
        }));
    };

    const [formData, setFormData] = useState(initialFormData);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Required fields validation
        if (!formData.itemGroup) {
            newErrors.itemGroup = "Item Group is required";
            isValid = false;
        }
        if (!formData.accessionNo) {
            newErrors.accessionNo = "Accession No is required";
            isValid = false;
        } else if (isNaN(Number(formData.accessionNo))) {
            newErrors.accessionNo = "Accession No must be a number";
            isValid = false;
        }
        if (!formData.accessionDate) {
            newErrors.accessionDate = "Accession Date is required";
            isValid = false;
        }
        if (!formData.bookTitle) {
            newErrors.bookTitle = "Book Title is required";
            isValid = false;
        }
        if (!formData.classNo) {
            newErrors.classNo = "Class No is required";
            isValid = false;
        }
        if (!formData.bookNo) {
            newErrors.bookNo = "Book No is required";
            isValid = false;
        }
        if (!formData.pageNumber) {
            newErrors.pageNumber = "Page Number is required";
            isValid = false;
        } else if (isNaN(Number(formData.pageNumber))) {
            newErrors.pageNumber = "Page Number must be a number";
            isValid = false;
        }
        if (!formData.authorName1) {
            newErrors.authorName1 = "Author Name 1 is required";
            isValid = false;
        }
        if (!formData.bookCategory) {
            newErrors.bookCategory = "Book Category is required";
            isValid = false;
        }
        if (!formData.publisher) {
            newErrors.publisher = "Publisher is required";
            isValid = false;
        }
        if (!formData.rack) {
            newErrors.rack = "Rack is required";
            isValid = false;
        }
        if (!formData.shelf) {
            newErrors.shelf = "Shelf is required";
            isValid = false;
        }

        // Numeric fields validation
        if (formData.discount && isNaN(Number(formData.discount))) {
            newErrors.discount = "Discount must be a number";
            isValid = false;
        }

        // Date validation
        if (formData.billDate && new Date(formData.billDate) > new Date()) {
            newErrors.billDate = "Bill Date cannot be in the future";
            isValid = false;
        }
        if (formData.accessionDate && new Date(formData.accessionDate) > new Date()) {
            newErrors.accessionDate = "Accession Date cannot be in the future";
            isValid = false;
        }
        if (!formData.vendor) {
            newErrors.vendor = "Vendor is required";
            isValid = false;
        }


        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            // Prepare data for backend
            const submissionData = {
                ...formData,
                accessionNo: Number(formData.accessionNo),
                pageNumber: Number(formData.pageNumber),
                discount: formData.discount ? Number(formData.discount) : 0,
                costPrice: formData.costPrice ? Number(formData.costPrice) : 0,
                accessionDate: new Date(formData.accessionDate),
                billDate: formData.billDate ? new Date(formData.billDate) : null,
            };

            const response = await addNewBookEntry(submissionData)
            toast.success(response?.message || "Book entry submitted successfully!")
            setFormData(initialFormData);
            setShelves([])
            setErrors({});
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to create book entry";

            if (errorMessage.includes("duplicate key error") && errorMessage.includes("accessionNo")) {
                toast.error("Accession Number already exists. Please use a unique number.");
            } else {
                toast.error(errorMessage);
            }
            console.error("Submission error:", error);
        }
    };

    const fetchAll = async () => {
        try {
            const [cats, groups, pubs, racksData, vendors] = await Promise.all([
                getBookCategories(),
                getLibraryGroups(),
                getAllPublishers(),
                getAllRacks(),
                getLibraryVendors(),
            ]);
            setBookCategories(cats?.data || []);
            setLibraryGroups(groups?.data || []);
            setPublishers(pubs?.data || []);
            setRacks(racksData?.data || []);
            setLibraryVendors(vendors?.data || []);
        } catch (error) {
            toast.error("Failed to load initial data");
            console.error("Fetch error:", error);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const breadcrumbItems = [
        { label: "Library", link: "/library/all-module" },
        { label: "New Book Entry", link: null },
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
                <div className="cover-sheet">
                    <div className="studentHeading">
                        <h2>New Book Entry</h2>
                    </div>
                    <Container>
                        <Form className="formSheet" onSubmit={handleSubmit}>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item Group <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="itemGroup"
                                        value={formData.itemGroup}
                                        onChange={handleChange}
                                        isInvalid={!!errors.itemGroup}
                                    >
                                        <option value="">Select</option>
                                        {libraryGroups.map((g) => (
                                            <option key={g._id} value={g._id}>
                                                {g.groupName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.itemGroup}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item Volume</FormLabel>
                                    <FormControl
                                        name="itemVolume"
                                        value={formData.itemVolume}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Accession No <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="accessionNo"
                                        value={formData.accessionNo}
                                        onChange={handleChange}
                                        isInvalid={!!errors.accessionNo}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.accessionNo}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Accession Date <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        type="date"
                                        name="accessionDate"
                                        value={formData.accessionDate}
                                        onChange={handleChange}
                                        isInvalid={!!errors.accessionDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.accessionDate}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book Title <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="bookTitle"
                                        value={formData.bookTitle}
                                        onChange={handleChange}
                                        isInvalid={!!errors.bookTitle}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.bookTitle}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Subject</FormLabel>
                                    <FormControl
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Sub Title</FormLabel>
                                    <FormControl
                                        name="subTitle"
                                        value={formData.subTitle}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Description</FormLabel>
                                    <FormControl
                                        as="textarea"
                                        rows={1}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Classification No</FormLabel>
                                    <FormControl
                                        name="classificationNo"
                                        value={formData.classificationNo}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Cost Price</FormLabel>
                                    <FormControl
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        isInvalid={!!errors.costPrice}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.costPrice}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Discount</FormLabel>
                                    <FormControl
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        isInvalid={!!errors.discount}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.discount}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Edition</FormLabel>
                                    <FormControl
                                        name="edition"
                                        value={formData.edition}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book Category <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="bookCategory"
                                        value={formData.bookCategory}
                                        onChange={handleChange}
                                        isInvalid={!!errors.bookCategory}
                                    >
                                        <option value="">Select</option>
                                        {bookCategories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.groupName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.bookCategory}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Class No <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="classNo"
                                        value={formData.classNo}
                                        onChange={handleChange}
                                        isInvalid={!!errors.classNo}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.classNo}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Book No <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="bookNo"
                                        value={formData.bookNo}
                                        onChange={handleChange}
                                        isInvalid={!!errors.bookNo}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.bookNo}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Item Status</FormLabel>
                                    <FormSelect
                                        name="itemStatus"
                                        value={formData.itemStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Issued">Issued</option>
                                        <option value="Lost">Lost</option>
                                        <option value="Damaged">Damaged</option>
                                    </FormSelect>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Total Page Number <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="pageNumber"
                                        value={formData.pageNumber}
                                        onChange={handleChange}
                                        isInvalid={!!errors.pageNumber}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.pageNumber}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 1 <span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="authorName1"
                                        value={formData.authorName1}
                                        onChange={handleChange}
                                        isInvalid={!!errors.authorName1}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.authorName1}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 2</FormLabel>
                                    <FormControl
                                        name="authorName2"
                                        value={formData.authorName2}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Author Name 3</FormLabel>
                                    <FormControl
                                        name="authorName3"
                                        value={formData.authorName3}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Language</FormLabel>
                                    <FormSelect
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                    </FormSelect>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Publication Year</FormLabel>
                                    <FormControl
                                        name="publicationYear"
                                        value={formData.publicationYear}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Publisher <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleChange}
                                        isInvalid={!!errors.publisher}
                                    >
                                        <option value="">Select</option>
                                        {publishers.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.publisherName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.publisher}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Rack <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="rack"
                                        value={formData.rack}
                                        onChange={handleRackChange}
                                        isInvalid={!!errors.rack}
                                    >
                                        <option value="">Select</option>
                                        {racks.map((r) => (
                                            <option key={r._id} value={r._id}>
                                                {r.rackName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.rack}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Shelf <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="shelf"
                                        value={formData.shelf}
                                        onChange={handleChange}
                                        disabled={!shelves.length}
                                        isInvalid={!!errors.shelf}
                                    >
                                        <option value="">Select</option>
                                        {shelves.map((s) => (
                                            <option key={s._id} value={s.shelfName}>
                                                {s.shelfName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.shelf}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">ISBN No</FormLabel>
                                    <FormControl
                                        name="isbnNo"
                                        value={formData.isbnNo}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Vendor <span className="text-danger">*</span></FormLabel>
                                    <FormSelect
                                        name="vendor"
                                        value={formData.vendor}
                                        onChange={handleChange}
                                        isInvalid={!!errors.vendor}
                                    >
                                        <option value="">Select</option>
                                        {libraryVendors.map((v) => (
                                            <option key={v._id} value={v._id}>
                                                {v.organizationName}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.vendor}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Bill No</FormLabel>
                                    <FormControl
                                        name="billNo"
                                        value={formData.billNo}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col lg={3}>
                                    <FormLabel className="labelForm">Bill Date</FormLabel>
                                    <FormControl
                                        type="date"
                                        name="billDate"
                                        value={formData.billDate}
                                        onChange={handleChange}
                                        isInvalid={!!errors.billDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.billDate}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                            <Row className="mb-2">
                                <Col className="text-center">
                                    <Button className="btn btn-primary mt-4" type="submit">
                                        Submit
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </div>
            </section>
        </>
    );
};

export default dynamic(() => Promise.resolve(NewBookEntry), { ssr: false });