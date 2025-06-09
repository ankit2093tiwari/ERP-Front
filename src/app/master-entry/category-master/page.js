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
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
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
          row.category_name || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.category_name)}
            >
              <FaEdit />
            </button>
          )}
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

  const handlePrint = () => {
    const tableHeaders = [["#", "Category Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.category_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Category Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.category_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/categories"
      );
      const fetchedData = response.data.data || [];

      const normalizedData = fetchedData.map((item) => ({
        ...item,
        category_name: item.category_name || "N/A",
      }));

      // Sort by most recent first (assuming createdAt field exists)
      const sorted = [...normalizedData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sorted);
    } catch (err) {
      toast.error("Failed to fetch data. Please try again later.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      toast.warning("Category name cannot be empty.", {
        position: "top-right",
      });
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() ===
          editedName.trim().toLowerCase() && cat._id !== id
    );

    if (exists) {
      toast.warning("Category with this name already exists!", {
        position: "top-right",
      });
      setEditingId(null);
      return;
    }

    try {
      const res = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/categories/${id}`,
        { category_name: editedName }
      );

      toast.success("Category updated successfully!", {
        position: "top-right",
      });

      const updated = res.data?.data;
      if (updated) {
        // Move updated item to top
        setData((prev) => [
          updated,
          ...prev.filter((item) => item._id !== id),
        ]);
      } else {
        fetchData();
      }

      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update category. Please try again later.", {
        position: "top-right",
      });
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/categories/${id}`
        );
        toast.success("Category deleted successfully!", {
          position: "top-right",
        });
        fetchData(); // re-fetch and resort
      } catch (error) {
        toast.error("Failed to delete category. Please try again later.", {
          position: "top-right",
        });
      }
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      toast.warning("Please enter a valid category name.", {
        position: "top-right",
      });
      return;
    }

    const exists = data.find(
      (cat) =>
        cat.category_name.trim().toLowerCase() ===
        newCategoryName.trim().toLowerCase()
    );

    if (exists) {
      toast.warning("Category already exists!", {
        position: "top-right",
      });
      setIsPopoverOpen(false);
      setNewCategoryName("");
      return;
    }

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/categories",
        {
          category_name: newCategoryName,
        }
      );

      const newEntry = response?.data?.data;
      if (newEntry) {
        setData((prev) => [newEntry, ...prev]); // show new at top
      } else {
        fetchData(); // fallback
      }

      toast.success("Category added successfully!", {
        position: "top-right",
      });
      setNewCategoryName("");
      setIsPopoverOpen(false);
    } catch (error) {
      toast.error("Failed to add category. Please try again later.", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Master Entry", link: "/master-entry/all-module" },
    { label: "Category Master", link: null },
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
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
                    setNewCategoryName("");
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
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
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
            <h2>Category Records</h2>
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

      <ToastContainer />
    </>
  );
};

export default dynamic(() => Promise.resolve(CategoryMasterPage), {
  ssr: false,
});
