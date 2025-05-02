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
import axios from "axios";
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const ItemMaster = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
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
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleSave(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => {
                  setEditingId(null);
                  setEditedValues({});
                }}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                 <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        axios.get("https://erp-backend-fy3n.onrender.com/api/itemMasters"),
        axios.get("https://erp-backend-fy3n.onrender.com/api/itemCategories"),
      ]);
      setData(itemsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const { itemName, itemCategory, description, maintainMinimumStock, itemType, date } = formValues;
    if (itemName.trim() && itemCategory.trim() && itemType.trim()) {
      try {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/itemMaster", {
          itemName,
          itemCategory,
          description,
          maintainMinimumStock: parseInt(maintainMinimumStock) || 0,
          itemType,
          date
        });
        fetchData();
        setFormValues({
          itemName: "",
          itemCategory: "",
          description: "",
          maintainMinimumStock: 0,
          itemType: "",
          date: new Date().toISOString().split('T')[0]
        });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add item. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
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
    try {
      // Prepare the data for API call
      const updateData = {
        ...editedValues,
        itemCategory: editedValues.itemCategory?._id || editedValues.itemCategory
      };
      
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemMaster/${id}`, updateData);
      fetchData();
      setEditingId(null);
      setEditedValues({});
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update item. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/itemMaster/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete item. Please try again later.");
      }
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Date", "Category", "Item Type", "Item Name", "Minimum Stock", "Description"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      new Date(row.date).toLocaleDateString(),
      row.itemCategory?.categoryName || "N/A",
      row.itemType || "N/A",
      row.itemName || "N/A",
      row.maintainMinimumStock || "N/A",
      row.description || "N/A"
    ]);
    printContent(tableHeaders, tableRows);
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

          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Item
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Item</h2>
                <button className='closeForm' onClick={() => setIsPopoverOpen(false)}>
                  X
                </button>
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
                    <FormLabel className="labelForm">Item Category</FormLabel>
                    <FormSelect
                      value={formValues.itemCategory}
                      onChange={(e) => setFormValues({ ...formValues, itemCategory: e.target.value })}
                    >
                      <option value="">Select</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </FormSelect>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Type</FormLabel>
                    <FormSelect
                      value={formValues.itemType}
                      onChange={(e) => setFormValues({ ...formValues, itemType: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="recurring">Recurring</option>
                      <option value="non-recurring">Non-Recurring</option>
                    </FormSelect>
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Item Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Item Name"
                      value={formValues.itemName}
                      onChange={(e) => setFormValues({ ...formValues, itemName: e.target.value })}
                    />
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

                <Button className="mt-3" onClick={handleAdd}>
                  Add New Item
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