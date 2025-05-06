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

const CreateType = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type_name: ""
  });
  const [editFormData, setEditFormData] = useState({
    type_name: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Type Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.type_name}
            onChange={(e) => setEditFormData({...editFormData, type_name: e.target.value})}
          />
        ) : (
          row.type_name || "N/A"
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
                onClick={() => setEditingId(null)}
              >
                Cancel
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
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/advertisings"
      );
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch advertising types. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    setEditingId(type._id);
    setEditFormData({
      type_name: type.type_name || ""
    });
  };

  const handleUpdate = async (id) => {
    if (!editFormData.type_name.trim()) {
      alert("Please enter a type name.");
      return;
    }

    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/advertisings/${id}`,
        editFormData
      );
      fetchData();
      setEditingId(null);
      // setSuccessMessage("Type updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update advertising type. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this advertising type?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/advertisings/${id}`
        );
        fetchData();
        // setSuccessMessage("Type deleted successfully!");
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete advertising type. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.type_name.trim()) {
      alert("Please enter a type name.");
      return;
    }

    try {
      const existingType = data.find(
        (type) => type.type_name.toLowerCase() === formData.type_name.toLowerCase()
      );
      if (existingType) {
        setError("Type with this name already exists.");
        return;
      }

      await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/advertisings",
        formData
      );
      fetchData();
      setFormData({
        type_name: ""
      });
      setIsPopoverOpen(false);
      // setSuccessMessage("Type added successfully!");
    } catch (error) {
      console.error("Error adding data:", error);
      setError("Failed to add advertising type. Please try again later.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Type Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.type_name || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Type Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.type_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Advertising Management", link: "/advertising-management/all-module" },
    { label: "Create Type", link: "null" },
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
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Advertising Type
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Advertising Type</h2>
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
                  <Col lg={12}>
                    <FormLabel className="labelForm">Type Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Type Name"
                      value={formData.type_name}
                      onChange={(e) => setFormData({...formData, type_name: e.target.value})}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Advertising Type Records</h2>
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

export default dynamic(() => Promise.resolve(CreateType), { ssr: false });