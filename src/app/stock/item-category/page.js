"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const ItemCategory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [formData, setFormData] = useState({
    categoryName: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Category Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.categoryName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/itemCategories");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch item categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditedName(category.categoryName);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/itemCategory/${id}`, {
        categoryName: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update category. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/itemCategory/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete category. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (formData.categoryName.trim()) {
      try {
        const existingCategory = data.find(
          (category) => category.categoryName === formData.categoryName
        );
        if (existingCategory) {
          setError("Category name already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/itemCategory", {
          categoryName: formData.categoryName,
        });
        fetchData();
        setFormData({ categoryName: "" });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add category. Please try again later.");
      }
    } else {
      alert("Please enter a valid category name.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.categoryName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Category Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.categoryName || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Item Category", link: "null" },
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
          
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Category
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Category</h2>
                <button
                  className="closeForm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setError("");
                  }}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Category Name"
                      value={formData.categoryName}
                      onChange={(e) =>
                        setFormData({ categoryName: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Category
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Item Categories</h2>
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

export default dynamic(() => Promise.resolve(ItemCategory), { ssr: false });