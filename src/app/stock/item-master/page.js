"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/medical/routine-check-up/page.module.css";
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
} from "react-bootstrap";
import axios from "axios";

const ItemMaster = () => {
  const [data, setData] = useState([]); // Table data
  const [categories, setCategories] = useState([]); // Category dropdown options
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle Add Form visibility
  const [formValues, setFormValues] = useState({
    itemName: "",
    itemCategory: "",
    description: "",
    maintainMinimumStock: false,
    itemType: "", // Will use the dropdown values 'recurring' or 'non-recurring'
  });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Category", selector: (row) => row.itemCategory?.categoryName || "N/A", sortable: true },
    { name: "Item Type", selector: (row) => row.itemType || "N/A", sortable: true },
    { name: "Item Name", selector: (row) => row.itemName || "N/A", sortable: true },
    { name: "Maintain Minimum Stock", selector: (row) => (row.maintainMinimumStock ? "Yes" : "No"), sortable: true },
    { name: "Description", selector: (row) => row.description || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </button>
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
    const { itemName, itemCategory, description, maintainMinimumStock, itemType } = formValues;
    if (itemName.trim() && itemCategory.trim() && itemType.trim()) {
      try {
        await axios.post("https://erp-backend-fy3n.onrender.com/api/itemMaster", {
          itemName,
          itemCategory,
          description,
          maintainMinimumStock,
          itemType,
        });
        fetchData();
        setFormValues({
          itemName: "",
          itemCategory: "",
          description: "",
          maintainMinimumStock: false,
          itemType: "",
        });
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add item. Please try again later.");
      }
    } else {
      alert("Please fill out all required fields.");
    }
  };

  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new item name:", item?.itemName || "");
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemMaster/${id}`, {
          itemName: updatedName,
        });
        fetchData();
      } catch (error) {
        console.error("Error updating data:", error);
        setError("Failed to update item. Please try again later.");
      }
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
        {showAddForm ? "Close Form" : "Add Item"}
      </Button>

      {showAddForm && (
        <div className="mb-4">
          <Row className="mb-3">
            <Col lg={6}>
              <FormLabel>Item Name</FormLabel>
              <FormControl
                type="text"
                placeholder="Enter Item Name"
                value={formValues.itemName}
                onChange={(e) => setFormValues({ ...formValues, itemName: e.target.value })}
              />
            </Col>
            <Col lg={6}>
              <FormLabel>Category</FormLabel>
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
              <FormLabel>Item Type</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl
                type="text"
                placeholder="Enter Description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            label="Maintain Minimum Stock"
            checked={formValues.maintainMinimumStock}
            onChange={(e) => setFormValues({ ...formValues, maintainMinimumStock: e.target.checked })}
          />
          <Button className="mt-3" onClick={handleAdd}>
            Submit
          </Button>
        </div>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table columns={columns} data={data} />
      )}
    </Container>
  );
};

export default ItemMaster;
