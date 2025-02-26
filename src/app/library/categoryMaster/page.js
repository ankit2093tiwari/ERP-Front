"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';

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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/bookCategories");
      setData(response.data.data || []);
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
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/bookCategory/${id}`, {
        groupName: editGroupName,
      });
      setData((prevData) => prevData.map((row) => (row._id === id ? { ...row, groupName: editGroupName } : row)));
      fetchData();
      setEditId(null);
    } catch {
      setError("Failed to update book group.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/bookCategory/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
        fetchData();
      } catch {
        setError("Failed to delete book group.");
      }
    }
  };

  const handleAdd = async () => {
    if (newGroupName.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/bookCategory", {
          groupName: newGroupName,
        });
        setData((prevData) => [...prevData, response.data]);
        setNewGroupName("");
        setIsPopoverOpen(false);
        fetchData();
      } catch {
        setError("Failed to add book group.");
      }
    }
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

  return (
    <Container>
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/library/all-module">Library</Breadcrumb.Item>
            <Breadcrumb.Item active>Book Categories</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary">
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
                  type="text"
                  placeholder="Enter Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-success mt-2">Add</Button>
          </Form>
        </div>
      )}
      
      <h2 className="mt-4">Book Group Records</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && <Table columns={columns} data={data} />}
    </Container>
  );
};

export default dynamic(() => Promise.resolve(BookCategory), { ssr: false });
