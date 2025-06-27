"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import { addNewBank, deleteBankById, getAllBanks, updateBankById } from "@/Services";

const BankMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBank, setNewBank] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Bank Name",
      selector: (row) => row.bank_name || "N/A",
      cell: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        ) : (
          row.bank_name
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button
              className="editButton btn-success"
              onClick={() => handleSave(row._id)}
            >
              <FaSave />
            </button>
          ) : (
            <button
              className="editButton"
              onClick={() => handleEdit(row._id, row.bank_name)}
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllBanks()
      if (response.success) {
        setData(response.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setError("Failed to fetch banks.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditedName(name);
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      toast.error("Bank name cannot be empty.");
      return;
    }

    try {
      const res = await updateBankById(id, {
        bank_name: editedName,
      })
      toast.success("Bank name updated successfully.");
      fetchData();
      setEditId(null);
    } catch (err) {
      console.log("failed to update bank", err);
      toast.error("Failed to update bank.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        await deleteBankById(id)
        toast.success("Bank deleted successfully.");
        fetchData();
      } catch (err) {
        console.log("failed to delete bank", err);
        toast.error("Failed to delete bank.");
      }
    }
  };

  const handleAdd = async () => {
    // Simple validation
    if (!newBank.trim()) {
      setFieldError("Bank name is required.");
      return;
    } else if (newBank.length < 3 || newBank.length > 50) {
      setFieldError("Bank name must be 3–50 characters.");
      return;
    }

    setFieldError("");

    try {
      const response = await addNewBank({ bank_name: newBank })
      toast.success("Bank added successfully.");
      setNewBank("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.log("failed to add bank", err);
      toast.error("Failed to add bank.");
    }
  };

  const handlePrint = async () => {
    const tableHeaders = [["#", "Bank Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.bank_name || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Bank Name"];
    const rows = data.map(
      (row, index) => `${index + 1}\t${row.bank_name || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "bank-master", link: "null" },
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
            onClick={() => {
              setIsPopoverOpen(true);
              setFieldError("");
              setNewBank("");
            }}
            className="btn-add"
          >
            <CgAddR /> Add New Bank
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Bank</h2>
                <button
                  className="closeForm"
                  onClick={() => setIsPopoverOpen(false)}
                >
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Bank Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Bank Name"
                      value={newBank}
                      onChange={(e) => {
                        setNewBank(e.target.value);
                        if (fieldError) setFieldError("")
                      }}
                      isInvalid={!!fieldError}
                    />

                    <Form.Control.Feedback type="invalid">{fieldError}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Bank
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Bank Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
              <Table
                columns={columns}
                data={data}
                handlePrint={handlePrint}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(BankMaster), { ssr: false });