"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { CgAddR } from "react-icons/cg";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { copyContent, printContent } from "@/app/utils";
import { Container, Row, Col, Button, Form, FormLabel, FormControl, Spinner, } from "react-bootstrap";
import Table from "@/app/component/DataTable";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewExpense, deleteExpenseById, getAllExpenses, updateExpenseById } from "@/Services";

const ExpenseEntry = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ date: "", itemName: "", amount: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const breadcrumbItems = [
    { label: "Accounts", link: "/accounts/all-module" },
    { label: "Expense Entry", link: null },
  ];

  useEffect(() => {
    fetchExpenses();
    setForm((prev) => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
  }, []);

  const fetchExpenses = async () => {
    setFetching(true);
    try {
      const res = await getAllExpenses();
      if (res.success) setExpenses(res.data);
      else toast.error(res.message);
    } catch {
      toast.error("Error fetching expenses");
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const errs = {};
    const today = new Date().toISOString().split("T")[0];

    if (!form.date) {
      errs.date = "Date is required";
    } else if (form.date > today) {
      errs.date = "Date cannot be in the future";
    }

    if (!form.itemName || form.itemName.trim().length < 2) {
      errs.itemName = "Item name must be at least 2 characters";
    }

    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 0) {
      errs.amount = "Enter valid amount";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = editId
        ? await updateExpenseById(editId, form)
        : await addNewExpense(form);

      if (res.success) {
        toast.success(res.message);
        setForm({ date: new Date().toISOString().split("T")[0], itemName: "", amount: "", description: "" });
        fetchExpenses();
        setIsPopoverOpen(false);
        setEditId(null);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("failed to save expense", err);
      toast.error(err.response?.data.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await deleteExpenseById(id)
      if (res.success) {
        toast.success(res.message || "Expense deleted successfully!");
        fetchExpenses();
      } else toast.error(res.message);
    } catch (err) {
      console.log("failed to delete expense!", err)
      toast.error("Failed to delete entry");
    }
  };

  const handleEdit = (expense) => {
    setForm({
      date: expense.date.split("T")[0],
      itemName: expense.itemName,
      amount: expense.amount,
      description: expense.description || "",
    });
    setEditId(expense._id);
    setIsPopoverOpen(true);
  };

  const columns = [
    { name: "#", selector: (row, i) => i + 1, width: "60px" },
    { name: "Date", selector: (row) => new Date(row.date).toLocaleDateString() },
    { name: "Item Name", selector: (row) => row.itemName },
    { name: "Amount", selector: (row) => row.amount },
    { name: "Description", selector: (row) => row.description || "-" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="twobuttons d-flex">
          <Button variant="success" size="sm" className="me-2" onClick={() => handleEdit(row)}>
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)}>
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const handleCopy = () => {
    const headers = [
      "#", "Date", "Item Name", "Amount", "Description",
    ]
    const rows = expenses.map((row, index) => {
      return [
        index + 1,
        row.date?.split("T")[0] || "",
        row.itemName || "N/A",
        row.amount || "N/A",
        row.description || "N/A"
      ].join("\t");
    })
    copyContent(headers, rows)
  }
  const handlePrint = () => {
    const headers = [
      ["#", "Date", "Item Name", "Amount", "Description"],
    ]
    const rows = expenses.map((row, index) => ([
      index + 1,
      row.date?.split("T")[0] || "",
      row.itemName || "N/A",
      row.amount || "N/A",
      row.description || "N/A"
    ]))
    printContent(headers, rows)
  }

  return (
    <>
      <div className="breadcrumbSheet">
        <Container>
          <Row>
            <Col><BreadcrumbComp items={breadcrumbItems} /></Col>
          </Row>
        </Container>
      </div>

      <section>
        <Container>
          <Button onClick={() => {
            setForm({ date: new Date().toISOString().split("T")[0], itemName: "", amount: "", description: "" });
            setEditId(null);
            setIsPopoverOpen(true);
          }} className="btn-add">
            <CgAddR /> New Expense
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>{editId ? "Edit Expense" : "Add Expense"}</h2>
                <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
              </div>
              <Form className="formSheet" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <FormLabel>Date <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      isInvalid={!!errors.date}
                    />
                    <FormControl.Feedback type="invalid">{errors.date}</FormControl.Feedback>
                  </Col>
                  <Col md={6}>
                    <FormLabel>Item Name <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="text"
                      name="itemName"
                      value={form.itemName}
                      onChange={handleChange}
                      isInvalid={!!errors.itemName}
                    />
                    <FormControl.Feedback type="invalid">{errors.itemName}</FormControl.Feedback>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <FormLabel>Description</FormLabel>
                    <FormControl
                      as="textarea"
                      rows={2}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <FormLabel>Amount <span className="text-danger">*</span></FormLabel>
                    <FormControl
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      isInvalid={!!errors.amount}
                    />
                    <FormControl.Feedback type="invalid">{errors.amount}</FormControl.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : editId ? "Update" : "Submit"}
                    </Button>
                    <Button variant="secondary" className="ms-2" onClick={() => setIsPopoverOpen(false)}>Cancel</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Expense Records</h2>
            {fetching ? <p>Loading...</p> : <Table columns={columns} data={expenses} handleCopy={handleCopy} handlePrint={handlePrint} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(ExpenseEntry), { ssr: false });