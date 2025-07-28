"use client";

import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    FormLabel,
    FormControl,
    Button,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import Table from "@/app/component/DataTable";
import {
    getAllMainMenus,
    getSubMenusByMainMenuId,
    getAllLastSubMenus,
    deleteLastSubMenuById,
    updateLastSubMenuById,
    addNewLastSubMenu,
} from "@/Services";
import { copyContent, printContent } from "@/app/utils";
import usePagePermission from "@/hooks/usePagePermission";
import { CgAddR } from "react-icons/cg";

const LastSubMenuPage = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();
    const [formData, setFormData] = useState({
        menuName: "",
        subMenuId: "",
        lastSubMenuName: "",
        position: "",
        status: "Active",
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [mainMenus, setMainMenus] = useState([]);
    const [subMenus, setSubMenus] = useState([]);
    const [lastSubMenus, setLastSubMenus] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMainMenus();
        fetchLastSubMenus();
    }, []);

    useEffect(() => {
        if (formData.menuName) fetchSubMenus(formData.menuName);
    }, [formData.menuName]);

    const fetchMainMenus = async () => {
        const res = await getAllMainMenus();
        setMainMenus(res.data || []);
    };

    const fetchSubMenus = async (menuId) => {
        const res = await getSubMenusByMainMenuId(menuId);
        setSubMenus(res.data || []);
    };

    const fetchLastSubMenus = async () => {
        const res = await getAllLastSubMenus();
        setLastSubMenus(res.data || []);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.menuName) newErrors.menuName = "Main Menu is required.";
        if (!formData.subMenuId) newErrors.subMenuId = "Sub Menu is required.";
        if (!formData.lastSubMenuName || formData.lastSubMenuName.trim() === "") {
            newErrors.lastSubMenuName = "Last Sub Menu Name is required.";
        } else if (formData.lastSubMenuName.trim().length < 3) {
            newErrors.lastSubMenuName = "Must be at least 3 characters.";
        }
        if (!formData.position) {
            newErrors.position = "Position is required.";
        } else if (isNaN(formData.position)) {
            newErrors.position = "Position must be a number.";
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const resetForm = () => {
        setFormData({
            menuName: "",
            subMenuId: "",
            lastSubMenuName: "",
            position: "",
            status: "Active",
        });
        setEditingId(null);
        setErrors({});
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                position: parseInt(formData.position, 10),
            };
            if (editingId) {
                await updateLastSubMenuById(editingId, payload);
                toast.success("Updated successfully.");
            } else {
                await addNewLastSubMenu(payload);
                toast.success("Added successfully.");
            }
            fetchLastSubMenus();
            resetForm();
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setEditingId(row._id);
        setIsFormOpen(true);
        setFormData({
            menuName: row.menuName?._id || "",
            subMenuId: row.subMenuId?._id || "",
            lastSubMenuName: row.lastSubMenuName || "",
            position: String(row.position || ""),
            status: row.status || "Active",
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            await deleteLastSubMenuById(id);
            toast.success("Deleted successfully.");
            fetchLastSubMenus();
        } catch (err) {
            toast.error("Failed to delete.");
        }
    };

    const handleCopy = () => {
        const headers = ["#", "Main Menu", "Sub Menu", "Last Sub Menu", "Position", "Status"];
        const rows = lastSubMenus.map((row, index) => [
            index + 1,
            row.menuName?.menuName || "N/A",
            row.subMenuId?.subMenuName || "N/A",
            row.lastSubMenuName || "N/A",
            row.position || "N/A",
            row.status || "N/A",
        ].join("\t"));
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Main Menu", "Sub Menu", "Last Sub Menu", "Position", "Status"]];
        const rows = lastSubMenus.map((row, index) => [
            index + 1,
            row.menuName?.menuName || "N/A",
            row.subMenuId?.subMenuName || "N/A",
            row.lastSubMenuName || "N/A",
            row.position || "N/A",
            row.status || "N/A",
        ]);
        printContent(headers, rows);
    };

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "Main Menu", selector: (row) => row.menuName?.menuName || "N/A" },
        { name: "Sub Menu", selector: (row) => row.subMenuId?.subMenuName || "N/A" },
        { name: "Last Sub Menu", selector: (row) => row.lastSubMenuName || "N/A" },
        { name: "Position", selector: (row) => row.position ?? "N/A" },
        { name: "CreatedBy", selector: (row) => row.createdBy ?? "N/A" },
        { name: "UpdatedBy", selector: (row) => row.updatedBy ?? "N/A" },
        { name: "Status", selector: (row) => row.status || "N/A" },
        hasEditAccess && {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button size="sm" variant="success" onClick={() => handleEdit(row)}><FaEdit /></Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </div>
            ),
        },
    ].filter(Boolean);

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Add Last Sub Menu", link: "null" },
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
                            <CgAddR /> Add LastSubMenu
                        </Button>
                    )}
                    {
                        isFormOpen && (
                            <div className="cover-sheet">
                                <div className="studentHeading">
                                    <h2>{editingId ? "Update Last Sub Menu" : "Add Last Sub Menu"}</h2>
                                    <button className="closeForm" onClick={resetForm}>X</button>
                                </div>
                                <Form onSubmit={handleSubmit} className="formSheet">
                                    <Row className="mb-3">
                                        <Col lg={6}>
                                            <FormLabel className="labelForm">Main Menu</FormLabel>
                                            <Form.Select name="menuName" value={formData.menuName} onChange={handleChange}>
                                                <option value="">Select</option>
                                                {mainMenus.map((m) => (
                                                    <option key={m._id} value={m._id}>{m.menuName}</option>
                                                ))}
                                            </Form.Select>
                                            {errors.menuName && <div className="text-danger">{errors.menuName}</div>}
                                        </Col>
                                        <Col lg={6}>
                                            <FormLabel className="labelForm">Sub Menu</FormLabel>
                                            <Form.Select name="subMenuId" value={formData.subMenuId} onChange={handleChange}>
                                                <option value="">Select</option>
                                                {subMenus.map((s) => (
                                                    <option key={s._id} value={s._id}>{s.subMenuName}</option>
                                                ))}
                                            </Form.Select>
                                            {errors.subMenuId && <div className="text-danger">{errors.subMenuId}</div>}
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col lg={6}>
                                            <FormLabel className="labelForm">Last Sub Menu Name</FormLabel>
                                            <FormControl name="lastSubMenuName" value={formData.lastSubMenuName} onChange={handleChange} />
                                            {errors.lastSubMenuName && <div className="text-danger">{errors.lastSubMenuName}</div>}
                                        </Col>
                                        <Col lg={6}>
                                            <FormLabel className="labelForm">Position</FormLabel>
                                            <FormControl name="position" value={formData.position} onChange={handleChange} />
                                            {errors.position && <div className="text-danger">{errors.position}</div>}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col lg={6}>
                                            <FormLabel className="labelForm">Status</FormLabel>
                                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" /> {editingId ? "Updating..." : "Submitting..."}</>
                                        ) : (
                                            editingId ? "Update Last Sub Menu" : "Add Last Sub Menu"
                                        )}
                                    </Button>
                                </Form>
                            </div>
                        )
                    }

                    <div className="tableSheet mt-4">
                        <Table data={lastSubMenus} columns={columns} handleCopy={handleCopy} handlePrint={handlePrint} />
                    </div>
                </Container>
            </section>
        </>
    );
};

export default LastSubMenuPage;
