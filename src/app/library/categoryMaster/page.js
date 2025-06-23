"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb, Alert } from "react-bootstrap";
import { CgAddR } from 'react-icons/cg';
import { copyContent,printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";
import { addNewBookCategory, deleteBookCategoryById, getBookCategories, updateBookCategoryById } from "@/Services";
import { toast } from "react-toastify";

const BookCategory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getBookCategories()
      setData(response?.data || []);
    } catch (err) {
      setError("Failed to fetch book groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditGroupName(row.groupName);
  };

  const handleSave = async (id) => {
    try {
      const response = await updateBookCategoryById(id, {
        groupName: editGroupName,
      })
      toast.success(response?.message || "BookCategory Updated successfully!")
      fetchData();
      setEditId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update category..")
      setError("Failed to update book group.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        const response = await deleteBookCategoryById(id)
        toast.success(response?.message || "BookCategory deleted successfully!")
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete category..")
        setError("Failed to delete book group.");
      }
    }
  };

  const handleAdd = async () => {
    const trimmedName = newGroupName.trim();

    // 💡 Validation
    if (!trimmedName) {
      toast.error("Group name is required.");
      return;
    }

    if (trimmedName.length > 50) {
      toast.error("Group name must be under 50 characters.");
      return;
    }

    const exists = data.some(
      (item) => item.groupName.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      toast.error("Group name already exists.");
      return;
    }

    try {
      const response = await addNewBookCategory({ groupName: trimmedName });
      toast.success(response?.message || "BookCategory added successfully!");
      setNewGroupName("");
      setIsPopoverOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add book category.");
    }
  };


  const handlePrint = async () => {
    const tableHeaders = [["#", "Group Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.groupName || "N/A",
    ]);

    printContent(tableHeaders, tableRows);

  };

  const handleCopy = () => {
    const headers = ["#", "Group Name"].join("\t");
    const rows = data.map((row, index) => `${index + 1}\t${row.groupName || "N/A"}`).join("\n");

    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "80px" },
    {
      name: "Group Name",
      selector: (row) =>
        editId === row._id ? (
          <FormControl
            type="text"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
          />
        ) : (
          row.groupName || "N/A"
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editId === row._id ? (
            <button className="editButton" onClick={() => handleSave(row._id)}>
              <FaSave />
            </button>
          ) : (
            <button className="editButton" onClick={() => handleEdit(row)}>
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

  const breadcrumbItems = [{ label: "Library", link: "/library/all-module" }, { label: "Category Master", link: "null" }]

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
            <CgAddR /> Add Book Group
          </Button>
          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Group</h2>
                <button className='closeForm' onClick={() => setIsPopoverOpen(false)}> X </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl
                      required
                      type="text"
                      placeholder="Enter Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-success mt-2">Add Group</Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Book Group Records</h2>
            {loading && <p>Loading...</p>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && (
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

export default dynamic(() => Promise.resolve(BookCategory), { ssr: false });