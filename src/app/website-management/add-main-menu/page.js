"use client";
import { useState, useEffect } from "react";
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
import { copyContent, printContent } from "@/app/utils";
import { addNewMainMenu, deleteMainMenuById, getAllMainMenus, updateMainMenuById } from "@/Services";
import { FaEdit, FaTrashAlt } from "react-icons/fa";


const AddFirstMenu = () => {
    const { hasSubmitAccess, hasEditAccess } = usePagePermission();
    const [menuList, setMenuList] = useState([]);
    const [formData, setFormData] = useState({
        menuName: "",
        position: "",
        status: "Active",
    });
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const fetchMenuData = async () => {
        try {
            const res = await getAllMainMenus(); 
            setMenuList(res?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMenuData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};

        // Menu Name: Required + Min Length
        if (!formData.menuName || formData.menuName.trim() === "") {
            newErrors.menuName = "Menu Name is required.";
        } else if (formData.menuName.trim().length < 3) {
            newErrors.menuName = "Menu Name must be at least 3 characters.";
        }
        else if (formData.menuName.trim().length > 21) {
            newErrors.menuName = "Menu Name must be max 21 characters.";
        }

        // Menu Position: Required + Number + > 0
        if (!formData.position || formData.position === "") {
            newErrors.position = "Menu Position is required.";
        } else if (isNaN(formData.position)) {
            newErrors.position = "Menu Position must be a number.";
        } else if (parseInt(formData.position) <= 0) {
            newErrors.position = "Menu Position must be greater than 0.";
        }

        return newErrors;
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
            if (editingId) {
                await updateMainMenuById(editingId, formData);
                toast.success("Menu updated successfully!");
            } else {
                await addNewMainMenu(formData);
                toast.success("Menu added successfully!");
            }
            setFormData({ menuName: "", position: "", status: "Active" });
            setEditingId(null);
            fetchMenuData();
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setFormData({
            menuName: row.menuName,
            position: row.position,
            status: row.status,
        });
        setEditingId(row._id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure to delete this menu?")) return;
        try {
            await deleteMainMenuById(id);
            toast.success("Deleted successfully");
            fetchMenuData();
        } catch {
            toast.error("Deletion failed.");
        }
    };

    const handleCopy = () => {
        const headers = ["#", "CreateDate", "MenuName", "Position", "CreatedBy", "Status", "UpdatedDate", "UpdatedBy"];
        const rows = menuList.map((row, i) =>
            [i + 1, new Date(row.createdAt).toLocaleDateString(), row.menuName, row.position, row.createdBy || "N/A", row.status, row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A", row.updatedBy || "N/A"].join("\t")
        );
        copyContent(headers, rows);
    };

    const handlePrint = () => {
        const headers = [["#", "CreateDate", "MenuName", "Position", "CreatedBy", "Status", "UpdatedDate", "UpdatedBy"]];
        const rows = menuList.map((row, i) => [
            i + 1,
            new Date(row.createdAt).toLocaleDateString(),
            row.menuName,
            row.position,
            row.createdBy || "N/A",
            row.status,
            row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A",
            row.updatedBy || "N/A",
        ]);
        printContent(headers, rows);
    };

    const columns = [
        { name: "#", selector: (row, i) => i + 1, width: "60px" },
        { name: "CreateDate", selector: (row) => new Date(row.createdAt).toLocaleDateString(), sortable: true },
        { name: "MenuName", selector: (row) => row.menuName || "N/A", sortable: true },
        { name: "Position", selector: (row) => row.position || "N/A", sortable: true },
        { name: "CreatedBy", selector: (row) => row.createdBy || "N/A", sortable: true },
        { name: "Status", selector: (row) => row.status || "N/A", sortable: true },
        { name: "UpdatedDate", selector: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A", sortable: true },
        { name: "UpdatedBy", selector: (row) => row.updatedBy || "N/A", sortable: true },
        hasEditAccess && {
            name: "Action",
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button variant="success" size="sm" onClick={() => handleEdit(row)}><FaEdit /></Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}><FaTrashAlt /></Button>
                </div>
            ),
        },
    ];

    const breadcrumbItems = [
        { label: "Website Management", link: "/website-management/all-module" },
        { label: "Add 1st Menu", link: "null" },
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
                            <h2>{editingId ? "Update Menu" : "Add Menu"}</h2>
                        </div>
                        <Form onSubmit={handleSubmit} className="formSheet">
                            <Row>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Menu Name<span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="menuName"
                                        value={formData.menuName}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.menuName}
                                    />
                                    {errors.menuName && (
                                        <div className="text-danger mt-1">{errors.menuName}</div>
                                    )}

                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Menu Position<span className="text-danger">*</span></FormLabel>
                                    <FormControl
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.position}
                                    />
                                    {errors.position && (
                                        <div className="text-danger mt-1">{errors.position}</div>
                                    )}
                                </Col>
                                <Col lg={4}>
                                    <FormLabel className="labelForm">Status<span className="text-danger">*</span></FormLabel>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            {hasSubmitAccess && (
                                <Button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                                    {loading
                                        ? editingId
                                            ? "Updating..."
                                            : "Adding..."
                                        : editingId
                                            ? "Update Menu"
                                            : "Add Menu"}
                                </Button>
                            )}
                        </Form>
                    </div>

                    <div className="tableSheet mt-4">
                        <Table
                            data={menuList}
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

export default AddFirstMenu;
