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

const AddCheckUp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [formData, setFormData] = useState({
    check_up_type: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Check-Up Type",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.check_up_type || "N/A"
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/checkup-types");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch check-up types. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (checkUp) => {
    setEditingId(checkUp._id);
    setEditedName(checkUp.check_up_type);
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/checkup-types/${id}`, {
        check_up_type: editedName,
      });
      fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update check-up type. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this check-up type?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/checkup-types/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete check-up type. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (formData.check_up_type.trim()) {
      try {
        const existingCheckUp = data.find(
          (checkUp) => checkUp.check_up_type === formData.check_up_type
        );
        if (existingCheckUp) {
          setError("Check-up type already exists.");
          return;
        }

        await axios.post("https://erp-backend-fy3n.onrender.com/api/checkup-types", {
          check_up_type: formData.check_up_type,
        });
        fetchData();
        setFormData({ check_up_type: "" });
        setIsPopoverOpen(false);
      } catch (error) {
        console.error("Error adding data:", error);
        setError("Failed to add check-up type. Please try again later.");
      }
    } else {
      alert("Please enter a valid check-up type.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Check-Up Type"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.check_up_type || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Check-Up Type"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.check_up_type || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" },
    { label: "Add CheckUp Type", link: "null" },
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
            <CgAddR /> Add Check-Up Type
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Check-Up Type</h2>
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
                    <FormLabel className="labelForm">Check-Up Type</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Check-Up Type"
                      value={formData.check_up_type}
                      onChange={(e) =>
                        setFormData({ check_up_type: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Check-Up Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Check-Up Type Records</h2>
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

export default dynamic(() => Promise.resolve(AddCheckUp), { ssr: false });