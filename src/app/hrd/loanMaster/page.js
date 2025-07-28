"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from "react-icons/fa";
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
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { copyContent, printContent } from "@/app/utils";
import { toast } from "react-toastify";
import { addNewLoan, deleteLoanById, getAllLoans, updateLoanById } from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const LoanMasterPage = () => {
  const { hasEditAccess, hasSubmitAccess } = usePagePermission()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [newLoanName, setNewLoanName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllLoans()
      setData(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newLoanName.trim()) {
      setError("Loan name is required");
      return;
    }

    const duplicate = data.find(
      (item) => item.LoanName.toLowerCase() === newLoanName.trim().toLowerCase()
    );
    if (duplicate) {
      setError("Loan name already exists");
      return;
    }

    try {
      await addNewLoan({
        LoanName: newLoanName.trim(),
      })
      toast.success("Loan added successfully");
      setNewLoanName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      console.log("failed to add load!", err)
      toast.error("Failed to add loan. Try again.");
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditedName(name);
    setEditError("");
  };

  const handleSave = async (id) => {
    if (!editedName.trim()) {
      setEditError("Loan name is required");
      toast.warn("Loan name is required");
      return;
    }

    const duplicate = data.find(
      (item) =>
        item._id !== id &&
        item.LoanName.toLowerCase() === editedName.trim().toLowerCase()
    );
    if (duplicate) {
      setEditError("Loan name already exists");
      toast.warn("Loan name already exists");
      return;
    }

    try {
      await updateLoanById(id, {
        LoanName: editedName.trim(),
      })
      toast.success("Loan updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update loan. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this loan?")) {
      try {
        await deleteLoanById(id)
        toast.success("Loan deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete loan. Try again.");
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Loan Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => {
              setEditedName(e.target.value);
              setEditError("");
            }}
            isInvalid={!!editError}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(row._id);
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          row.LoanName || "N/A"
        ),
    },
    hasEditAccess && {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-1">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleSave(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => setEditingId(null)}>
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row._id, row.LoanName)}>
                <FaEdit />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handlePrint = () => {
    const headers = [["#", "Loan Name"]];
    const rows = data.map((row, index) => [index + 1, row.LoanName || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Loan Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.LoanName || "N/A"}`);
    copyContent(headers, rows);
  };

  const breadcrumbItems = [
    { label: "HRD", link: "/hrd/allModule" },
    { label: "Loan Master", link: null },
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
            <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
              <CgAddR /> Add Loan
            </Button>
          )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Loan</h2>
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
                    <FormLabel className="labelForm">
                      Loan Name <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Loan Name"
                      value={newLoanName}
                      onChange={(e) => {
                        setNewLoanName(e.target.value);
                        setError("");
                      }}
                      isInvalid={!!error}
                    />
                    {error && <div className="text-danger mt-1 small">{error}</div>}
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Loan
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Loan Records</h2>
            {loading ? (
              <p>Loading...</p>
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

export default dynamic(() => Promise.resolve(LoanMasterPage), { ssr: false });
