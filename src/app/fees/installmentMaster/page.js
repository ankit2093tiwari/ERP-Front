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

const InstallmentMaster = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newInstallment, setNewInstallment] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Installment Name",
      selector: (row) => row.installment_name || "N/A",
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
      const response = await axios.get("https://erp-backend-fy3n.onrender.com/api/all-installments");
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch installments.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    const installment = data.find((row) => row._id === id);
    const updatedName = prompt(
      "Enter new installment name:",
      installment?.installment_name || ""
    );
    if (updatedName) {
      try {
        await axios.put(`https://erp-backend-fy3n.onrender.com/api/update-installments/${id}`, {
          installment_name: updatedName
        });
        setData((prevData) =>
          prevData.map((row) => (row._id === id ? { ...row, installment_name: updatedName } : row))
        );
      } catch (err) {
        setError("Failed to update installment.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this installment?")) {
      try {
        await axios.delete(`https://erp-backend-fy3n.onrender.com/api/delete-installments/${id}`);
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete installment.");
      }
    }
  };

  const handleAdd = async () => {
    if (newInstallment.trim()) {
      try {
        const response = await axios.post("https://erp-backend-fy3n.onrender.com/api/add-installments", {
          installment_name: newInstallment
        });
        setData((prevData) => [...prevData, response.data]);
        setNewInstallment("");
        setIsPopoverOpen(false);
        fetchData();
      } catch (err) {
        setError("Failed to add installment.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="">
      <Row className='mt-1 mb-1'>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/installments">Installments</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Installments</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button onClick={() => setIsPopoverOpen(true)} className="btn btn-primary">
        <CgAddR /> Add Installment
      </Button>

      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Installment</h2>
            <button className="closeForm" onClick={() => setIsPopoverOpen(false)}>X</button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Installment Name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Enter Installment Name"
                  value={newInstallment}
                  onChange={(e) => setNewInstallment(e.target.value)}
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary">
              Add Installment
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Installment Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(InstallmentMaster), { ssr: false });
