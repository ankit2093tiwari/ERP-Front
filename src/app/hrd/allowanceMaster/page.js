"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
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
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const AllowanceMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAllowanceName, setNewAllowanceName] = useState("");
  const [newCategory, setNewCategory] = useState("ADDITION");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Allowance Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.allowance_name || "N/A"
        ),
    },
    {
      name: "Category",
      cell: (row) =>
        editingId === row._id ? (
          <FormSelect
            value={editedCategory}
            onChange={(e) => setEditedCategory(e.target.value)}
          >
            <option value="ADDITION">ADDITION</option>
            <option value="SUBTRACTION">SUBTRACTION</option>
          </FormSelect>
        ) : (
          row.category || "N/A"
        ),
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
            <button className="editButton" onClick={() => handleEdit(row._id, row.allowance_name, row.category)}>
              <FaEdit />
            </button>
          )}
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-allowances");
      const fetchedData = response.data.data || [];
      setData(fetchedData);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAllowanceName.trim()) {
      setError("Allowance name cannot be empty");
      return;
    }

    try {
      const existing = data.find(
        (item) => item.allowance_name.toLowerCase() === newAllowanceName.toLowerCase()
      );
      if (existing) {
        setError("Allowance name already exists");
        return;
      }

      const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/create-allowance", {
        allowance_name: newAllowanceName,
        category: newCategory,
      });
      setData((prev) => [...prev, response.data]);
      setNewAllowanceName("");
      setNewCategory("ADDITION");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Allowance name already exists");
      } else {
        setError("Failed to add data. Please try again.");
      }
    }
  };

  const handleEdit = (id, name, category) => {
    setEditingId(id);
    setEditedName(name);
    setEditedCategory(category);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setError("Allowance name cannot be empty");
      return;
    }

    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-allowance/${id}`, {
        allowance_name: editedName,
        category: editedCategory,
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Allowance name already exists");
      } else {
        setError("Failed to update data. Please try again later.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this allowance?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-allowance/${id}`);
        fetchData();
      } catch (error) {
        setError("Failed to delete data. Please try again later.");
      }
    }
  };

  const handleCopy = () => {
    const headers = ["#", "Allowance Name", "Category"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.allowance_name || "N/A"}\t${row.category || "N/A"}`
    );
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Allowance Name", "Category"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.allowance_name || "N/A",
      row.category || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Allowance Master", link: "null" },
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
            <CgAddR /> Add Allowance
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Allowance</h2>
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
                    <FormLabel className="labelForm">Allowance Name*</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Allowance Name"
                      value={newAllowanceName}
                      onChange={(e) => {
                        setNewAllowanceName(e.target.value);
                        setError("");
                      }}
                      required
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Category*</FormLabel>
                    <FormSelect
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="ADDITION">ADDITION</option>
                      <option value="SUBTRACTION">SUBTRACTION</option>
                    </FormSelect>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Allowance
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Allowance Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
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

export default dynamic(() => Promise.resolve(AllowanceMasterPage), { ssr: false });
