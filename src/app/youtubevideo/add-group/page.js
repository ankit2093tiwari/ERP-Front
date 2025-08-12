"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
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
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";
import {
    addNewYoutubeVideoGroup,
    deleteYoutubeVideoGroupById,
    getYoutubeVideoGroups,
    updateYoutubeVideoGroupById,
} from "@/Services";

const AddYoutubeVideoGroup = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getYoutubeVideoGroups();
            setData(response?.data);
        } catch {
            toast.error("Failed to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setGroupName("");
        setFieldError("");
        setIsFormOpen(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleAddOrUpdate = async () => {
        if (!groupName.trim()) {
            setFieldError("Group name is required.");
            toast.warning("Please enter a valid Group name.");
            return;
        }

        const exists = data.find(
            (cat) =>
                cat.groupName.trim().toLowerCase() === groupName.trim().toLowerCase() &&
                cat._id !== editingId
        );

        if (exists) {
            setFieldError("Group already exists.");
            toast.warning("Group already exists!");
            return;
        }

        try {
            if (isEditing) {
                await updateYoutubeVideoGroupById(editingId, { groupName });
                toast.success("Group updated successfully!");
            } else {
                await addNewYoutubeVideoGroup({ groupName });
                toast.success("Group added successfully!");
            }
            fetchData();
            resetForm();
        } catch {
            toast.error(`Failed to ${isEditing ? "update" : "add"} Group. Please try again later.`);
        }
    };

    const handleEdit = (id, name) => {
        setIsEditing(true);
        setEditingId(id);
        setGroupName(name);
        setFieldError("");
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this Group?")) {
            try {
                await deleteYoutubeVideoGroupById(id);
                toast.success("Group deleted successfully");
                fetchData();
            } catch {
                toast.error("Failed to delete Group. Please try again later.");
            }
        }
    };

    const handlePrint = () => {
        const headers = [["#", "Group Name"]];
        const rows = data.map((row, i) => [i + 1, row.groupName || "N/A"]);
        printContent(headers, rows);
    };

    const handleCopy = () => {
        const headers = ["#", "Group Name"];
        const rows = data.map((row, i) => `${i + 1}\t${row.groupName || "N/A"}`);
        copyContent(headers, rows);
    };

    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: false,
            width: "80px",
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
                    <Button size="sm" variant="success" onClick={() => handleEdit(row._id, row.groupName)}>
                        <FaEdit />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}>
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ].filter(Boolean);

    useEffect(() => {
        fetchData();
    }, []);

    const breadcrumbItems = [
        { label: "Youtube Video", link: "/youtubevideo/all-module" },
        { label: "Add Group", link: null },
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
                    {hasSubmitAccess && (
                        <Button onClick={() => {
                            resetForm(); // Reset in case editing was in progress
                            setIsFormOpen(true);
                        }} className="btn-add">
                            <CgAddR /> Add Group
                        </Button>
                    )}

                    {isFormOpen && (
                        <div className="cover-sheet">
                            <div className="studentHeading">
                                <h2>{isEditing ? "Edit Group" : "Add New Group"}</h2>
                                <button
                                    className="closeForm"
                                    onClick={resetForm}
                                >
                                    X
                                </button>
                            </div>
                            <Form className="formSheet">
                                <Row className="mb-3">
                                    <Col lg={6}>
                                        <FormLabel className="labelForm">
                                            Group Name<span className="text-danger">*</span>
                                        </FormLabel>
                                        <FormControl
                                            type="text"
                                            placeholder="Enter Group Name"
                                            value={groupName}
                                            onChange={(e) => {
                                                setGroupName(e.target.value);
                                                if (fieldError) setFieldError("");
                                            }}
                                            isInvalid={!!fieldError}
                                        />
                                        {fieldError && (
                                            <div className="text-danger mt-1">{fieldError}</div>
                                        )}
                                    </Col>
                                </Row>
                                <Button onClick={handleAddOrUpdate} variant="success">
                                    {isEditing ? "Update Group" : "Add Group"}
                                </Button>
                            </Form>
                        </div>
                    )}

                    <div className="tableSheet">
                        <h2>Group Records</h2>
                        {loading && <p>Loading...</p>}
                        {!loading && (
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

export default dynamic(() => Promise.resolve(AddYoutubeVideoGroup), { ssr: false });
