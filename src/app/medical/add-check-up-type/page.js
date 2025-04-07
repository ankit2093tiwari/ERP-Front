"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Table from "@/app/component/DataTable";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import { Form, Row, Col, Container, FormLabel, FormControl, Button } from "react-bootstrap";
import axios from "axios";
import BreadcrumbComp from "@/app/component/Breadcrumb";

const AddCheckUp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCheckUpType, setNewCheckUpType] = useState("");

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Check-Up Type",
      selector: (row) => row.check_up_type || "N/A",
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/checkup-types");
      setData(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch check-up types.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newCheckUpType.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/checkup-types", {
          check_up_type: newCheckUpType,
        });
        setData((prevData) => [...prevData, response.data]);
        setNewCheckUpType("");
        setShowAddForm(false);
      } catch (error) {
        setError("Failed to add check-up type.");
      }
    } else {
      alert("Please enter a valid check-up type.");
    }
  };

  const handleEdit = async (id) => {
    const item = data.find((row) => row._id === id);
    const updatedName = prompt("Enter new check-up type:", item?.check_up_type || "");
    
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/checkup-types/${id}`, {
          check_up_type: updatedName,
        });
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, check_up_type: updatedName } : row
          )
        );
      } catch (error) {
        setError("Failed to update check-up type.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this check-up type?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/checkup-types/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (error) {
        setError("Failed to delete check-up type.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const breadcrumbItems = [
    { label: "Medical", link: "/medical/all-module" }, 
    { label: "Add CheckUp Type", link: "null" }
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
          <Button onClick={() => setShowAddForm(true)} className="btn-add">
            <CgAddR /> Add Check-Up Type
          </Button>
          
          {showAddForm && (
            <div className="cover-sheet">
              <div className="studentHeading">
                <h2>Add Check-Up Type</h2>
                <button className="closeForm" onClick={() => setShowAddForm(false)}>
                  X
                </button>
              </div>
              <Form className="formSheet">
                <Row>
                  <Col lg={12}>
                    <FormLabel className="labelForm">Check-Up Type</FormLabel>
                    <FormControl
                      type="text"
                      placeholder="Enter Check-Up Type"
                      value={newCheckUpType}
                      onChange={(e) => setNewCheckUpType(e.target.value)}
                    />
                  </Col>
                </Row>
                <Button onClick={handleAdd} className="btn btn-primary mt-3">
                  Add Check-Up Type
                </Button>
              </Form>
            </div>
          )}

          <div className="tableSheet mt-4">
            <h2>Check-Up Type Records</h2>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <Table columns={columns} data={data} />}
          </div>
        </Container>
      </section>
    </>
  );
};

export default dynamic(() => Promise.resolve(AddCheckUp), { ssr: false });