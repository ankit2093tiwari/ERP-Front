"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { CgAddR } from "react-icons/cg";
import {
  Form,
  Row,
  Col,
  Container,
  FormLabel,
  FormControl,
  Button,
  Breadcrumb,
} from "react-bootstrap";
import axios from "axios";
import Table from "@/app/component/DataTable";
import styles from "@/app/medical/routine-check-up/page.module.css";

const FeeSetting = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFeeSetting, setNewFeeSetting] = useState({
    credit_card_charge: "",
    debit_card_charge: "",
    amex_charge: "",
    editStatus:false
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
    },
    {
      name: "Credit Card Charge",
      selector: (row) => row.credit_card_charge || "N/A",
      sortable: true,
    },
    {
      name: "Debit Card Charge",
      selector: (row) => row.debit_card_charge || "N/A",
      sortable: true,
    },
    {
      name: "AMEX Charge",
      selector: (row) => row.amex_charge || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
        {
          newFeeSetting?.editStatus ? 
          <button className="editButton" onClick={() => handleUpdate(row._id)}>
            <FaSave />
          </button>
          :
          <>
          <button className="editButton" onClick={() => handleEdit(row._id)}>
            <FaEdit />
          </button>
          <button className="editButton btn-danger" onClick={() => handleDelete(row._id)} >
            <FaTrashAlt />
          </button>
         </>
         }
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://erp-backend-fy3n.onrender.com/api/all-fee-settings"
      );
      if (response.data && response.data.length > 0) {
        setData(response.data);
      } else {
        setData([]);
        setError("No records found.");
      }
    } catch (err) {
      setData([]);
      setError("Failed to fetch fee settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (
      newFeeSetting.credit_card_charge.trim() &&
      newFeeSetting.debit_card_charge.trim() &&
      newFeeSetting.amex_charge.trim()
    ) {
      try {
        const response = await axios.post(
          "https://erp-backend-fy3n.onrender.com/api/add-fee-settings",
          newFeeSetting
        );
        setData((prevData) => [...prevData, response.data]);
        setNewFeeSetting({
          credit_card_charge: "",
          debit_card_charge: "",
          amex_charge: "",
        });
        setIsPopoverOpen(false);
        fetchData();
      } catch (err) {
        setError("Failed to add fee setting.");
      }
    } else {
      alert("All fields are required.");
    }
  };

 const handleEdit = () => {
    setNewFeeSetting({... newFeeSetting, editStatus:true})
 }

  const handleUpdate = async (id) => {
    setNewFeeSetting({... newFeeSetting, editStatus:true})
    const feeSetting = data.find((row) => row._id === id);
   

    if (updatedCreditCardCharge && updatedDebitCardCharge && updatedAmexCharge) {
      try {
        await axios.put(
          `https://erp-backend-fy3n.onrender.com/api/update-fee-settings/${id}`,
          {
            credit_card_charge: updatedCreditCardCharge,
            debit_card_charge: updatedDebitCardCharge,
            amex_charge: updatedAmexCharge,
          }
        );
        setData((prevData) =>
          prevData.map((row) =>
            row._id === id
              ? {
                  ...row,
                  credit_card_charge: updatedCreditCardCharge,
                  debit_card_charge: updatedDebitCardCharge,
                  amex_charge: updatedAmexCharge,
                }
              : row
          )
        );
      } catch (err) {
        setError("Failed to update fee setting.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this fee setting?")) {
      try {
        await axios.delete(
          `https://erp-backend-fy3n.onrender.com/api/delete-fee-settings/${id}`
        );
        setData((prevData) => prevData.filter((row) => row._id !== id));
      } catch (err) {
        setError("Failed to delete fee setting.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container className="mt-3">
      <Row className="mt-1 mb-3">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/fee-settings">Fee Settings</Breadcrumb.Item>
            <Breadcrumb.Item active>Manage Fee Settings</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Button
        onClick={() => setIsPopoverOpen(true)}
        className="btn btn-primary mb-4"
      >
        <CgAddR /> Add Fee Setting
      </Button>

      {isPopoverOpen && (
        <div className="cover-sheet">
          <div className="studentHeading">
            <h2>Add New Fee Setting</h2>
            <button
              className="closeForm"
              onClick={() => setIsPopoverOpen(false)}
            >
              X
            </button>
          </div>
          <Form className="formSheet">
            <Row>
              <Col lg={6}>
                <FormLabel>Credit Card Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.credit_card_charge}
                  onChange={(e) =>
                    setNewFeeSetting({
                      ...newFeeSetting,
                      credit_card_charge: e.target.value,
                    })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>Debit Card Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.debit_card_charge}
                  onChange={(e) =>
                    setNewFeeSetting({
                      ...newFeeSetting,
                      debit_card_charge: e.target.value,
                    })
                  }
                />
              </Col>
              <Col lg={6}>
                <FormLabel>AMEX Charge</FormLabel>
                <FormControl
                  type="text"
                  value={newFeeSetting.amex_charge}
                  onChange={(e) =>
                    setNewFeeSetting({
                      ...newFeeSetting,
                      amex_charge: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>
            <Button onClick={handleAdd} className="btn btn-primary mt-3">
              Add Fee Setting
            </Button>
          </Form>
        </div>
      )}

      <div className="tableSheet">
        <h2>Fee Setting Records</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && <Table columns={columns} data={data} />}
      </div>
    </Container>
  );
};

export default dynamic(() => Promise.resolve(FeeSetting), { ssr: false });
