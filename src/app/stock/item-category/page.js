"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Form,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { CgAddR } from 'react-icons/cg';

const ItemCategory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ categoryName: "" });

  // Fetch item categories
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemCategories");
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch item categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onOpen = () => setIsPopoverOpen(true);
  const onClose = () => setIsPopoverOpen(false);


  // Add new category
  const handleAdd = async () => {
    if (!newCategory.categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/itemCategory",
        newCategory
      );
      setData([...data, response.data]);
      setNewCategory({ categoryName: "" });
      setIsPopoverOpen(false);
      setSuccessMessage("Category added successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to add category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEdit = async (id) => {
    const category = data.find((item) => item._id === id);
    const updatedName = prompt("Enter new category name:", category?.categoryName || "");
    if (!updatedName) return;

    setLoading(true);
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemCategory/${id}`, {
        categoryName: updatedName,
      });
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, categoryName: updatedName } : item
        )
      );
      setSuccessMessage("Category updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    try {
      await axios.delete(`https://erp-backend-fy3n.onrender.com/api/itemCategory/${id}`);
      setData((prevData) => prevData.filter((item) => item._id !== id));
      setSuccessMessage("Category deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button
            className="editButton btn-danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/stock/all-module">Stock Module</Breadcrumb.Item>
            <Breadcrumb.Item active>Item Category</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>
        <Col>
         <Button onClick={onOpen} className="btn btn-primary">
           <CgAddR /> Add Category
          </Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
               <div className="studentHeading"><h2>Add Category</h2>
                <button className='closeForm' onClick={onClose}> X </button>
                </div>
                <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={newCategory.categoryName}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          categoryName: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Category
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Item Categories</h2>
            {loading ? (
              <p>Loading...</p>
            ) : data.length > 0 ? (
              <Table columns={columns} data={data} />
            ) : (
              <p>No categories available.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(ItemCategory), { ssr: false });
