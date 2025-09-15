"use client";

import React, { useState, useEffect } from "react";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  FormSelect,
  Alert,
} from "react-bootstrap";
import { CgAddR } from "react-icons/cg";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import {
  addNewItem,
  deleteItemById,
  getAllItems,
  getItemCategories,
  updateItemById,
} from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const ItemMaster = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null => add mode
  const [formErrors, setFormErrors] = useState({});

  const todayDate = new Date().toISOString().split("T")[0];
  const [formValues, setFormValues] = useState({
    itemName: "",
    itemCategory: "",
    description: "",
    maintainMinimumStock: 0,
    itemType: "",
    date: todayDate,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getAllItems(),
        getItemCategories(),
      ]);
      setData(itemsResponse?.data || []);
      setCategories(categoriesResponse?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingItem(null);
    setFormValues({
      itemName: "",
      itemCategory: "",
      description: "",
      maintainMinimumStock: 0,
      itemType: "",
      date: todayDate,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormValues({
      itemName: item.itemName || "",
      itemCategory: item.itemCategory?._id || item.itemCategory || "",
      description: item.description || "",
      maintainMinimumStock: item.maintainMinimumStock || 0,
      itemType: item.itemType || "",
      date: item.date ? item.date.split("T")[0] : todayDate,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = (values) => {
    const errs = {};
    if (!values.itemName || !values.itemName.trim()) errs.itemName = "Item Name is required.";
    if (!values.itemCategory || !String(values.itemCategory).trim()) errs.itemCategory = "Item Category is required.";
    if (!values.itemType || !String(values.itemType).trim()) errs.itemType = "Item Type is required.";
    // User requested description validation error:
    if (!values.description || !values.description.trim()) errs.description = "Description is required.";
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateForm(formValues);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      toast.warning("Please correct the highlighted fields.");
      return;
    }

    const payload = {
      itemName: formValues.itemName.trim(),
      itemCategory: formValues.itemCategory, // id expected
      description: formValues.description.trim(),
      maintainMinimumStock: Number(formValues.maintainMinimumStock) || 0,
      itemType: formValues.itemType,
      date: formValues.date,
    };

    try {
      if (editingItem) {
        await updateItemById(editingItem._id, payload);
        toast.success("Item updated successfully.");
      } else {
        await addNewItem(payload);
        toast.success("Item added successfully.");
      }
      fetchData();
      setIsFormOpen(false);
      setEditingItem(null);
      setFormValues({
        itemName: "",
        itemCategory: "",
        description: "",
        maintainMinimumStock: 0,
        itemType: "",
        date: todayDate,
      });
      setFormErrors({});
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to save item. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteItemById(id);
      toast.success("Item deleted successfully.");
      fetchData();
    } catch (err) {
      console.error("Error deleting data:", err);
      toast.error("Failed to delete item.");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Date", "Category", "Item Type", "Item Name", "Minimum Stock", "Description"]];
    const rows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.itemCategory?.categoryName || "N/A",
      row.itemType || "N/A",
      row.itemName || "N/A",
      row.maintainMinimumStock || "N/A",
      row.description || "N/A",
    ]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Date", "Category", "Item Type", "Item Name", "Minimum Stock", "Description"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${new Date(row.date).toLocaleDateString()}\t${row.itemCategory?.categoryName || "N/A"}\t${row.itemType || "N/A"}\t${row.itemName || "N/A"}\t${row.maintainMinimumStock || 0}\t${row.description || "N/A"}`
    );
    copyContent(headers, rows);
  };

  // Table columns (no inline editing)
  const columns = [
    {
      name: "#",
      selector: (row, idx) => idx + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.itemCategory?.categoryName || "N/A",
      sortable: true,
    },
    {
      name: "Item Type",
      selector: (row) => row.itemType || "N/A",
      sortable: true,
    },
    {
      name: "Item Name",
      selector: (row) => row.itemName || "N/A",
      sortable: true,
    },
    {
      name: "Minimum Stock",
      selector: (row) => row.maintainMinimumStock ?? 0,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      sortable: false,
    },
  ];

  // Add actions column only if user has edit access
  if (hasEditAccess) {
    columns.push({
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button variant="success" size="sm" onClick={() => openEditForm(row)} title="Edit">
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)} title="Delete">
            <FaTrashAlt />
          </Button>
        </div>
      ),
    });
  }

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Item Master", link: "null" },
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
            <Button onClick={openAddForm} className="btn-add mb-3">
              <CgAddR /> Add Item
            </Button>
          )}

          {/* Form (cover-sheet) */}
          {isFormOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editingItem ? "Update Item" : "Add New Item"}</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                    setFormErrors({});
                  }}
                >
                  X
                </button>
              </div>

              <Form className="formSheet" onSubmit={handleSave}>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Date</FormLabel>
                    <FormControl
                      type="date"
                      value={formValues.date}
                      onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Item Category <span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      value={formValues.itemCategory}
                      isInvalid={!!formErrors.itemCategory}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemCategory: e.target.value });
                        if (formErrors.itemCategory) setFormErrors((p) => ({ ...p, itemCategory: "" }));
                      }}
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </FormSelect>
                    {formErrors.itemCategory && <div className="text-danger mt-1">{formErrors.itemCategory}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Item Type <span className="text-danger">*</span>
                    </FormLabel>
                    <FormSelect
                      value={formValues.itemType}
                      isInvalid={!!formErrors.itemType}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemType: e.target.value });
                        if (formErrors.itemType) setFormErrors((p) => ({ ...p, itemType: "" }));
                      }}
                    >
                      <option value="">Select</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                    </FormSelect>
                    {formErrors.itemType && <div className="text-danger mt-1">{formErrors.itemType}</div>}
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Item Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Item Name"
                      value={formValues.itemName}
                      isInvalid={!!formErrors.itemName}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemName: e.target.value });
                        if (formErrors.itemName) setFormErrors((p) => ({ ...p, itemName: "" }));
                      }}
                    />
                    {formErrors.itemName && <div className="text-danger mt-1">{formErrors.itemName}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Minimum Stock</FormLabel>
                    <FormControl
                      type="number"
                      min="0"
                      placeholder="Enter Minimum Stock"
                      value={formValues.maintainMinimumStock}
                      onChange={(e) =>
                        setFormValues({ ...formValues, maintainMinimumStock: parseInt(e.target.value) || 0 })
                      }
                    />
                  </Col>

                  <Col lg={6}>
                    <FormLabel className="labelForm">
                      Description <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Description"
                      value={formValues.description}
                      isInvalid={!!formErrors.description}
                      onChange={(e) => {
                        setFormValues({ ...formValues, description: e.target.value });
                        if (formErrors.description) setFormErrors((p) => ({ ...p, description: "" }));
                      }}
                    />
                    {formErrors.description && <div className="text-danger mt-1">{formErrors.description}</div>}
                  </Col>
                </Row>

                <Button type="submit" variant="success">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Stock Item Records</h2>
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <Table columns={columns} data={data} handleCopy={handleCopy} handlePrint={handlePrint} />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default ItemMaster;
