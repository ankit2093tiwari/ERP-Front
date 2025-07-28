"use client";

import React, { useState, useEffect } from "react";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
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
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { addNewItem, deleteItemById, getAllItems, getItemCategories, updateItemById } from "@/Services";
import { toast } from "react-toastify";
import usePagePermission from "@/hooks/usePagePermission";

const ItemMaster = () => {
const {hasSubmitAccess,hasEditAccess}=usePagePermission()

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const [formValues, setFormValues] = useState({
    itemName: "",
    itemCategory: "",
    description: "",
    maintainMinimumStock: 0,
    itemType: "",
    date: new Date().toISOString().split('T')[0]
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px"
    },
    {
      name: "Category",
      cell: (row) => editingId === row._id ? (
        <FormSelect
          value={editedValues.itemCategory?._id || editedValues.itemCategory || ""}
          onChange={(e) => setEditedValues({
            ...editedValues,
            itemCategory: e.target.value
          })}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.categoryName}
            </option>
          ))}
        </FormSelect>
      ) : (
        row.itemCategory?.categoryName || "N/A"
      ),
      sortable: true
    },
    {
      name: "Item Type",
      cell: (row) => editingId === row._id ? (
        <FormSelect
          value={editedValues.itemType || ""}
          onChange={(e) => setEditedValues({ ...editedValues, itemType: e.target.value })}
        >
          <option value="">Select Type</option>
          <option value="recurring">Recurring</option>
          <option value="non-recurring">Non-Recurring</option>
        </FormSelect>
      ) : (
        row.itemType || "N/A"
      ),
      sortable: true
    },
    {
      name: "Item Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editedValues.itemName || ""}
          onChange={(e) => setEditedValues({ ...editedValues, itemName: e.target.value })}
        />
      ) : (
        row.itemName || "N/A"
      ),
      sortable: true
    },
    {
      name: "Minimum Stock",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="number"
          value={editedValues.maintainMinimumStock || 0}
          onChange={(e) => setEditedValues({
            ...editedValues,
            maintainMinimumStock: parseInt(e.target.value) || 0
          })}
          min="0"
        />
      ) : (
        row.maintainMinimumStock || 0
      ),
      sortable: true
    },
    {
      name: "Description",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editedValues.description || ""}
          onChange={(e) => setEditedValues({ ...editedValues, description: e.target.value })}
        />
      ) : (
        row.description || "N/A"
      ),
      sortable: true
    },
    {
      name: "Date",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="date"
          value={editedValues.date || new Date().toISOString().split('T')[0]}
          onChange={(e) => setEditedValues({ ...editedValues, date: e.target.value })}
        />
      ) : (
        new Date(row.date).toLocaleDateString() || "N/A"
      ),
      sortable: true
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleSave(row._id)}><FaSave /></button>
              <button className="editButton btn-danger" onClick={() => { setEditingId(null); setEditedValues({}); }}><FaTimes /></button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}><FaEdit /></button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}><FaTrashAlt /></button>
            </>
          )}
        </div>
      )
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getAllItems(),
        getItemCategories()
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

  const handleAdd = async () => {
    const { itemName, itemCategory, itemType } = formValues;
    const errors = {};

    if (!itemName.trim()) errors.itemName = "Item Name is required.";
    if (!itemCategory.trim()) errors.itemCategory = "Item Category is required.";
    if (!itemType.trim()) errors.itemType = "Item Type is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warning("Please correct the highlighted fields.");
      return;
    }

    try {
      const response = await addNewItem({
        ...formValues,
        itemName: itemName.trim(),
        description: formValues.description.trim(),
        maintainMinimumStock: parseInt(formValues.maintainMinimumStock) || 0,
      });

      if (response?.success) {
        toast.success(response.message || "Item added successfully!");
        fetchData();
        setFormValues({
          itemName: "",
          itemCategory: "",
          description: "",
          maintainMinimumStock: 0,
          itemType: "",
          date: new Date().toISOString().split("T")[0]
        });
        setFormErrors({});
        setIsPopoverOpen(false);
      } else {
        toast.error(response.message || "Failed to add item.");
      }
    } catch (error) {
      console.error("Add error:", error);
      toast.error("Failed to add item due to server error.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditedValues({
      ...item,
      maintainMinimumStock: item.maintainMinimumStock || 0,
      date: item.date || new Date().toISOString().split('T')[0]
    });
  };

  const handleSave = async (id) => {
    const { itemName, itemCategory, itemType } = editedValues;

    // Validate required fields
    if (!itemName?.trim()) {
      toast.error("Item Name is required.");
      return;
    }
    if (!itemCategory || itemCategory === "") {
      toast.error("Item Category is required.");
      return;
    }
    if (!itemType || itemType === "") {
      toast.error("Item Type is required.");
      return;
    }

    try {
      // Format category in case it's an object
      const updateData = {
        ...editedValues,
        itemCategory: editedValues.itemCategory?._id || editedValues.itemCategory,
      };

      const response = await updateItemById(id, updateData);
      toast.success(response?.message || "Item updated successfully.");
      fetchData();
      setEditingId(null);
      setEditedValues({});
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Failed to update item. Please try again later.");
    }
  };


  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteItemById(id);
        fetchData();
        toast.success("Item deleted successfully.");
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Failed to delete item.");
      }
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
      row.description || "N/A"
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

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Item Master", link: "null" }
  ];

  return (
    <>
      <div className="breadcrumbSheet position-relative">
        <Container>
          <Row className='mt-1 mb-1'>
            <Col>
              <BreadcrumbComp items={breadcrumbItems} />
            </Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          {error && <Alert variant="danger">{error}</Alert>}

          {hasSubmitAccess &&(
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Item
          </Button>

          )}
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Item</h2>
                <button className='closeForm' onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>

              <Form className="formSheet">
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
                    <FormLabel className="labelForm">Item Category <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formValues.itemCategory}
                      isInvalid={!!formErrors.itemCategory}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemCategory: e.target.value });
                        if (formErrors.itemCategory) setFormErrors(prev => ({ ...prev, itemCategory: "" }));
                      }}
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                      ))}
                    </FormSelect>
                    {formErrors.itemCategory && <div className="text-danger mt-1">{formErrors.itemCategory}</div>}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Type <span className="text-danger">*</span></FormLabel>
                    <FormSelect
                      value={formValues.itemType}
                      isInvalid={!!formErrors.itemType}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemType: e.target.value });
                        if (formErrors.itemType) setFormErrors(prev => ({ ...prev, itemType: "" }));
                      }}
                    >
                      <option value="">Select</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                    </FormSelect>
                    {formErrors.itemType && <div className="text-danger mt-1">{formErrors.itemType}</div>}
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Item Name"
                      value={formValues.itemName}
                      isInvalid={!!formErrors.itemName}
                      onChange={(e) => {
                        setFormValues({ ...formValues, itemName: e.target.value });
                        if (formErrors.itemName) setFormErrors(prev => ({ ...prev, itemName: "" }));
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
                      onChange={(e) => setFormValues({
                        ...formValues,
                        maintainMinimumStock: parseInt(e.target.value) || 0
                      })}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Description</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Description"
                      value={formValues.description}
                      onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                    />
                  </Col>
                </Row>

                <Button className="mt-3" onClick={handleAdd}>Add New Item</Button>
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

export default ItemMaster;
