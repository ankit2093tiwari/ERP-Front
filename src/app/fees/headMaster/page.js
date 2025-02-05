"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from 'react-icons/cg';
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const HeadMasterPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newHeadMaster, setNewHeadMaster] = useState({
    head_name: "",
    head_type: "", // Default is empty, can be set to 'Installment Type' or 'Lifetime'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Head Name",
      selector: (row) => row.head_name || "N/A",
      sortable: true,
    },
    {
      name: "Head Type",
      selector: (row) => row.head_type || "N/A",
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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-fee-type"
      );
      if (response.data && response.data.headMasters && response.data.headMasters.length > 0) {
        setData(response.data.headMasters);
      } else {
        setData([]); // Set empty array if no records are found
        setError("No records found.");
      }
    } catch (err) {
      setData([]); // Set empty array if there's an error fetching data
      setError("Failed to fetch HeadMasters.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newHeadMaster.head_name.trim() && newHeadMaster.head_type.trim()) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/add-fee-type",
          newHeadMaster
        );
        setData((prevData) => [...prevData, response.data.headMaster]);
        setNewHeadMaster({ head_name: "", head_type: "" });
        setShowAddForm(false);
        fetchData(); // Fetch data again after adding new headMaster
      } catch (err) {
        setError("Failed to add HeadMaster.");
      }
    } else {
      alert("Both Head Name and Head Type are required.");
    }
  };

  const handleEdit = async (id) => {
    const headMaster = data.find((row) => row._id === id);
    const updatedName = prompt(
      "Enter new head name:",
      headMaster?.head_name || ""
    );
    const updatedType = prompt(
      "Enter new head type (Installment Type or Lifetime):",
      headMaster?.head_type || ""
    );

    if (updatedName && updatedType) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/update-fee-type/${id}`,
          { head_name: updatedName, head_type: updatedType }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id ? { ...row, head_name: updatedName, head_type: updatedType } : row
          )
        );
      } catch (err) {
        setError("Failed to update HeadMaster.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this HeadMaster?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-fee-type/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete HeadMaster.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="">
      <Row className="mt-1 mb-1">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/headmasters">HeadMasters</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage HeadMasters</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        className="btn btn-primary mb-4"
      >
        <CgAddR /> Add HeadMaster
      </Button>

      {showAddForm && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New HeadMaster</h2>
            <button className="closeForm" onClick={() => setShowAddForm(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Head Name</FormLabel>
                <FormControl
                  type="text"
                  value={newHeadMaster.head_name}
                  onChange={(e) =>
                    setNewHeadMaster({ ...newHeadMaster, head_name: e.target.value })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Head Type</FormLabel>
                <FormControl
                  as="select"
                  value={newHeadMaster.head_type}
                  onChange={(e) =>
                    setNewHeadMaster({ ...newHeadMaster, head_type: e.target.value })
                  }
                >
                  <option value="">Select Head Type</option>
                  <option value="Installment Type">Installment Type</option>
                  <option value="Lifetime">Lifetime</option>
                </FormControl>
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add HeadMaster
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>HeadMaster Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(HeadMasterPage), { ssr: false });
