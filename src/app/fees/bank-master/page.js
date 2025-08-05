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
import usePagePermission from "@/hooks/usePagePermission";


const BankMaster = () => {
  const { hasSubmitAccess, hasEditAccess } = usePagePermission();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBank, setNewBank] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBankName, setEditBankName] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Bank Name",
      selector: (row) => row.bank_name || "N/A",
      sortable:true
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm" variant="success"
            onClick={() => handleEditFormOpen(row._id, row.bank_name)}
          >
            <FaEdit />
          </Button>
          <Button
            size="sm" variant="danger"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllBanks();
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

  const handleEditFormOpen = (id, name) => {
    setEditId(id);
    setEditBankName(name);
    setFieldError("");
    setIsEditPopoverOpen(true);
  };

  const handleUpdateBank = async () => {
    if (!editBankName.trim()) {
      setFieldError("Bank name cannot be empty.");
      return;
    }

    try {
      await updateBankById(editId, { bank_name: editBankName });
      toast.success("Bank updated successfully.");
      setIsEditPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.log("failed to update bank", err);
      toast.error("Failed to update bank.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        await deleteBankById(id);
        toast.success("Bank deleted successfully.");
        fetchData();
      } catch (err) {
        console.log("failed to delete bank", err);
        toast.error("Failed to delete bank.");
      }
    }
  };

  const handleAdd = async () => {
    if (!newBank.trim()) {
      setFieldError("Bank name is required.");
      return;
    } else if (newBank.length < 3 || newBank.length > 50) {
      setFieldError("Bank name must be 3–50 characters.");
      return;
    }

    try {
      await addNewBank({ bank_name: newBank });
      toast.success("Bank added successfully.");
      setNewBank("");
      setIsAddPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.log("failed to add bank", err);
      toast.error("Failed to add bank.");
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Bank Name"]];
    const rows = data.map((row, index) => [index + 1, row.bank_name || "N/A"]);
    printContent(headers, rows);
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
          {hasSubmitAccess && (
            <Button
              onClick={() => {
                setIsAddPopoverOpen(true);
                setFieldError("");
                setNewBank("");
              }}
              className="btn-add"
            >
              <CgAddR /> Add New Bank
            </Button>
          )}

          {isAddPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Bank</h2>
                <button
                  className="closeForm"
                  onClick={() => setIsAddPopoverOpen(false)}
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
                      onChange={(e) => setNewBank(e.target.value)}
                      isInvalid={!!fieldError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Bank
                </Button>
              </Form>
            </div>
          )}

          {isEditPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Edit Bank</h2>
                <button
                  className="closeForm"
                  onClick={() => setIsEditPopoverOpen(false)}
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
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      isInvalid={!!fieldError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldError}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleUpdateBank} className="btn btn-primary mt-3">
                  Update Bank
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
