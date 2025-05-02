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

const StoreMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [formData, setFormData] = useState({
    storeName: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Store Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.storeName || "N/A"
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/stores");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setEditingId(store._id);
    setEditedName(store.storeName);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/store/${id}`, {
        storeName: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update data. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this store?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/store/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (formData.storeName.trim()) {
      try {
        const existingStore = data.find(
          (store) => store.storeName === formData.storeName
        );
        if (existingStore) {
          setError("Store name already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/store", {
          storeName: formData.storeName,
        });
        fetchData();
        setFormData({ storeName: "" });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add data. Please try again later.");
      }
    } else {
      alert("Please enter a valid store name.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Store Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.storeName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Store Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.storeName || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Stock", link: "/stock/all-module" },
    { label: "Store Master", link: "null" },
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
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Store
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Store</h2>
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
                    <FormLabel className="labelForm">Store Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Store Name"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ storeName: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Store
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Store Records</h2>
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

export default dynamic(() => Promise.resolve(StoreMaster), { ssr: false });