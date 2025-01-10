"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
} from "react-bootstrap";
import axios from "axios";

const BookCategory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ groupName: "" });

  const columns = [
    { name: "#", selector: (row, index) => index + 1, sortable: false, width: "80px" },
    { name: "Group Name", selector: (row) => row.groupName || "N/A", sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/bookCategories");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch book groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newGroup.groupName) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/bookCategory", newGroup);
        setData((prevData) => [...prevData, response.data]);
        setNewGroup({ groupName: "" });
        setShowAddForm(false);
      } catch {
        setError("Failed to add book group.");
      }
    } else {
      alert("Group Name is required.");
    }
  };

  const handleEdit = async (id) => {
    const group = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new group name:", group?.groupName || "");

    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/bookCategory/${id}`, {
          groupName: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, groupName: updatedName } : row
          )
        );
      } catch {
        setError("Failed to update book group.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this group?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/bookCategory/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch {
        setError("Failed to delete book group.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className={styles.formContainer}>
      <Form className={styles.form}>
        <Button onClick={() => setShowAddForm(!showAddForm)} className={`mb-4 ${styles.search}`}>
          Add Book Group
        </Button>
        {showAddForm && (
          <div className="mb-4">
            <Row>
              <Col lg={6}>
                <FormLabel>Group Name</FormLabel>
                <FormControl
                  type="text"
                  value={newGroup.groupName}
                  onChange={(e) => setNewGroup({ groupName: e.target.value })}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className={styles.search}>
              Add Book Group
            </Button>
          </div>
        )}
        <h2>Book Group Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </Form>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(BookCategory), { ssr: false });
