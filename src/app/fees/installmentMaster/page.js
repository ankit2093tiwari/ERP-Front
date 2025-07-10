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
  Button
} from "react-bootstrap";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { toast } from "react-toastify";
import {
  addNewInstallment,
  deleteInstallmentById,
  getAllInstallments,
  updateInstallmentById
} from "@/Services";
import usePagePermission from "@/hooks/usePagePermission";

const InstallmentMaster = () => {
const {hasSubmitAccess,hasEditAccess}=usePagePermission()

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newInstallment, setNewInstallment] = useState("");
  const [newError, setNewError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllInstallments();
      if (response.success) {
        setData(response.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch installments.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newInstallment.trim()) {
      setNewError("Installment name is required");
      return;
    }
    try {
      const response = await addNewInstallment({ installment_name: newInstallment });
      toast.success(response?.message || "Installment added successfully");
      fetchData();
      setNewInstallment("");
      setIsPopoverOpen(false);
      setNewError("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add installment.");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditedName(row.installment_name);
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) {
      toast.warning("Installment name cannot be empty");
      return;
    }
    try {
      const response = await updateInstallmentById(id, { installment_name: editedName });
      toast.success(response?.message || "Installment updated successfully");
      fetchData();
      setEditingId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update installment.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this installment?")) {
      try {
        const response = await deleteInstallmentById(id);
        toast.success(response?.message || "Installment deleted successfully");
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete installment.");
      }
    }
  };

  const handlePrint = () => {
    const headers = [["#", "Installment Name"]];
    const rows = data.map((row, index) => [index + 1, row.installment_name || "N/A"]);
    printContent(headers, rows);
  };

  const handleCopy = () => {
    const headers = ["#", "Installment Name"];
    const rows = data.map((row, index) => `${index + 1}\t${row.installment_name || "N/A"}`);
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Installment Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            isInvalid={!editedName.trim()}
          />
        ) : (
          row.installment_name || "N/A"
        ),
      sortable: true,
    },
    hasEditAccess &&{
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
            <>
              <button className="editButton" onClick={() => handleUpdate(row._id)}>
                <FaSave />
              </button>
              <button className="editButton btn-danger" onClick={() => handleDelete(row._id)}>
                <FaTrashAlt />
              </button>
            </>
          ) : (
            <>
              <button className="editButton" onClick={() => handleEdit(row)}>
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

  const breadcrumbItems = [
    { label: "Fee", link: "/fees/all-module" },
    { label: "Installment Master", link: "null" }
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
         {hasSubmitAccess &&(
           <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Installment
          </Button>
         )}

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Installment</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Installment Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Installment Name"
                      value={newInstallment}
                      isInvalid={!!newError}
                      onChange={(e) => {
                        setNewInstallment(e.target.value);
                        if (newError) setNewError("");
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {newError}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Installment
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Installment Records</h2>
            {loading ? <p>Loading...</p> : (
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

export default dynamic(() => Promise.resolve(InstallmentMaster), { ssr: false });