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
import { addNewSubMenu, deleteSubMenuById, getAllMainMenus, getAllSubMenus, updateSubMenuById } from "@/Services";
import { copyContent, printContent } from "@/app/utils";

const AddSecondSubMenu = () => {
    const [formData, setFormData] = useState({
        menuName: "",
        subMenuName: "",
        position: "",
        status: "Active",
    });

    const [mainMenus, setMainMenus] = useState([]);
    const [secondSubMenus, setSecondSubMenus] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMenus();
        fetchSubMenus();
    }, []);

    const fetchMenus = async () => {
        const res = await getAllMainMenus();
        setMainMenus(res.data || []);
    };

    const fetchSubMenus = async () => {
        const res = await getAllSubMenus();
        setSecondSubMenus(res.data || []);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.menuName) newErrors.menuName = "Menu is required.";
        if (!formData.subMenuName) newErrors.subMenuName = "Sub Menu Name is required.";
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
                position: parseInt(formData.position, 10), // convert string to number
            };

            if (editingId) {
                await updateSubMenuById(editingId, payload);
                toast.success("Sub Menu updated successfully.");
            } else {
                await addNewSubMenu(payload);
                toast.success("Sub Menu added successfully.");
            }

            setFormData({ menuName: "", subMenuName: "", position: "", status: "Active" });
            setEditingId(null);
            fetchSubMenus();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (row) => {
        setEditingId(row._id);
        setFormData({
            menuName: row.menuName?._id || "",
            subMenuName: row.subMenuName,
            position: row.position,
            status: row.status,
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this record?")) return;
        try {
            await deleteSubMenuById(id);
            toast.success("Deleted successfully.");
            fetchSubMenus();
        } catch (err) {
            toast.error("Failed to delete.");
        }
    };

    const handleCopy = () => {
        const headers = ["#", "Menu Name", "Sub Menu Name", "Position", "Status", "CreatedBy"];
        const rows = secondSubMenus.map((row, index) => [
            index + 1,
            row.menuName?.menuName || "N/A",
            row.subMenuName || "N/A",
            row.position || "N/A",
            row.status || "N/A",
            row.createdBy || "N/A",
        ].join("\t"));
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "Menu Name", "Sub Menu Name", "Position", "Status", "CreatedBy"]];
        const rows = secondSubMenus.map((row, index) => [
            index + 1,
            row.menuName?.menuName || "N/A",
            row.subMenuName || "N/A",
            row.position || "N/A",
            row.status || "N/A",
            row.createdBy || "N/A",
        ]);
        printContent(headers, rows);
    };

    const columns = [
        { name: "#", selector: (row, index) => index + 1, width: "60px" },
        { name: "Menu Name", selector: (row) => row.menuName?.menuName || "N/A" },
        { name: "Sub Menu Name", selector: (row) => String(row.subMenuName || "N/A") },
        { name: "Position", selector: (row) => row.position | "N/A" },
        { name: "CreatedBy", selector: (row) => row.createdBy || "N/A" },
        { name: "Status", selector: (row) => row.status },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button size="sm" variant="success" onClick={() => handleEdit(row)}><FaEdit /></Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </div>
            ),
        },
    ];

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Add Sub Menu", link: "null" },
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
                            <h2>{editingId ? "Update Sub Menu" : "Add Sub Menu"}</h2>
                        </div>
                        <Form onSubmit={handleSubmit} className="formSheet">
                            <Row className="mb-3">
                                <Col lg={6}>
                                    <FormLabel className="labelForm">Menu Name</FormLabel>
                                    <Form.Select
                                        name="menuName"
                                        value={formData.menuName}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select</option>
                                        {mainMenus.map((menu) => (
                                            <option key={menu._id} value={menu._id}>
                                                {menu.menuName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {errors.menuName && <div className="text-danger">{errors.menuName}</div>}
                                </Col>



                                <Col lg={6}>
                                    <FormLabel className="labelForm">Position</FormLabel>
                                    <FormControl
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                    />
                                    {errors.position && <div className="text-danger">{errors.position}</div>}
                                </Col>

                            </Row>
                            <Row>
                                <Col lg={6}>
                                    <FormLabel className="labelForm">Sub Menu Name</FormLabel>
                                    <FormControl
                                        name="subMenuName"
                                        value={formData.subMenuName}
                                        onChange={handleChange}
                                    />
                                    {errors.subMenuName && <div className="text-danger">{errors.subMenuName}</div>}
                                </Col>
                                <Col lg={6}>
                                    <FormLabel className="labelForm">Status</FormLabel>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                {loading
                                    ? editingId ? "Updating..." : "Submitting..."
                                    : editingId ? "Update Sub Menu" : "Add Sub Menu"}
                            </Button>
                        </Form>
                    </div>

                    <div className="tableSheet mt-4">
                        <Table
                            data={secondSubMenus}
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

export default AddSecondSubMenu;
