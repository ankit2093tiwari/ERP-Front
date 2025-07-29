"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {Form,Row,Col,Container,FormLabel,FormControl,Button,Alert,} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";

import usePagePermission from "@/hooks/usePagePermission";
import { addNewFitIndiaGroup, deleteFitIndiaGroupById, getAllFitIndiaGroups, updateFitIndiaGroupById } from "@/Services";

const AddFitIndiaGroup = () => {
    const { hasEditAccess, hasSubmitAccess } = usePagePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fieldError, setFieldError] = useState("");
    const [formData, setFormData] = useState({
        groupName: "",
    });

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            width: "80px",
            sortable: false,
        },
        {
            name: "Group Name",
            selector: (row) => row.groupName || "N/A",
            sortable: true,
        },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button
                        size="sm"
                        variant="success"
                        className="me-1"
                        onClick={() => {
                            setIsEditMode(true);
                            setIsPopoverOpen(true);
                            setEditingId(row._id);
                            setFormData({ groupName: row.groupName || "" });
                            setFieldError("");
                        }}
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(row._id)}
                    >
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean); // remove false entries if no edit access

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAllFitIndiaGroups();
            setData(response.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to fetch groups. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this group?")) {
            try {
                await deleteFitIndiaGroupById(id);
                fetchData();
                toast.success("Group deleted successfully!");
            } catch (error) {
                console.error("Error deleting data:", error);
                toast.error("Failed to delete group. Please try again later.");
            }
        }
    };

    const handleFormSubmit = async () => {
        if (!formData.groupName.trim()) {
            setFieldError("Please enter a group name.");
            toast.warn("Please enter a group name.");
            return;
        }

        const existingGroup = data.find(
            (group) =>
                group.groupName.toLowerCase() === formData.groupName.toLowerCase() &&
                group._id !== editingId
        );

        if (existingGroup) {
            setFieldError("Group with this name already exists.");
            toast.warn("Group with this name already exists.");
            return;
        }

        try {
            if (isEditMode && editingId) {
                await updateFitIndiaGroupById(editingId, formData);
                toast.success("Group updated successfully!");
            } else {
                await addNewFitIndiaGroup(formData);
                toast.success("Group added successfully!");
            }

            fetchData();
            setIsPopoverOpen(false);
            setFormData({ groupName: "" });
            setEditingId(null);
            setIsEditMode(false);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit form. Please try again later.");
        }
    };

    const handlePrint = () => {
        const tableHeaders = [["#", "Group Name"]];
        const tableRows = data.map((row, index) => [
            index + 1,
            row.groupName || "N/A",
        ]);
        printContent(tableHeaders, tableRows);
    };

    const handleCopy = () => {
        const headers = ["#", "Group Name"];
        const rows = data.map((row, index) =>
            `${index + 1}\t${row.groupName || "N/A"}`
        );
        copyContent(headers, rows);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Fit India Images", link: "/website-management/fit-india-images/all-module" },
        { label: "Add Group", link: "null" },
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
                    {error && <Alert variant="danger">{error}</Alert>}

                    {hasSubmitAccess && (
                        <Button
                            onClick={() => {
                                setIsEditMode(false);
                                setIsPopoverOpen(true);
                                setFormData({ groupName: "" });
                                setEditingId(null);
                                setFieldError("");
                            }}
                            className="btn-add"
                        >
                            <CgAddR /> New Group
                        </Button>
                    )}

                    {isPopoverOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>{isEditMode ? "Edit Group" : "Add New Group"}</h2>
                                <button
                                    className="closeForm"
                                    onClick={() => {
                                        setIsPopoverOpen(false);
                                        setError("");
                                        setEditingId(null);
                                        setFormData({ groupName: "" });
                                        setIsEditMode(false);
                                    }}
                                >
                                    X
                                </button>
                            </div>
                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={12}>
                                        <FormLabel className="labelForm">Group Name</FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Enter Group Name"
                                            value={formData.groupName}
                                            onChange={(e) => {
                                                setFormData({ ...formData, groupName: e.target.value });
                                                if (fieldError) setFieldError("");
                                            }}
                                            isInvalid={!!fieldError}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {fieldError}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Button onClick={handleFormSubmit} className="btn btn-primary">
                                    {isEditMode ? "Update Group" : "Add Group"}
                                </Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2>Groups Records</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p style={{ color: "red" }}>{error}</p>
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

export default dynamic(() => Promise.resolve(AddFitIndiaGroup), { ssr: false });
