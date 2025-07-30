
"use client";
import { useEffect, useState } from "react";
import {
    Container, Row, Col, Form, Button, FormLabel, FormControl
} from "react-bootstrap";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";
import { addNewPublicationImage, deletePublicationImageById, getAllPublicationImages, updatePublicationImageById } from "@/Services";
import Image from "next/image";
import usePagePermission from "@/hooks/usePagePermission";
import { CgAddR } from "react-icons/cg";

const AddPublicationImage = () => {
    const { hasEditAccess, hasSubmitAccess } = usePagePermission()
    const [formData, setFormData] = useState({ date: "", image: null });
    const [records, setRecords] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        setFormData((prev) => ({ ...prev, date: today }));
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        const res = await getAllPublicationImages();
        setRecords(res?.data || []);
    };

    const handleChange = (e) => {
        const { name, files } = e.target;
        if (name === "image") {
            setFormData((prev) => ({ ...prev, image: files[0] }));
            setErrors((prev) => ({ ...prev, image: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!formData.image && !editingId) newErrors.image = "Please select an image.";
        if (Object.keys(newErrors).length) return setErrors(newErrors);

        const form = new FormData();
        form.append("date", formData.date);
        if (formData.image) form.append("image", formData.image);

        try {
            setLoading(true);
            if (editingId) {
                await updatePublicationImageById(editingId, form);
                toast.success("Updated successfully");
            } else {
                await addNewPublicationImage(form);
                toast.success("Image uploaded");
            }

            setFormData({ date: formData.date, image: null });
            setEditingId(null);
            setIsFormOpen(false);
            fetchRecords();
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        if (!hasEditAccess) return;
        setEditingId(row._id);
        setFormData({ date: row.date, image: null });
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure to delete this image?")) return;
        await deletePublicationImageById(id);
        toast.success("Deleted successfull");
        fetchRecords();
    };

    const handleCopy = () => {
        const headers = ["#", "Create date", "Image", "Created By", "Updated Date", "Updated By"];
        const rows = records.map((row, index) => [
            index + 1,
            row.date || "-",
            row.image || "-",
            row.createdBy || "-",
            row.updatedDate || "-",
            row.updatedBy || "-"
        ].join("\t"));
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Create date", "Image", "Created By", "Updated Date", "Updated By"]];
        const rows = records.map((row, index) => [
            index + 1,
            row.date || "-",
            row.image || "-",
            row.createdBy || "-",
            row.updatedDate || "-",
            row.updatedBy || "-"
        ]);
        printContent(headers, rows);
    };

    const columns = [
        { name: "#", selector: (row, i) => i + 1, width: "60px" },
        { name: "Create date", selector: (row) => row.date || "-" },
        {
            name: "Image",
            cell: (row) =>
                row.image ? (
                    <Image
                        height={40}
                        width={80}
                        src={row.image}
                        alt="slider"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                ) : (
                    "N/A"
                ),
        },
        { name: "Created By", selector: (row) => row.createdBy || "N/A" },
        { name: "Updated Date", selector: (row) => new Date(row.updatedAt).toLocaleDateString() || "N/A" },
        { name: "Updated By", selector: (row) => row.updatedBy || "N/A" },
        hasEditAccess && {
            name: "Action",
            cell: (row) => (
                <div className="d-flex gap-1">
                    {hasEditAccess && <Button size="sm" variant="success" onClick={() => handleEdit(row)}><FaEdit /></Button>}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </div>
            )
        },
    ];

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Add Publication Image", link: null },
    ];

    return (
        <>
            <div className="breadcrumbSheet position-relative">
                <Container>
                    <Row className="mt-1 mb-1">
                        <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
                    </Row>
                </Container>
            </div>

            <section>
                <Container>
                    {hasSubmitAccess && (
                        <Button onClick={() => setIsFormOpen(true)} className="btn-add">
                            <CgAddR /> Add Publication Image
                        </Button>
                    )}

                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>Add Publication Image</h2>
                                <button
                                    className="closeForm"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingId(null)
                                    }}
                                >
                                    X
                                </button>
                            </div>
                            <Form onSubmit={handleSubmit} className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel>Date<span className="text-danger">*</span></FormLabel>
                                        <FormControl value={formData.date} readOnly />
                                    </Col>
                                    <Col lg={6}>
                                        <FormLabel>Image (jpeg, jpg, png, gif)<span className="text-danger">*</span></FormLabel>
                                        <FormControl
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif"
                                            name="image"
                                            onChange={handleChange}
                                        />
                                        {errors.image && <div className="text-danger small">{errors.image}</div>}
                                    </Col>
                                </Row>
                                <Button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (editingId ? "Updating..." : "Uploading...") : (editingId ? "Update" : "Add Publication Image")}
                                </Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2> Publication Image Records</h2>
                        <Table
                            data={records}
                            columns={columns}
                            handleCopy={handleCopy}
                            handlePrint={handlePrint}
                        />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default AddPublicationImage;
