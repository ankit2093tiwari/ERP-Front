"use client";
import { useState, useRef, useEffect } from "react";
import {
    Form,
    Row,
    Col,
    Container,
    FormLabel,
    FormControl,
    Button,
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { toast } from "react-toastify";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import usePagePermission from "@/hooks/usePagePermission";
import {
    addNewSliderImage,
    getAllSliderImages,
    deleteSliderImageById,
    updateSliderImageById,
} from "@/Services";
import Image from "next/image";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";

const AddSliderImage = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();
    const fileInputRef = useRef(null);
    const today = new Date().toISOString().split("T")[0];

    const [sliderImageData, setSliderImageData] = useState([]);
    const [sliderData, setSliderData] = useState({
        date: today,
        image: null,
    });

    const [editingId, setEditingId] = useState(null);
    const [preview, setPreview] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    // Fetch slider data
    const fetchSliderImageData = async () => {
        try {
            const response = await getAllSliderImages();
            setSliderImageData(response?.data || []);
        } catch (error) {
            console.log("Failed to fetch slider data:", error);
        }
    };

    useEffect(() => {
        fetchSliderImageData();
    }, []);

    // Validation
    const validate = () => {
        const newErrors = {};
        if (!sliderData.image && !editingId) {
            newErrors.image = "Please select an image.";
        } else if (sliderData.image) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(sliderData.image.type)) {
                newErrors.image = "Only JPG, JPEG, and PNG formats are allowed.";
            }
        }
        return newErrors;
    };

    // Input Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSliderData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSliderData((prev) => ({ ...prev, image: file }));
            setErrors((prev) => ({ ...prev, image: "" }));
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("date", sliderData.date);
            if (sliderData.image) {
                formData.append("image", sliderData.image);
            }

            if (editingId) {
                await updateSliderImageById(editingId, formData);
                toast.success("Slider image updated successfully!");
            } else {
                await addNewSliderImage(formData);
                toast.success("Slider image uploaded successfully!");
            }

            setSliderData({ date: today, image: null });
            setEditingId(null);
            setPreview("");
            fileInputRef.current.value = null;
            fetchSliderImageData();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // Edit Handler
    const handleEdit = (row) => {
        setEditingId(row._id);
        setSliderData({
            date: new Date(row.date).toISOString().split("T")[0],
            image: null,
        });
        setPreview(row.image || "");
        fileInputRef.current.value = null;
    };

    // Delete Handler
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteSliderImageById(id);
            toast.success("Slider image deleted successfully.");
            fetchSliderImageData();
        } catch (err) {
            toast.error("Failed to delete image.");
        }
    };

    // Table Columns
    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: true,
            width: "80px",
        },
        {
            name: "Date",
            selector: (row) => new Date(row.date).toLocaleDateString() || "N/A",
            sortable: true,
        },
        {
            name: "Slider Image",
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
            sortable: false,
        },
        {
            name: "Created By",
            selector: (row) => row.createdBy || "N/A",
            sortable: true,
        },
        {
            name: "Updated By",
            selector: (row) => row.updatedBy || "N/A",
            sortable: true,
        },
        {
            name: "Updated Date",
            selector: (row) =>
                row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A",
            sortable: true,
        },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button variant="success" size="sm" onClick={() => handleEdit(row)}><FaEdit /></Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </div>
            ),
        },
    ];

    const handleCopy = () => {
        const headers = [
            "#", "Date", 'Image', "CreatedBy", "UpdateBy", "Updated Date"
        ]
        const rows = sliderImageData.map((row, index) => (
            [index + 1, new Date(row.date).toLocaleDateString() || "N/A", row.image?.slice(row.image.lastIndexOf("/") + 1) || "N/A", row.createdBy || "N/A", row.updatedBy || "N/A", new Date(row.updatedAt).toLocaleDateString() || "N/A"].join('\t')
        ))
        copyContent(headers, rows)
    }
    const handlePrint = () => {
        const headers = [
            ["#", "Date", 'Image', "CreatedBy", "UpdateBy", "Updated Date"]
        ]
        const rows = sliderImageData.map((row, index) => (
            [index + 1, new Date(row.date).toLocaleDateString() || "N/A", row.image?.slice(row.image.lastIndexOf("/") + 1) || "N/A", row.createdBy || "N/A", row.updatedBy || "N/A", new Date(row.updatedAt).toLocaleDateString() || "N/A"]
        ))
        printContent(headers, rows)
    }

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Add Slider Image", link: "null" },
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
                    <div className="cover-sheet">
                        <div className="studentHeading">
                            <h2>{editingId ? "Update Slider Image" : "Add Slider Image"}</h2>
                        </div>
                        <Form onSubmit={handleSubmit} className="formSheet">
                            <Row className="mb-3">
                                <Col lg={6}>
                                    <FormLabel className="labelForm">Date</FormLabel>
                                    <FormControl
                                        type="date"
                                        name="date"
                                        value={sliderData.date}
                                        onChange={handleInputChange}
                                    />
                                </Col>

                                <Col lg={6}>
                                    <FormLabel className="labelForm">Upload Image</FormLabel>
                                    <FormControl
                                        type="file"
                                        name="image"
                                        accept=".jpg, .jpeg, .png"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    {errors.image && (
                                        <div className="text-danger mt-1">{errors.image}</div>
                                    )}
                                    {preview && (
                                        <div className="mt-2">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                style={{ maxWidth: "200px", maxHeight: "200px" }}
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            {hasSubmitAccess && (
                                <Button type="submit" disabled={loading}>
                                    {loading
                                        ? editingId
                                            ? "Updating..."
                                            : "Uploading..."
                                        : editingId
                                            ? "Update Image"
                                            : "Add Image"}
                                </Button>
                            )}
                        </Form>
                    </div>
                    <div className="tableSheet">
                        <Table data={sliderImageData} columns={columns} handleCopy={handleCopy} handlePrint={handlePrint} />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default AddSliderImage;
