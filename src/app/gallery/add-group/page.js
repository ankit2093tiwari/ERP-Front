"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Form,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";

const AddGalleryGroup = () => {
  const [data, setData] = useState([]); // Gallery group data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [showAddForm, setShowAddForm] = useState(false); // Toggle add form visibility
  const [newGroup, setNewGroup] = useState({ groupName: "" }); // Form values

  // Fetch gallery groups
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/galleryGroups"
      );
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch gallery groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add new group
  const handleAdd = async () => {
    if (!newGroup.groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/galleryGroups",
        newGroup
      );
      setData([...data, response.data]);
      setNewGroup({ groupName: "" });
      setShowAddForm(false);
      setSuccessMessage("Group added successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to add group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit group
  const handleEdit = async (id) => {
    const group = data.find((item) => item._id === id);
    const updatedName = prompt("Enter new group name:", group?.groupName || "");
    if (!updatedName) return;

    setLoading(true);
    try {
      await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`,
        { groupName: updatedName }
      );
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, groupName: updatedName } : item
        )
      );
      setSuccessMessage("Group updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete group
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    setLoading(true);
    try {
      await axios.delete(
        `https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`
      );
      setData((prevData) => prevData.filter((item) => item._id !== id));
      setSuccessMessage("Group deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table columns
  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Group Name",
      selector: (row) => row.groupName || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
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

  return (
    <Container>
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Gallery Groups</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col>
          <Button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="mb-4"
          >
            <FaPlus /> Add Group
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <h2>Add Gallery Group</h2>
              <Form>
                <Row className="mb-3">
                  <Col lg={6}>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={newGroup.groupName}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          groupName: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button onClick={handleAdd} className="btn btn-primary mt-4">
                      Add Group
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="tableSheet">
            <h2>Gallery Groups</h2>
            {loading ? (
              <p>Loading...</p>
            ) : data.length > 0 ? (
              <Table columns={columns} data={data} />
            ) : (
              <p>No groups available.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(AddGalleryGroup), { ssr: false });
