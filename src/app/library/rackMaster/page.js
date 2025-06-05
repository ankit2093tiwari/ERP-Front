"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt, FaSave } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';
import { copyContent, printContent } from "@/app/utils";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const RackAndShelfManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rackName: '',
    shelfName: ''
  });

  const [editData, setEditData] = useState({
    rackName: '',
    shelfName: ''
  });

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Rack Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editData.rackName}
          onChange={(e) => setEditData({...editData, rackName: e.target.value})}
        />
      ) : (
        row.rackName || "N/A"
      ),
      sortable: true,
    },
    {
      name: "Shelf Name",
      cell: (row) => editingId === row._id ? (
        <FormControl
          type="text"
          value={editData.shelfName}
          onChange={(e) => setEditData({...editData, shelfName: e.target.value})}
        />
      ) : (
        row.shelfName || "N/A"
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {editingId === row._id ? (
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

  const handlePrint = async () => {
    const tableHeaders = [["#", "Rack Name", "Shelf Name"]];
    const tableRows = data.map((row, index) => [
      index + 1,
      row.rackName || "N/A",
      row.shelfName || "N/A",
    ]);

    printContent(tableHeaders, tableRows);
  };

  const handleCopy = () => {
    const headers = ["#", "Rack Name", "Shelf Name"];
    const rows = data.map((row, index) => 
      `${index + 1}\t${row.rackName || "N/A"}\t${row.shelfName || "N/A"}`
    );

    copyContent(headers, rows);
  };

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/rack-shelf");
      setData(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rack & shelf data.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditData({
      rackName: row.rackName,
      shelfName: row.shelfName
    });
  };

  // Handle save action
  const handleSave = async (id) => {
    if (!editData.rackName && !editData.shelfName) {
      setError("At least one field (Rack Name or Shelf Name) is required");
      return;
    }

    try {
      const response = await axios.put(
        `https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`,
        editData
      );
      
      setData(prevData => 
        prevData.map(row => 
          row._id === id ? response.data.data : row
        )
      );
      setEditingId(null);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update rack/shelf. Please try again.");
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this rack/shelf?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`);
        setData(prevData => prevData.filter(row => row._id !== id));
        fetchData();
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete rack/shelf. Please try again.");
      }
    }
  };

  // Handle add action
  const handleAdd = async () => {
    if (!formData.rackName && !formData.shelfName) {
      setError("At least one field (Rack Name or Shelf Name) is required");
      return;
    }

    try {
      const response = await axios.post(
        "https://erp-backend-fy3n.onrender.com/api/rack-shelf",
        formData
      );
      
      setData(prevData => [...prevData, response.data.data]);
      setFormData({ rackName: '', shelfName: '' });
      setIsPopoverOpen(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add rack/shelf. Please try again.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Library", link: "/library/all-module" }, 
    { label: "Rack & Shelf Master", link: null }
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
          <Button onClick={() => setIsPopoverOpen(true)} className="btn-add">
            <CgAddR /> Add Rack/Shelf
          </Button>

          {isPopoverOpen && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add New Rack/Shelf</h2>
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
                    <FormLabel className="labelForm">Rack Name</FormLabel>
                    <FormControl
                      type="text"
                      name="rackName"
                      placeholder="Enter Rack Name"
                      value={formData.rackName}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Shelf Name</FormLabel>
                    <FormControl
                      type="text"
                      name="shelfName"
                      placeholder="Enter Shelf Name"
                      value={formData.shelfName}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>
                {error && <p className="text-danger">{error}</p>}
                <Button onClick={handleAdd} className="btn btn-primary">
                  Add Rack/Shelf
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet">
            <h2>Rack & Shelf Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
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

export default dynamic(() => Promise.resolve(RackAndShelfManager), { ssr: false });