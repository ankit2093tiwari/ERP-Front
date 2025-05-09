"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddGalleryGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    groupName: ""
  });
  const [editFormData, setEditFormData] = useState({
    groupName: ""
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "80px",
      sortable: false,
    },
    {
      name: "Group Name",
      cell: (row) =>
        editingId === row._id ? (
          <FormControl
            type="text"
            value={editFormData.groupName}
            onChange={(e) => setEditFormData({...editFormData, groupName: e.target.value})}
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
          {editingId === row._id ? (
            <>
              <button
                className="editButton"
                onClick={() => handleUpdate(row._id)}
              >
                <FaSave />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="editButton"
                onClick={() => handleEdit(row)}
              >
                <FaEdit />
              </button>
              <button
                className="editButton btn-danger"
                onClick={() => handleDelete(row._id)}
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/galleryGroups");
      setData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch gallery groups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group) => {
    setEditingId(group._id);
    setEditFormData({
      groupName: group.groupName || ""
    });
  };

  const handleUpdate = async (id) => {
    if (!editFormData.groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    
    try {
      await axios.put(`https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`, editFormData);
      fetchData();
      setEditingId(null);
      // setSuccessMessage("Group updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update gallery group. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this gallery group?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/galleryGroups/${id}`);
        fetchData();
        // setSuccessMessage("Group deleted successfully!");
      } catch (error) {
        console.error("Error deleting data:", error);
        setError("Failed to delete gallery group. Please try again later.");
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    try {
      const existingGroup = data.find(
        (group) => group.groupName.toLowerCase() === formData.groupName.toLowerCase()
      );
      if (existingGroup) {
        setError("Group with this name already exists.");
        return;
      }

      await axios.post("https://erp-backend-fy3n.onrender.com/api/galleryGroups", formData);
      fetchData();
      setFormData({
        groupName: ""
      });
      setIsPopoverOpen(false);
      // setSuccessMessage("Group added successfully!");
    } catch (error) {
      console.error("Error adding data:", error);
      setError("Failed to add gallery group. Please try again later.");
    }
  };

  const handlePrint = () => {
    const tableHeaders = [["#", "Group Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.groupName || "N/A",
    ]);
    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Group Name"];
    const rows = data.map((row, index) =>
      `${index + 1}\t${row.groupName || "N/A"}`
    );
    copyContent(headers, rows);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Gallery", link: "/gallery/all-module" },
    { label: "Add Group", link: "null" },
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
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Button
            onClick={() => setIsPopoverOpen(true)}
            className="btn-add"
          >
            <CgAddR /> Add Gallery Group
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Gallery Group</h2>
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
                  <Col lg={12}>
                    <FormLabel className="labelForm">Group Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Group Name"
                      value={formData.groupName}
                      onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Group
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Gallery Groups</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
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

export default dynamic(() => Promise.resolve(AddGalleryGroup), { ssr: false });