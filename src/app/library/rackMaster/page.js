"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "@/app/medical/routine-check-up/page.module.css";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Form, Row, Col, Container, FormLabel, FormControl, Button, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { CgAddR } from 'react-icons/cg';
import BreadcrumbComp from "@/app/component/Breadcrumb";

const RackAndShelfManager = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRackName, setNewRackName] = useState("");
  const [newShelfName, setNewShelfName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/rack-shelf");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newRackName.trim() || newShelfName.trim()) {
      try {
        const payload = { rackName: newRackName, shelfName: newShelfName };
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/rack-shelf", payload);
        setData((prevData) => [...prevData, response.data]);
        setNewRackName("");
        setNewShelfName("");
        setShowAddForm(false);
      } catch (error) {
        setError("Failed to add data.");
      }
    } else {
      alert("Please enter valid details for rack or shelf.");
    }
  };

  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedRackName = prompt("Enter new rack name:", item?.rackName || "");
    const updatedShelfName = prompt("Enter new shelf name:", item?.shelfName || "");

    if (updatedRackName || updatedShelfName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`, {
          rackName: updatedRackName || item.rackName,
          shelfName: updatedShelfName || item.shelfName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id
              ? { ...row, rackName: updatedRackName || row.rackName, shelfName: updatedShelfName || row.shelfName }
              : row
          )
        );
      } catch (error) {
        setError("Failed to update data.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/rack-shelf/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        setError("Failed to delete data.");
      }
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Rack Name",
      selector: (row) => row.rackName || "N/A",
      sortable: true,
    },
    {
      name: "Shelf Name",
      selector: (row) => row.shelfName || "N/A",
      sortable: true,
    },
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

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [{ label: "Library", link: "/library/all-module" }, { label: "Rack Master", link: "null" }]

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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Rack / Shelf
          </Button>
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Rack / Shelf</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Rack Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Rack Name"
                      value={newRackName}
                      onChange={(e) => setNewRackName(e.target.value)}
                    />
                  </Col>
                  <Col lg={6}>
                    <FormLabel className="labelForm">Shelf Name</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Shelf Name"
                      value={newShelfName}
                      onChange={(e) => setNewShelfName(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Rack / Shelf
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Rack & Shelf Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(RackAndShelfManager), { ssr: false });