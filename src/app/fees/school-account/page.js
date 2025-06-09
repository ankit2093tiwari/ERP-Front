"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";

const SchoolAccount = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newAccount, setNewAccount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedAccount, setEditedAccount] = useState("");

  const API_BASE = "https://erp-backend-fy3n.onrender.com/api";

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE}/all-schoolAccount`);
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch school accounts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAccount.trim()) {
      setError("School account name cannot be empty");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/create-schoolAccount`, {
        school_account: newAccount,
      });
      setNewAccount("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding account:", error);
      setError(error.response?.data?.message || "Failed to add school account");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedAccount(row.school_account);
  };

  const handleUpdate = async (id) => {
    if (!editedAccount.trim()) {
      setError("School account name cannot be empty");
      return;
    }

    try {
      await axios.put(`${API_BASE}/update-schoolAccount/${id}`, {
        school_account: editedAccount,
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Error updating account:", error);
      setError(error.response?.data?.message || "Failed to update school account");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        await axios.delete(`${API_BASE}/delete-schoolAccount/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting account:", error);
        setError("Failed to delete school account");
      }
    }
  };

  const handleCopy = () => {
    const headers = ["#", "School Account"];
    const rows = data.map((row, index) => `${index + 1}\t${row.school_account || "N/A"}`);
    copyContent(headers, rows);
  };

  const handlePrint = () => {
    const headers = [["#", "School Account"]];
    const rows = data.map((row, index) => [index + 1, row.school_account || "N/A"]);
    printContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "80px",
    },
    {
      name: "School Account",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedAccount}
            onChange={(e) => setEditedAccount(e.target.value)}
            className="inline-edit-input"
          />
        ) : (
          row.school_account || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <Button variant="success" size="sm" onClick={() => handleUpdate(row._id)}>
              <FaSave />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => handleEdit(row)}>
              <FaEdit />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "School Account", link: null },
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
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New School Account</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={12}>
                    <FormLabel>School Account</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter School Account"
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add
                </Button>
                {error && <p className="text-danger mt-2">{error}</p>}
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>School Account Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
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

export default dynamic(() => Promise.resolve(SchoolAccount), { ssr: false });
